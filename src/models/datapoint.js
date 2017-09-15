import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';
import moment from 'moment';

export const Subitems = {   //分项
  A: '照明插座用电',
  B: '空调用电',
  C: '动力用电',
  D: '特殊用电'
};

export const Catalogs = {
  '01': '电费',
  '02': '水费',
  '03': '燃气',
  '04': '供热量',
  '05': '供冷量',
  '06': '其他能源',
};

const DatapointSchema = new mongoose.Schema({
  gateway_id: { type: String }, 
  areaStr: { type: String },
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
  sequence:{ type: Number },
  parser: { type: Boolean },
  time: { type: Date},   //2013-02-04 22:44:30.652
  
  serial:   { type: String },
  dev_id:   { type: String },  //这两个唯一确定哪个设备
 // state: { type: Number },  //0不在线  1在线
  reg_id:   { type: String },   //共9位  7-8位是分类  9是分项(A B C D)
  reg_coding:   { type: String },  
  reg_unit:   { type: String },  
  //msg: { type: String },
  operation: { type: String },  //说明这个dp是在执行什么操作传上来的

  catalog: { type: String }, //分类
  subitem: { type: String },  //分项

  active: { type: Boolean, default: true },

    // 存放上传上来的传感器额外的一些参数  
  //这里填写值是字段串的变量，如位置等
  str1: { type: String }, 
  str2: { type: String }, 
  str3: { type: String }, 
  str4: { type: String }, 
//这里填写值是数字的变量，如坐标
  num1: { type: Number }, 
  num2: { type: Number }, 
  num3: { type: Number }, 
  num4: { type: Number }, 

  /*
  1.elec  num1表示电量值
  */
});

class DatapointModel { }

DatapointSchema.plugin(loadClass, DatapointModel);
DatapointSchema.plugin(baseModel);
DatapointSchema.plugin(mongoosePaginate);
// DatapointSchema.plugin(timestamps, {
//   createdAt: 'created_at',
//   updatedAt: 'updated_at',
// });

DatapointSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Datapoint = mongoose.model('Datapoint', DatapointSchema);
