import Promise from 'bluebird';
import { Device } from '../models/device';
import DeviceService from '../service/device.service';
import { Sensor } from '../models/sensor';
import { Message } from '../models/message';
import { Collector } from '../models/collector';
import { SensorType } from '../models/sensorType';
import { swallow } from '../utils/decorators';
import config from '../config/env';
import validate from '../utils/tools/validator';
import _ from 'lodash';

export default class DeviceController {
  @swallow
  static async getDevice(req, res, next) {
    //const device = await Device.findByIdAsync(req.params.device_id);
    //const device = device ? { ...device.toJSON() } : null;
    let device = await Device.findById(req.params.device_id).populate([
      {path: 'sensors', model: 'Sensor'},
      {path: 'ownerId', model: 'User', select: '_id name'},
      {path: 'deviceTypeId', model: 'DeviceType'},
      {path: 'projectId', model: 'Project'},
      {path: 'collectorId', model: 'Collector'},
      {path: 'areaId', model: 'Area'},
      //{path: 'subDevices', model: 'Device'}
    ]).exec();

    //device = await device.populate({path: 'subDevices.deviceTypeId', model: 'DeviceType'}).execPopulate();
    const result = {
        ...device._doc,
        deviceType_id: device.deviceTypeId._id,
        project_id: device.projectId._id,
      }
    res.json({success: true, data: result});
  }

  @swallow
  static async addDevice(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '设备名称不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    req.body.userId = req.user._id;
    let device = await Device.createAsync(req.body);
    device = await DeviceService._createDeviceAndSensors(req.body.deviceTypeId, device);

    return res.status(200).json({ success: true, data:device});
  }

  @swallow
  static async updateDevice(req, res, next){
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '设备名称不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    //deviceTypeId变化时进行的处理
    const device = await Device.findByIdAsync(req.params.device_id);
    if(req.body.deviceTypeId != device.deviceTypeId){
      //还要将原来的device下的sensors全部删除
      device.sensors = [];
      device.saveAsync();
      await DeviceController._createDeviceAndSensors(req.body.deviceTypeId, device);
    }

    const newDevice = await Device.findByIdAndUpdateAsync(req.params.device_id, req.body, {new:true});
    return res.status(200).send({success: true, data:newDevice});
  }

  @swallow
  static async addSensorForDevice(req, res, next){
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '传感器名称不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const device = await Device.findByIdAsync(req.params.device_id);
    req.body.deviceId = device._id;

    let type = await SensorType.findByIdAsync(req.body.sensorTypeId);
    req.body.sensorcode  = type.typeNum;
    req.body.operation = type.operation;
    
    const sensor = await Sensor.createAsync(req.body);
    device.sensors.addToSet(sensor);
    await device.saveAsync();
    
    return res.status(200).send({success: true, device: device});
  }

  @swallow
  static async deleteDevice(req, res, next) {
    const device = await Device.findByIdAndUpdateAsync(req.params.device_id, {$set: {active: false}});
    return res.status(200).send({success: true, device_id: device._id});
  }

  @swallow
  static async chargeDevice(req, res, next) {
    const device = await Device.findByIdAsync(req.params.device_id);
    //发送充值成功与否的message
    const message = {
      type: 'charge',
      projectId: req.body.projectId,
      authorId: req.user._id,
      deviceId: req.params.device_id,
    }
    await Message.createAysnc(message);
    return res.status(200).send({success: true, device_id: device._id});
  }

  

  @swallow
  static async getDevices(req, res, next) {
    //可以按deviceTypeId 来进行搜索  建筑物  采集器
    const query = {active: true};

    //查找这个项目下的所有设备  先找到项目下的所有采集器的id
    if(req.query.projectId){
      //通过projectId找到采集器ids
      let collectors = await Collector.findAsync({projectId: req.query.projectId});
      const collector_ids = collectors.map((collector) =>{
        return collector._id
      })
      query.collectorId = { $in: collector_ids }
    }

    if(req.query.deviceTypeId){
      query.deviceTypeId = req.query.deviceTypeId
    }

    if(req.query.userId){
      query.userId = req.query.userId
    }

    if(req.query.ownerId){
      query.ownerId = req.query.ownerId
    }

    if(req.query.collectorId){
      query.collectorId = req.query.collectorId
    }

    if(req.query.areaId){
      query.areaId = { '$all': [req.params.areaId] }
    }

    if(req.query.unbindCollector){   //还没有绑定采集器的设备
      query.collectorId = { $eq: null };
    }

    // if(req.query.isChild){
    //   query.subDevices =  { $exists: true, $eq: [] }
    // }
    // else{
    //   query.subDevices =  { $exists: true, $ne: [] }
    // }

    // if(req.query.position){
    //   query.position = new RegExp(req.query.position, 'i');
    // }

    let result = await Device.paginate(query, {
      populate: [
        {path: 'sensors', model: 'Sensor'},
        {path: 'ownerId', model: 'User', select: '_id name'},
        {path: 'deviceTypeId', model: 'DeviceType'},
        {path: 'projectId', model: 'Project'},
        {path: 'collectorId', model: 'Collector'},
        {path: 'areaId', model: 'Area'},
         //{path: 'subDevices', model: 'Device'}
      ],
      page: parseInt(req.query.page, 10) || 1,
      limit: Number(req.query.limit) || config.maxLimit,
      sort: {
        projectId: 1,
        created_at: -1
      }
    })
    const opts = [
       {path: 'sensors.sensorTypeId', model: 'SensorType'},
    ];

    const devices = await Device.populateAsync(result.docs, opts);

    res.json({
      data: devices,
      count: result.pages,
      total: result.total 
    });
  }
}
