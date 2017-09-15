import Promise from 'bluebird';
import { Area } from '../models/area';
import { Device } from '../models/device';
import { AreaType } from '../models/areaType';
import { swallow } from '../utils/decorators';
import config from '../config/env';
import validate from '../utils/tools/validator';
import _ from 'lodash';

export default class AreaController {
  @swallow
  static async getArea(req, res, next) {
    let area = await Area.findById(req.params.area_id).populate([
      {path: 'projectId', model: 'Project', select: 'title'},
    ]).exec();

    res.json({success: true, data: area});
  }

  @swallow
  static async addArea(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '名称不能为空 ');
    error += validate.validateEmptyOrNull(req.body.areaTypeId, '场景类型不能为空 ');
    // error += validate.validateNumeric(req.body.government_id, '行政区号每位必须是数字 ' ,6, '行政区号必须为6位 ');
    // error += validate.validateAlpha(req.body.type, '建筑类别必须是字符 ' ,1, '建筑类别必须为1位 ');
    // error += validate.validateNumeric(req.body.build_verify_id, '建筑识别编码每位必须是数字 ' ,5, '建筑识别编码必须为5位 ');
    
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    req.body.userId = req.user._id;
    let area = await Area.createAsync(req.body);

    //把area的area_id更新到device的areaId字段中
    // if(req.body.devices && req.body.devices.length > 0){
    //   await Promise.map(req.body.devices, (device, index) => {
    //     device.areaId.addToSet(area);
    //     return device.saveAsync();
    //   });
    // }

    //如果存在父area的话，要往父area的subareas里push
    if(req.body.parentAreaId){
      await Area.findByIdAndUpdateAsync(req.body.parentAreaId, {$addToSet: {subareas: area._id}});
    }

    return res.status(200).json({ success: true, data:area});
  }

  @swallow
  static async updateArea(req, res, next){
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '场景名称不能为空 ');
    error += validate.validateEmptyOrNull(req.body.areaTypeId, '场景类型不能为空 ');
    
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const area = await Area.findByIdAsync(req.params.area_id);

    if(area.areaTypeId != req.body.areaTypeId){
      //根据areaTypeId 找到相应的areaType 
      const areaType = await AreaType.findByIdAsync(req.body.areaTypeId);
      req.body.areaType = areaType.title;
    }

    if(area.parentAreaId){
      //if(!req.body.parentAreaId || req.body.parentAreaId != area.parentAreaId){
        await Area.findByIdAndUpdateAsync(area.parentAreaId, {$pull: {subareas: area._id}});
      //}
    }
    if(req.body.parentAreaId){
      await Area.findByIdAndUpdateAsync(req.body.parentAreaId, {$addToSet: {subareas: area._id}});
    }

    const newArea = await Area.findByIdAndUpdateAsync(req.params.area_id, req.body, {new:true});

    return res.status(200).send({success: true, data:newArea});
  }

  @swallow
  static async deleteArea(req, res, next) {
    const area = await Area.findByIdAndUpdateAsync(req.params.area_id, {$set: {active: false}});

    //找到所有包含这个area_id的devices，并从area_id中删除掉
    Device.find({
      areaId: { '$all': [req.params.area_id] }
    }).limit(0).batchSize(100).stream().on('data', (device) => {
      AreaController._deleteAreaIdFromDevice(device._id, req.params.area_id);
    }).on('error', (err) => {
      global.logger.error(err);
    }).on('close', () => {
      global.logger.info('_deleteAreaIdFromDevice stream closed');
    });

    Area.find({
      subareas: { '$all': [req.params.area_id] }
    }).limit(0).batchSize(100).stream().on('data', (area) => {
      AreaController._deleteAreaIdFromSubAreas(area._id, req.params.area_id);
    }).on('error', (err) => {
      global.logger.error(err);
    }).on('close', () => {
      global.logger.info('_deleteAreaIdFromSubAreas stream closed');
    });

    //还要从device中的areaId中删除
    return res.status(200).send({success: true, area_id: area._id});
  }

   @swallow
  static async _deleteAreaIdFromDevice(device_id, area_id) {
    await Device.findByIdAndUpdateAsync(device_id, {$pull: {areaId: area_id}});
  }

  @swallow
  static async _deleteAreaIdFromSubAreas(parent_id, area_id) {
    await Area.findByIdAndUpdateAsync(parent_id, {$pull: {subareas: area_id}});
  }

  @swallow
  static async getAreas(req, res, next) {
    const query = {active: true};
    if(req.query.projectId){
      query.projectId = req.query.projectId
    }

    if(req.query.userId){
      query.userId = req.query.userId
    }

    let result = await Area.paginate(query, {
      populate: [
         {path: 'projectId', model: 'Project', select: 'title'},
         {path: 'collectors', model: 'Collector', select: 'title'},
         {path: 'subareas', model: 'Area', select: 'title'},
         {path: 'areaTypeId', model: 'AreaType', select: 'title'},
      ],
      page: parseInt(req.query.page, 10) || 1,
      limit: Number(req.query.limit) || config.maxLimit,
      sort: {
        projectId: 1,
        created_at: -1
      }
    })
    // const opts = [
    //   {path: 'devices.deviceTypeId', model: 'DeviceType'},
    // ];

    // const areas = await Area.populateAsync(result.docs, opts);

    res.json({
      data: result.docs,
      count: result.pages,
      total: result.total 
    });
  }

}
