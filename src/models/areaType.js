import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const AreaTypeSchema = new mongoose.Schema({
  title: { type: String },  //floor  building    building-collector
  description: { type: String },  //楼层
  active: { type: Boolean, default: true },
});

class AreaTypeModel { }

AreaTypeSchema.plugin(loadClass,AreaTypeModel);
AreaTypeSchema.plugin(baseModel);
AreaTypeSchema.plugin(mongoosePaginate);
AreaTypeSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

AreaTypeSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
export const AreaType = mongoose.model('AreaType', AreaTypeSchema);
