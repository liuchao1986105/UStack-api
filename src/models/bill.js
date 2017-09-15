import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';

const BillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },

 // pay_type: { type: String },  //预付费 后付费
  is_pay: { type: Boolean, default: false }, // 账单是否已经缴费   后付费
 // cycle: { type: String },  //月账单month;日账单day
 // energy_type: { type: String },  //能源类型： 电 水 煤
  amount: { type: Number, default: 0 }, //账单费用
  is_publish: { type: Boolean, default: false }, // 账单是否发布  已发布的才允许通过短信等各种途径发起推送
  price: { type: Number, default: 0 }, //单价或费率   admin有可能回去修改
  this_time: { type: Number },   //本次读码
  last_time: { type: Number },    //上次读码
  consumption: { type: Number },   //本次用量

  late_fee: { type: Number },   //滞纳金
  pool_fee: { type: Number },   //公摊费

  peak: { //尖
    this_time: Number,
    last_time: Number,
    price: Number,
    consumption: { type: Number },
    amount: Number,
  },

  top: { //峰
    this_time: Number,
    last_time: Number,
    price: Number,
    consumption: { type: Number },
    amount: Number,
  },

   middle: { //平
    this_time: Number,
    last_time: Number,
    price: Number,
    consumption: { type: Number },
    amount: Number,
  },

  bottom: { //谷
    this_time: Number,
    last_time: Number,
    price: Number,
    consumption: { type: Number },
    amount: Number,
  },
});

class BillModel { }

BillSchema.plugin(loadClass, BillModel);
BillSchema.plugin(baseModel);
BillSchema.plugin(mongoosePaginate);
BillSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

BillSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    //ret.numberOfVideos = ret.videos ? ret.videos.length : 0;
    delete ret.__v;
    return ret;
  },
});
export const Bill = mongoose.model('Bill', BillSchema);
