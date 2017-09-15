import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const AreaSchema = new mongoose.Schema({  //建筑物
  title: { type: String, required: true },
  description: { type: String },
  //areaStr: { type: String },  //不携带采集器编号的gateway_id 1-12位
 // government_id: { type: String },  //1-6位
 //  type: { type: String },   //1位 类别编码
 // build_verify_id: { type: String },    //8-12  00001
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  areaTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'AreaType' },   //项目类型
  collectors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collector' }],
  active: { type: Boolean, default: true },
  subareas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Area' }],  //可以是建筑物 楼层
  parentAreaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' }
});

class AreaModel { }

AreaSchema.plugin(loadClass, AreaModel);
AreaSchema.plugin(baseModel);
AreaSchema.plugin(mongoosePaginate);
AreaSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

AreaSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Area = mongoose.model('Area', AreaSchema);
