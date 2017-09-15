import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';


//规则： 对项目来说按小时来显示 可以选择天，月，年
//对设备来说按分钟， 默认分钟的话小时近1个小时的
const DaySchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Collector' }, 
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },  //操作对象是哪个设备
  sensorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' },  //操作对象是哪个传感器
 // state:{ type: Boolean, default: false },   //fasle表示当天数据的总值还没有被更新
  total:{ type: Number, default: 0 },   //总值
  active: { type: Boolean, default: true },
  sensorcode: { type: String },
  unit:   { type: String },  
  catalog: { type: String }, //分类
  subitem: { type: String },  //分项
  created_at: { type:  Date },  //当天的时间 2017-02-21
  data: [],  //存储分钟的数据
  hourdata: {
    '01:00':{ type: Number, default: 0 },
    '02:00':{ type: Number, default: 0 },
    '03:00':{ type: Number, default: 0 },
    '04:00':{ type: Number, default: 0 },
    '05:00':{ type: Number, default: 0 },
    '06:00':{ type: Number, default: 0 },
    '07:00':{ type: Number, default: 0 },
    '08:00':{ type: Number, default: 0 },
    '09:00':{ type: Number, default: 0 },
    '10:00':{ type: Number, default: 0 },
    '11:00':{ type: Number, default: 0 },
    '12:00':{ type: Number, default: 0 },
    '13:00':{ type: Number, default: 0 },
    '14:00':{ type: Number, default: 0 },
    '15:00':{ type: Number, default: 0 },
    '16:00':{ type: Number, default: 0 },
    '17:00':{ type: Number, default: 0 },
    '18:00':{ type: Number, default: 0 },
    '19:00':{ type: Number, default: 0 },
    '20:00':{ type: Number, default: 0 },
    '21:00':{ type: Number, default: 0 },
    '22:00':{ type: Number, default: 0 },
    '23:00':{ type: Number, default: 0 },
    '00:00':{ type: Number, default: 0 },
  }
  /*{
    time:"00:15",
    msg:12
  }*/
});

class DayModel { }

DaySchema.plugin(loadClass, DayModel);
DaySchema.plugin(baseModel);
DaySchema.plugin(mongoosePaginate);
DaySchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});
export const Day = mongoose.model('Day', DaySchema);
