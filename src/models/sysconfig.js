import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const SysconfigSchema = new mongoose.Schema({
  key: { type: String},   //在代码要使用的名称 如energy_price为单价或费率
  value: { type: String },
  projectTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectType' },
  active: { type: Boolean, default: true },
});

class SysconfigModel { }

SysconfigSchema.plugin(loadClass, SysconfigModel);
SysconfigSchema.plugin(baseModel);
SysconfigSchema.plugin(mongoosePaginate);
SysconfigSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

SysconfigSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Sysconfig = mongoose.model('Sysconfig', SysconfigSchema);
