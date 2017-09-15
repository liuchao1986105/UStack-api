import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

/*
 * type:
 * charge: 充值
 */

const MessageSchema = new mongoose.Schema({
  type: { type: String },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },   //属于哪个项目  
  masterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //谁收到这个message
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, //谁充值  即谁触发了这个message
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' }, //给哪个设备充值
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' }, //给哪个传感器充值
  send_type: {type: String },  //email weixin phone  web 
  hasRead: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
});

class MessageModel { }

MessageSchema.plugin(loadClass, MessageModel);
MessageSchema.plugin(baseModel);
MessageSchema.plugin(mongoosePaginate);
MessageSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

MessageSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
export const Message = mongoose.model('Message', MessageSchema);
