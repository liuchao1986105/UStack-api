import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const ProjectTypeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  active: { type: Boolean, default: true },
  //classifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classification' }], //有哪几种设备分组的类型
});

class ProjectTypeModel { }

ProjectTypeSchema.plugin(loadClass,ProjectTypeModel);
ProjectTypeSchema.plugin(baseModel);
ProjectTypeSchema.plugin(mongoosePaginate);
ProjectTypeSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

ProjectTypeSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
export const ProjectType = mongoose.model('ProjectType', ProjectTypeSchema);
