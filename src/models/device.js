import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const DeviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  //管理员
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },   //设备的所属者
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },   
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector' },   // 标明这个设备在哪个集中器下面
  areaId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Area' }],  // 标明这个设备在哪个area下面
  sensors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' }],   //一个设备下面有哪些sensor
  deviceTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeviceType' },  //设备类型
  //subDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Device' }],  //一个设备下可能会有多个设备

  deviceNum: { type: String },   //设备编号
  collectorStr: { type: String },  //表明是那个采集器  等于collector的gateway_id

  active: { type: Boolean, default: true },
  state: { type: Number, default: 1 },   //设备工作状态  1是在线 0是断开

  //balance: { type: Number, default: 0 },   //设备余额

  serial:   { type: String },
  dev_id:   { type: String },

  // 存放该设备额外的一些参数
  str1: { type: String },   //地理位置01001
  str2: { type: String },    //
  str3: { type: String }, 
  str4: { type: String }, 

  num1: { type: Number },   //longitude
  num2: { type: Number },   //latitude
  num3: { type: Number }, 
  num4: { type: Number }, 

    /*
  deviceTypeId的typeNum为elec_dev的话  num1为阈值
  */

});

class DeviceModel { }

DeviceSchema.plugin(loadClass, DeviceModel);
DeviceSchema.plugin(baseModel);
DeviceSchema.plugin(mongoosePaginate);
DeviceSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

DeviceSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Device = mongoose.model('Device', DeviceSchema);
