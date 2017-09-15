import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

//查询年范围的统计使用
const MonthSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector' }, 
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },  //操作对象是哪个设备
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' },  //操作对象是哪个传感器
  sensorcode: { type: String },
  unit:   { type: String },  
  catalog: { type: String }, //分类
  subitem: { type: String },  //分项
  days: [{type: mongoose.Schema.Types.ObjectId, ref: 'Day' }],
  total:{ type: Number, default: 0 },   //当月的总值
  created_at: { type: Date },    //当月的时间  2017-02
  active: { type: Boolean, default: true },
});

class MonthModel { }

MonthSchema.plugin(loadClass, MonthModel);
MonthSchema.plugin(baseModel);
MonthSchema.plugin(mongoosePaginate);
MonthSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Month = mongoose.model('Month', MonthSchema);
