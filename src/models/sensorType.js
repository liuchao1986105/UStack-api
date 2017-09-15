import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const SensorTypeSchema = new mongoose.Schema({
  title: { type: String },  //可以填 'energy'   //
  description: { type: String },  //振动报警等
  typeNum: { type: String, required: true},    //每种类型用一个编码表示  以供代码里使用
  data_type: { type: String },  //Unknown Float Int GPS Image Bool Postion String
  unit_mark: { type: String },
  operation: { type: String },  //表示这个传感器类型应该具备的操作   如查看电表
  active: { type: Boolean, default: true },

  // 存放上传上来的传感器额外的一些参数  
  // 这里填写值是字段串的变量，如位置等
  str1: { type: String }, 
  str2: { type: String }, 
  str3: { type: String }, 
  str4: { type: String }, 
//这里填写值是数字的变量，如坐标
  num1: { type: String }, 
  num2: { type: String }, 
  num3: { type: String }, 
  num4: { type: String }, 
});

class SensorTypeModel { }

SensorTypeSchema.plugin(loadClass,SensorTypeModel);
SensorTypeSchema.plugin(baseModel);
SensorTypeSchema.plugin(mongoosePaginate);
SensorTypeSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

SensorTypeSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
export const SensorType = mongoose.model('SensorType', SensorTypeSchema);
