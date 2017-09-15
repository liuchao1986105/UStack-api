import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const AlarmSchema = new mongoose.Schema({
  msg: { type: String },  //报警消息
  area: { type: String },  //报警区域
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },   //属于哪个项目  
  masterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //管理员
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 这个报警跟谁有关
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },  //设备
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' },  //传感器
  //catalog: { type: mongoose.Schema.Types.ObjectId, ref: 'AlarmCatalog' },  //报警种类
  catalog: { type: String },  //用量超过阈值  余额不足  用户断电。。。
  mode: { type: Number, default: 1},   //报警模式： 1.自动生成 2.人工干预
  level: { type: Number},   //报警等级
  ended_at: { type: Date },   //报警的结束时间

  send_type:{type: String },  //email weixin phone  web 

  hasRead: { type: Boolean, default: false },  //是否已读
  active: { type: Boolean, default: true },
});

class AlarmModel { }

AlarmSchema.plugin(loadClass, AlarmModel);
AlarmSchema.plugin(baseModel);
AlarmSchema.plugin(mongoosePaginate);
AlarmSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

AlarmSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Alarm = mongoose.model('Alarm', AlarmSchema);
