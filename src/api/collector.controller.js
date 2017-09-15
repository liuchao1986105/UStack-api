import Promise from 'bluebird';
import { Collector } from '../models/collector';
import { Area } from '../models/area';
import { Device } from '../models/device';
import { swallow } from '../utils/decorators';
import CollectorService from '../service/collector.service';
import config from '../config/env';
import validate from '../utils/tools/validator';
import Xml from '../utils/mqtt/xml';
import _ from 'lodash';
import moment from 'moment';

export default class CollectorController {
  @swallow
  static async getCollector(req, res, next) {
    //const collector = await Collector.findByIdAsync(req.params.collector_id);
    let collector = await Collector.findById(req.params.collector_id).populate([
      {path: 'projectId', model: 'Project'},
      {path: 'areaId', model: 'Area'}
    ]).exec();

    //collector = await collector.populate({path: 'devices.deviceTypeId', model: 'DeviceType'}).execPopulate();
    res.json({success: true, data: collector});
  }

  @swallow
  static async addCollector(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '采集器名称不能为空 ');
    //error += validate.validateAlphanumeric(req.body.fac_id, '出厂编码必须由字母和数字组成' ,13, '出厂编码编码必须为13位 ');
    //error += validate.validateNumeric(req.body.order, '采集器编号每位必须是数字 ' ,2, '采集器编号必须为2位 ');
    
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    req.body.userId = req.user._id;
    //order
    req.body.order = req.body.gateway_id.substring(req.body.gateway_id.length-2);

    let collector = await Collector.createAsync(req.body);

    //把collector的collector._id更新到device的collectorId字段中
    // await Promise.map(req.body.devices, (device, index) => {
    //   device.collectorId = collector._id;
    //   return device.saveAsync();
    // });

    //把collector的collector._id更新到area的collectors
    if(req.body.areaId){
      await Area.findByIdAndUpdateAsync(req.body.areaId, {$addToSet: {collectors: collector._id}});
      //{$addToSet:{books:{$each:[“JS”,”DB”]}}}
    }

    return res.status(200).json({ success: true, data:collector});
  }

  @swallow
  static async updateCollector(req, res, next){
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '采集器名称不能为空 ');
    
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const collector = await Collector.findByIdAsync(req.params.collector_id);
    
    if(collector.period != req.body.period){
      //下发指令
      const obj = {
        common:{
          gateway_id: req.body.gateway_id,
          fac_id: req.body.fac_id,
          type: 'period'
        },
        config:
          {
            "$": 
              {
                "operation":"period"
              },
            period:req.body.period
          }
      };

      const xml = Xml.buildXml(obj);
      global.logger.info("config collector period:"+xml)

      //下发指令
      const client = global.subscribeClients[req.body.collectorStr];
      client.connection._events.publish({topic: 'config_period', payload: xml});
    }

    if(collector.areaId){
      await Area.findByIdAndUpdateAsync(collector.areaId, {$pull: {collectors: collector._id}});
    }
    if(req.body.areaId){
      await Area.findByIdAndUpdateAsync(req.body.areaId, {$addToSet: {collectors: collector._id}});
    }

    //order
    req.body.order = req.body.gateway_id.substring(req.body.gateway_id.length-2);
    const collect = await Collector.findByIdAndUpdateAsync(req.params.collector_id, req.body, {new:true});

    return res.status(200).send({success: true, data:collect});
  }

  @swallow
  static async deleteCollector(req, res, next) {
    const collector = await Collector.findByIdAndUpdateAsync(req.params.collector_id, {$set: {active: false}});

    Area.find({
      collectors: { '$all': [req.params.collector_id] }
    }).limit(0).batchSize(100).stream().on('data', (area) => {
      CollectorService._deleteCollectorIdFromArea(area._id, req.params.collector_id);
    }).on('error', (err) => {
      global.logger.error(err);
    }).on('close', () => {
      global.logger.info('_deleteCollectorIdFromArea stream closed');
    });

    //删除device上绑定的collector
    Device.find({
      collectorId: req.params.collector_id
    }).limit(0).batchSize(100).stream().on('data', (device) => {
      CollectorService._deleteCollectorIdFromDevice(device._id);
    }).on('error', (err) => {
      global.logger.error(err);
    }).on('close', () => {
      global.logger.info('_deleteCollectorIdFromDevice stream closed');
    });


    return res.status(200).send({success: true, collector_id: collector._id});
  }

 

  @swallow
  static async getCollectors(req, res, next) {
    const query = {active: true};
    if(req.query.projectId){
      query.projectId = req.query.projectId
    }

    // if(req.query.position){
    //   query.position = new RegExp(req.query.position, 'i');
    // }

    if(req.query.userId){
      query.userId = req.query.userId
    }


    let result = await Collector.paginate(query, {
      populate: [
        {path: 'projectId', model: 'Project'},
        {path: 'areaId', model: 'Area'}
      ],
      page: parseInt(req.query.page, 10) || 1,
      limit: Number(req.query.limit) || config.maxLimit,
      sort: {
        projectId: 1,
        order:1,
        created_at: -1
      }
    })

    res.json({
      data: result.docs,
      count: result.pages,
      total: result.total 
    });
  }
}
