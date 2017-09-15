import Promise from 'bluebird';
import { DeviceType } from '../models/deviceType';
import { swallow } from '../utils/decorators';
import validate from '../utils/tools/validator';
import _ from 'lodash';
import config from '../config/env';

export default class DeviceTypeController {
  @swallow
  static async getDeviceType(req, res, next) {
    const devicetype = await DeviceType.findByIdAsync(req.params.devicetype_id);
    res.json({success: true, data: devicetype});
  }

  @swallow
  static async addDeviceType(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '设备类型不能为空 ');
    error += validate.validateEmptyOrNull(req.body.typeNum, '设备类型编号不能为空 ');
    error += await validate.validateExist('typeNum', req.body.typeNum, '该类型编号已经存在 ', DeviceType);

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const devicetype = await DeviceType.createAsync(req.body);
    return res.status(200).json({ success: true, data:devicetype});
  }


  @swallow
  static async updateDeviceType(req, res, next){
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '设备类型不能为空 ');
    error += validate.validateEmptyOrNull(req.body.typeNum, '设备类型编号不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const devicetype = await DeviceType.findByIdAndUpdateAsync(req.params.devicetype_id , req.body, {new:true});
    return res.status(200).send({success: true, data: devicetype});
  }

  @swallow
  static async deleteDeviceType(req, res, next) {
    let devicetype = await DeviceType.findByIdAndUpdateAsync(req.params.devicetype_id, {$set: {active: false}});
    return res.status(200).send({success: true, devicetype_id: devicetype._id});
  }

  @swallow
  static async getDeviceTypes(req, res, next) {
    const query = {active: true};

    const  result = await DeviceType.paginate(query,
      {
        populate: [
          {path: 'sensortypes', model: 'SensorType'}
        ],
        page: parseInt(req.query.page, 10) || 1,
        limit: Number(req.query.limit) || config.maxLimit,
        sort: {
          created_at: -1,
        },
      });

    return res.json({
      data: result.docs,
      count: result.pages,  //总页数
      total: result.total  
    });
  }
}
