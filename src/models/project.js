import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  img: { type: String },
  top: { type: Boolean, default: false }, // 置顶
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },   //创建者
  projectTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectType' },   //项目类型
  active: { type: Boolean, default: true },
  
  //项目的配置项,配置页面上显示哪些字段
  // pay_type: { type: String },  //预付费 后付费
  // cycle: { type: String },  //月账单month;日账单day
  // energy_type: { type: String },  //能源类型： 电 水 煤

  sysconfigs:[],  //用于存放配置参数

  // port: { type: Number }, //采集端和集中器端口：9027
  // month_freeze: { type: Number },   //月冻结抄表时间:7
  // day_freeze: { type: Number },   //日冻结抄表时间：01：00
  // close_time: { type: Number },   //结算时间：  15：30
  // price: { type: Number, default: 0 }, //单价或费率
  // peak_price: { type: Number, default: 0 },
  // top_price: { type: Number, default: 0 },
  // middle_price: { type: Number, default: 0 },
  // bottom_price: { type: Number, default: 0 },
});

class ProjectModel { }

ProjectSchema.plugin(loadClass,ProjectModel);
ProjectSchema.plugin(baseModel);
ProjectSchema.plugin(mongoosePaginate);
ProjectSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

ProjectSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
export const Project = mongoose.model('Project', ProjectSchema);
