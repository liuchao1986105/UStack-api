import Promise from 'bluebird';
import { Sensor } from '../models/sensor';
import { SensorType } from '../models/sensorType';
import { Device } from '../models/device';
import { swallow } from '../utils/decorators';
import validate from '../utils/tools/validator';
import config from '../config/env';
import _ from 'lodash';

export default class SenosrController {
  @swallow
  static async getSensor(req, res, next) {
    const sensor = await Sensor.findByIdAsync(req.params.sensor_id);
    res.json({success: true, data: sensor});
  }

  @swallow
  static async addSensor(req, res, next) {
    let error = '';
    error = validate.validateEmptyOrNull(req.body.title, '传感器名称不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }
    
    let type = await SensorType.findByIdAsync(req.body.sensorTypeId);
    req.body.sensorcode  = type.typeNum;
    const sensor = await Sensor.createAsync(req.body);

   //往Device的sensors增加id
    await Device.update(
      {_id: req.body.deviceId},
      {
        $push: {sensors: {$each: [sensor._id], $position: 0,}},
      }).exec();

    return res.status(200).json({ success: true, data:sensor});
  }


  @swallow
  static async updateSensor(req, res, next){
    let error = '';
    error = validate.validateEmptyOrNull(req.body.title, '传感器名称不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    let type = await SensorType.findByIdAsync(req.body.sensorTypeId);
    req.body.sensorcode  = type.typeNum;

    const sensor = await Sensor.findByIdAndUpdateAsync(req.params.sensor_id , req.body, {new:true});
    return res.status(200).send({success: true, data: sensor});
  }

  @swallow
  static async deleteSensor(req, res, next) {   
    let sensor = await Sensor.findByIdAndUpdateAsync(req.params.sensor_id, {$set: {active: false}});
    //把device的sensors中含有sensor_id的pull掉
    await Device.findByIdAndUpdateAsync(req.params.device_id, {$pull: {sensors: req.params.sensor_id}});
    
    return res.status(200).send({success: true, sensor_id: sensor._id});
  }

  @swallow
  static async _deleteSensors(device_id, sensor_id) {
    await Device.findByIdAndUpdateAsync(device_id, {$pull: {sensors: sensor_id}});
  }

  @swallow
  static async getSensors(req, res, next) {
    const query = {active: true};

    if(req.query.deviceId){
      query.deviceId = req.query.deviceId
    }

    const result = await Sensor.paginate(query, {
      populate: [
         //{path: 'sensors', model: 'Sensor'},
      ],
      page: parseInt(req.query.page, 10) || 1,
      limit: Number(req.query.limit) || config.maxLimit,
      sort: {
        sensorcode: 1
      }
    })
    res.json({
      data: result.docs,
      count: result.pages
    });

    return res.status(200).json({success: true, data: sensors});
  }
}
