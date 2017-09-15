import Promise from 'bluebird';
import DeviceService from './device.service';
import AlarmService from './alarm.service';
import MessageService from './message.service';
import { Datapoint,Catalogs,Subitems } from '../models/datapoint';
import { Device } from '../models/device';
import { Sensor } from '../models/sensor';
import { Alarm } from '../models/alarm';
import { Collector } from '../models/collector';
import { DeviceType } from '../models/deviceType';
import { Day } from '../models/day';
import { Month } from '../models/month';
import { innerSwallow } from '../utils/decorators';
import moment from 'moment';

export default class DatapointService {
  static _findSensor(deviceId,sensorcode){
    //找到对应的sensorid  通过device._id和sensorcode
    return new Promise((resolve, reject) => {
      Sensor.findOneAsync({deviceId: deviceId, sensorcode:sensorcode}).then((sensor) => {
        if(sensor){
          resolve(sensor);
        }
      }).catch((err) => {
        reject(err);
      });
    });
  }

  @innerSwallow
  static async _processDayData(dayInfo, msg) {
    //把time解析出哪天的，然后到day表中找create_at和sensorId的记录， 在data字段中push进去值
    let time = moment(dayInfo.time).format('HH:mm'); 
    let hour = moment(dayInfo.time).add(1, 'hours').format('HH') + ":00"; 
    let daydata = await Day.findOneAsync({created_at:dayInfo.created_at, sensorId: dayInfo.sensorId});
    if(!daydata){
      dayInfo.total = msg;
      dayInfo.data = [{time: time, msg:msg}];
      daydata = await Day.createAsync(dayInfo);
    }else{
      daydata = await Day.findOneAndUpdateAsync(
        {created_at:dayInfo.created_at, sensorId: dayInfo.sensorId}, 
        {
          $addToSet: {data: {$each: [{ time: time, msg: msg}]}},
          //$inc: { total: msg },
          $set: { total: msg },
        },
        {new:true}
      );
    }

    daydata.hourdata[hour] += msg;
    await daydata.saveAsync();

    //要判断一下当前上报时间
    DatapointService._processMonthData(dayInfo, daydata);
  }

  @innerSwallow
  static async _processMonthData(info, daydata) {
    //处理month
    delete info.data;
    //let month = new Date(moment(info.time).format('YYYY-MM')); 
    let month = moment(info.time).startOf('month');
    let monthdata = await Month.findOneAsync({created_at:month, sensorId: info.sensorId});

    if(!monthdata){
      info.created_at = month;
      info.days = [daydata._id];
      info.total = daydata.total;
      monthdata = await Month.createAsync(info);
    }else{
      monthdata = await Month.findOneAndUpdateAsync(
        {created_at:month, sensorId: info.sensorId}, 
        {
          $addToSet: {days: {$each: [daydata._id]}},
          $set: { total: daydata.total },
        },
        {new:true}
      );
    }
  }

  static _processSensor(sensor, device, root) {
        //解析cid来分析出分类编码和分类能耗编码
    let id = sensor.$.id;
    let catalog = id.substring(6,8);
    let subitem = id.substring(8);
    let msg = sensor._;
    DatapointService._findSensor(device._id, sensor.$.coding).then((sen) => {
      const datapoint = {
        gateway_id: root.common.gateway_id,
        areaStr: root.common.gateway_id.substring(0,13),
        type: root.common.type,
        sequence: root.data.sequence,
        time: new Date(root.data.time),
        parse: root.data.parse,
        serial:root.data.dev.$.com,
        dev_id: root.data.dev.$.id,
        //state: parseInt(root.data.dev.$.on),
        reg_id: id,
        reg_coding: sensor.$.coding,
        reg_unit: sensor.$.unit,
        //reg_error: sensor.$.error,
        deviceId: device._id,
        catalog: Catalogs[catalog],
        subitem: Subitems[subitem],
        operation: root.common.type,
        sensorId: sen && sen._id,
        num1: msg
      }

      //if(sensor.$.coding == 'elec'){
        // const messageInfo = {
        //   type:'charge',
        //   projectId: device.projectId,
        //   masterId:device.userId,
        //   authorId: device.ownerId,
        //   deviceId: device._id,
        //   sensorId: sen && sen._id,
        //   send_type:'web'
        // }
        // MessageService.sendMessage(messageInfo)

        //这些条件说明设备必须在平台上先绑定好  device.projectId
        if(device.projectId){
          const dayInfo = {
            projectId: device.projectId,
            collectorId: device.collectorId,
            deviceId: device._id,
            sensorId: sen && sen._id,
            sensorcode: sensor.$.coding,
            unit: sensor.$.unit,
            catalog: Catalogs[catalog],
            subitem: Subitems[subitem],
           // created_at: new Date(moment(root.data.time).format("YYYY-MM-DD")),
            created_at: moment(root.data.time).startOf('day'),
            time: root.data.time 
          }
          DatapointService._processDayData(dayInfo,parseFloat(msg));

          //是否超过阈值
          if(device.num1){ 
            if( datapoint.num1 > device.num1){
              const alarminfo = {
                msg:'用量超过阈值, 阈值为' + device.num1 + ', 此次用量为' + datapoint.num1,
                projectId: device.projectId,
                deviceId: device._id,
                masterId: device.userId,
                authorId: device.ownerId,
                send_type: 'web',
                catalog: '用量超过阈值',
                sensorId: sen && sen._id
              }
              AlarmService.sendAlarm(alarminfo);
            }
          }

          //创建datapoint
          Datapoint.create(datapoint);
        }
     // }
    });
  }

  static async putReportData(root,cb) {
    const collectorStr = root.common.gateway_id;
    //const areaStr = collectorStr.substring(0,13);
    const fac_id = root.common.fac_id;

    let serial = root.data.dev.$.com;
    let dev_id = root.data.dev.$.id;
    let state = root.data.dev.$.on;  //1是在线 2是不在线
    let deviceType = root.data.dev.$.type;  //设备类型

    //实现设备跟采集器的自动绑定
    const collectorInfo = 
    {
      title:collectorStr,
      description: "采集器",
      //"areaId":"59906abc9d9dd1a9b2e1a863",
      //"projectId":"598c70510ea124d8657f27f1",
      gateway_id:collectorStr,
      fac_id:fac_id,
    }
    let collector = await Collector.findOneAsync({gateway_id: collectorStr});
    if(!collector){
      collector = await Collector.createAsync(collectorInfo);
    }

    //自动创建设备
    const deviceInfo = {
      collectorId: collector._id,
      collectorStr: collectorStr,
      serial: serial,
      dev_id: dev_id,
      title: collectorStr + '-' + serial + '-' + dev_id
    }

    let device = await Device.findOneAsync({collectorStr: collectorStr, serial:serial, dev_id:dev_id});
    if(!device){
      //创建设备的同时还要创建相应的传感器
      let dev_type = await DeviceType.findOneAsync({typeNum: deviceType});
      deviceInfo.deviceTypeId = dev_type._id;
      device = await Device.createAsync(deviceInfo);
      device = await DeviceService._createDeviceAndSensors(dev_type._id, device) 
    }

    if(state == "1"){
      if(Array.isArray(root.data.dev.sensor)){
        root.data.dev.sensor.forEach((sensor) => {
          DatapointService._processSensor(sensor, device, root);
        });
      }else{
        DatapointService._processSensor(root.data.dev.sensor, device, root);
      }
    }
    cb && cb();
  }
}