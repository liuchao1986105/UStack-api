import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const DeviceTypeSchema = new mongoose.Schema({
  title: { type: String, required: true },   //可以填  “能源”   采集器
  description: { type: String },
  typeNum: { type: String, required: true},    //每种类型用一个字符编码表示
  active: { type: Boolean, default: true },
  sensortypes:[{ type: mongoose.Schema.Types.ObjectId, ref: 'SensorType' }],   //设备类型下面有传感器类型
  // {
  //   sensorcode: 1,
  //   id: id,
  //   title: "energy"，
  //   sensortypenum: "1333"
  // }

    // 存放该设备额外的一些参数  
  //这里填写值是字段串的变量，如位置等
  str1: { type: String }, 
  str2: { type: String }, 
  str3: { type: String }, 
  str4: { type: String }, 
//这里填写值是数字的变量，如经度纬度
  num1: { type: String }, 
  num2: { type: String }, 
  num3: { type: String }, 
  num4: { type: String }, 

  /*
  typeNum为electic_device的话  num1为阈值  num2为这个月的总值
  */
});

class DeviceTypeModel { }

DeviceTypeSchema.plugin(loadClass, DeviceTypeModel);
DeviceTypeSchema.plugin(baseModel);
DeviceTypeSchema.plugin(mongoosePaginate);
DeviceTypeSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

DeviceTypeSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const DeviceType = mongoose.model('DeviceType', DeviceTypeSchema);
