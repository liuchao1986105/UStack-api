import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const SensorSchema = new mongoose.Schema({
  title: { type: String, required: true },
  //identifier: { type: Number, default: 0 },   //传感器编号
  sensorTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SensorType' },   //传感器类型
  operation: { type: String },  //表示这个传感器类型应该具备的操作   如查看电表
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },  //属于哪个设备
  sensorcode: { type: String},  
  active: { type: Boolean, default: true },
});

class SensorModel { }

SensorSchema.plugin(loadClass,SensorModel);
SensorSchema.plugin(baseModel);
SensorSchema.plugin(mongoosePaginate);
SensorSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

SensorSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
export const Sensor = mongoose.model('Sensor', SensorSchema);
