import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const LogSchema = new mongoose.Schema({
  desc: { type: String },  //详细信息
  operation: { type: String },  //动作   如能耗统计
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },   //操作人
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },  //操作对象是哪个设备
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },  //操作对象是哪个设备
  model:{ type: String },   //操作的是哪个模块 如设备管理等
  state:{ type: String, default: 1},   //1表示成功  0表示失败

  active: { type: Boolean, default: true },
});

class LogModel { }

LogSchema.plugin(loadClass, LogModel);
LogSchema.plugin(baseModel);
LogSchema.plugin(mongoosePaginate);
LogSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

LogSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Log = mongoose.model('Log', LogSchema);
