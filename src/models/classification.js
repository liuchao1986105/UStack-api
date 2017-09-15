import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const ClassificationSchema = new mongoose.Schema({
  title: { type: String },  //building-collector   
  description: { type: String },  //建筑物-采集器
  projectTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectType' },
  active: { type: Boolean, default: true },
});

class ClassificationModel { }

ClassificationSchema.plugin(loadClass,ClassificationModel);
ClassificationSchema.plugin(baseModel);
ClassificationSchema.plugin(mongoosePaginate);
ClassificationSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

ClassificationSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
export const Classification = mongoose.model('Classification', ClassificationSchema);
