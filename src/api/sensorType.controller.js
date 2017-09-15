import Promise from 'bluebird';
import { SensorType } from '../models/sensorType';
import { swallow } from '../utils/decorators';
import _ from 'lodash';
import config from '../config/env';
import validate from '../utils/tools/validator';

export default class SensorTypeController {
  @swallow
  static async getSensorType(req, res, next) {
    const sensortype = await SensorType.findByIdAsync(req.params.sensortype_id);
    res.json({success: true, data: sensortype});
  }

  @swallow
  static async addSensorType(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '传感器类型不能为空 ');
    error += validate.validateEmptyOrNull(req.body.typeNum, '传感器类型编号不能为空 ');
    error += await validate.validateExist('typeNum', req.body.typeNum, '传感器类型编号已经存在 ', SensorType);

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const sensortype = await SensorType.createAsync(req.body);
    return res.status(200).json({ success: true, data:sensortype});
  }


  @swallow
  static async updateSensorType(req, res, next){
    let error = '';
    error = validate.validateEmptyOrNull(req.body.title, '传感器类型不能为空 ');
    error += validate.validateEmptyOrNull(req.body.typeNum, '传感器类型编号不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const sensortype = await SensorType.findByIdAndUpdateAsync(req.params.sensortype_id , req.body, {new:true});
    return res.status(200).send({success: true, data: sensortype});
  }

  @swallow
  static async deleteSensorType(req, res, next) {
    let sensortype = await SensorType.findByIdAndUpdateAsync(req.params.sensortype_id, {$set: {active: false}});
    return res.status(200).send({success: true, sensortype_id: sensortype._id});
  }

  @swallow
  static async getSensorTypes(req, res, next) {
    const query = {active: true};

    const  result = await SensorType.paginate(query,
      {
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
