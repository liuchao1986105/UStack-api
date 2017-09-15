import Promise from 'bluebird';
import { Datapoint } from '../models/datapoint';
import { Day } from '../models/day';
import { Month } from '../models/month';
import { swallow } from '../utils/decorators';
import config from '../config/env';
import _ from 'lodash';
import moment from 'moment';
import { extendMoment } from 'moment-range';
const momentRange = extendMoment(moment);

export default class StatisticsController{
  /**
   * 1. 按天查询的话只能查询当天的分钟或者小时数据, 
   */
  @swallow
  static async getHourDataOfDay(req, res, next) {
    let query = {active: true};
    if(req.query.time){
      const time = moment(req.query.time);
      query.created_at = time;
    }

    if(req.query.sensorId){
      query.sensorId = req.query.sensorId;
    }

    let daydata;
    let times = [];
    let msgs = [];
    if(req.query.type == "minute"){
        daydata = await Day.findOneAsync(query,'data total');
        //var res = _.filter(daydata.data, function(data) { return data.time >= "00:15" && data.time < "06:15"; });
        _.forEach(daydata.data, function(data) {
            // if(data.time >= "00:15" && data.time < "06:15"){
            //     times.push(data.time);
            //     msgs.push(data.msg)
            // }
            times.push(data.time);
            msgs.push(data.msg)
        });
    }else if(req.query.type == "hour"){
        daydata = await Day.findOneAsync(query,'hourdata total');
        times = _.keys(daydata.hourdata)
        msgs = _.values(daydata.hourdata)
    }

    res.json({ success:true, times:times.reverse(), msgs:msgs.reverse(), total: daydata.total});
  }


  /**
   * 2. 按月/周查询 查询出每天的数据,  也可以查出当前项目/采集器当月的每天的数据
   */
  @swallow
  static async getDayDataOfMonth(req, res, next) {
    let query = {};
    let times = [];
    let msgs = [];
    let starttime, endtime;

    //当月
    if(req.query.time){
      starttime = moment(req.query.time).toDate();
      endtime = moment(req.query.time).endOf("month").toDate();
    }

    //一周
    if(req.query.type == "week"){
      starttime = moment().startOf('week').add(1, 'd').toDate();
      endtime = moment().endOf('week').add(1, 'd').toDate();
    }

    if(req.query.sensorId){
      query.sensorId = req.query.sensorId;
    }

    if(req.query.sensorcode){
      query.sensorcode = req.query.sensorcode;
    }

    if(req.query.projectId){
      query.projectId = req.query.projectId;
    }

    if(req.query.collectorId){
      query.collectorId = req.query.collectorId;
    }

    //let monthdata = await Month.findOneAsync(query,'days total');
    // let monthdata = await Month.findOne(query,'days total').populate([
    //   {path: 'days', model: 'Day', select: '_id created_at total'}
    // ]).exec();

    if(starttime && endtime){
      query.created_at = {$gte:starttime, $lte:endtime}; 
      const range = momentRange.range(starttime, endtime);
      //const days = Array.from(range.by('year'));
      for (let day of range.by('day')) {
        times.push(day.format('YYYY-MM-DD'));
        msgs.push(0);
      }
    }

    let daydatas = await Day.findAsync(query,'created_at total');

    _.forEach(daydatas, function(day) {
        const index = _.indexOf(times,moment(day.created_at).format("YYYY-MM-DD"));
        msgs[index] = day.total
    });

    res.json({ success:true, times:times, msgs:msgs});
  }

   /**
   * 3. 获取1年内月数据 
   */
  @swallow
  static async getMonthDataOfYear(req, res, next) {
    let query = {};
    let times = [];
    let msgs = [];

    if(req.query.time){
      const starttime = moment(req.query.time + '-01').toDate();
      const endtime = moment(req.query.time + '-12').toDate();
      query.created_at = {$gte:starttime, $lte:endtime}; 
      const range = momentRange.range(starttime, endtime);
      //const days = Array.from(range.by('year'));
      for (let month of range.by('month')) {
        times.push(month.format('YYYY-MM'));
        msgs.push(0);
      }
    }

    if(req.query.sensorId){
      query.sensorId = req.query.sensorId;
    }


    if(req.query.sensorcode){
      query.sensorcode = req.query.sensorcode;
    }

    if(req.query.projectId){
      query.projectId = req.query.projectId;
    }

    if(req.query.collectorId){
      query.collectorId = req.query.collectorId;
    }

    let monthdatas = await Month.findAsync(query,'created_at total');

    const year_total =  _.sumBy(monthdatas, function(month) { return month.total; });
    _.forEach(monthdatas, function(month) {
        const index = _.indexOf(times,moment(month.created_at).format("YYYY-MM"));
        msgs[index] = month.total;
    });
    res.json({ success:true, times:times, msgs:msgs, year_total:year_total});
  }


  /**
   * 4. 获取当前项目/采集器的一天的小时数据, 
   */
  @swallow
  static async getAllHourDataOfDay(req, res, next) {
    let query = {};
    let times = [];
    let msgs = [];
    let hourdatas = [];

    if(req.query.time){
      const time = moment(req.query.time);
      query.created_at = time;
    }

    // if(req.query.starttime && req.query.endtime){
    //   const starttime = moment(req.query.starttime).toDate();
    //   const endtime = moment(req.query.endtime).toDate();
    //   query.created_at = {$gte:starttime, $lte:endtime}; 
    //   const range = momentRange.range(starttime, endtime);
    //   //const days = Array.from(range.by('year'));
    //   for (let hour of range.by('hour')) {
    //     times.push(hour.add(1, 'hours').format('MM-DD HH:mm'));
    //     msgs.push(0);
    //   }
    //   times.pop();  //多了一个元素
    //   msgs.pop(); 
    // }


    if(req.query.sensorId){
      query.sensorId = req.query.sensorId;
    }

    if(req.query.sensorcode){
      query.sensorcode = req.query.sensorcode;
    }

    if(req.query.projectId){
      query.projectId = req.query.projectId;
    }

    if(req.query.collectorId){
      query.collectorId = req.query.collectorId;
    }

    const daydatas = await Day.findAsync(query,'hourdata total');

    daydatas.forEach((day) => {
      hourdatas.push(day.hourdata);
    });

    times = _.keys(hourdatas[0]);

    times.forEach((time) => {
      msgs.push(_.sumBy(hourdatas, function(obj) { return obj[time]; }));
    });
    // hourdatas.forEach((hourdata) =>{
    //   resdatas = resdatas.concat(_.values(hourdata).reverse());
    // });

    res.json({ success:true, times:times.reverse(), msgs:msgs.reverse()});
  }

}
