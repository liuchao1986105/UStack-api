import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const CollectorSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' }, //属于哪个场景
  active: { type: Boolean, default: true },

  gateway_id: { type: String }, //携带采集器order
  order:{ type: String },   //采集器的编号
  fac_id: { type: String },  //出厂编码
  period: { type: Number, default: 15  },  // 15分钟 30 45 60 
});

class CollectorModel { }

CollectorSchema.plugin(loadClass, CollectorModel);
CollectorSchema.plugin(baseModel);
CollectorSchema.plugin(mongoosePaginate);
CollectorSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

CollectorSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Collector = mongoose.model('Collector', CollectorSchema);
