import Promise from 'bluebird';
import { Alarm } from '../models/alarm';
import { swallow } from '../utils/decorators';
import AlarmService from '../service/alarm.service';
import mail from '../utils/email';
import config from '../config/env';
import moment from 'moment';

export default class AlarmController {
  @swallow
  static async getUserAlarms(req, res, next) {
    let query = {active: true};

    if(req.query.starttime && req.query.endtime){
      const starttime = moment(req.query.starttime).toDate();
      const endtime = moment(req.query.endtime).toDate();
      query.created_at = {$gte:starttime, $lte:endtime};    //{$and:[{created_at:{$lt:end_time}},{created_at:{$gt:start_time}}]}
    }

    if(req.query.projectId){
      query.projectId = req.query.projectId;
    }

    if(req.user.role == 'user'){
      query.authorId = req.user._id;
    }else{
      query.masterId = req.user._id;
    }
    
    //查询出未读的消息
    if(req.query.hasRead == "false"){
      query.hasRead = false;
    }else if (req.query.hasRead == "true"){
      query.hasRead = true;
    }

    const result = await Alarm.paginate(query, {
      populate: [
        {path: 'projectId', model: 'Project', select: '_id title'},
        {path: 'deviceId', model: 'Device', select: '_id title'},
        {path: 'authorId', model: 'User', select: '_id name'},
        {path: 'masterId', model: 'User', select: '_id name'},
      ],
      page: parseInt(req.query.page, 10) || 1,
      limit: Number(req.query.limit) || config.maxLimit,
      sort: {
        created_at: -1,
      }
    })
    
    res.json({
      data: result.docs,
      count: result.pages,
      total: result.total
    });
  }

  @swallow 
  static async updateAlarmsRead(req, res, next) {
    let query = {hasRead: false, active: true};
    if(req.user.role == 'user'){
      query.authorId = req.user._id;
    }else{
      query.masterId = req.user._id;
    }

    const alarms = await Alarm.updateAsync(query, { $set: { hasRead: true } }, { multi: true });
    return res.json({
      success: true,
      data: alarms.nModified
    });
  }


  @swallow
  static async getAlarmStatistics(req, res, next) {
    let query = {active: true};

    if(req.query.starttime && req.query.endtime){
      const starttime = moment(req.query.starttime).toDate();
      const endtime = moment(req.query.endtime).toDate();
      query.created_at = {$gte:starttime, $lte:endtime};    //{$and:[{created_at:{$lt:end_time}},{created_at:{$gt:start_time}}]}
    }

    if(req.query.projectId){
      query.projectId = req.query.projectId;
    }

    if(req.user.role == 'user'){
      query.authorId = req.user._id;
    }else{
      query.masterId = req.user._id;
    }

//   Users.aggregate(
//     { $group: { _id: null, maxBalance: { $max: '$balance' }}}
//   , { $project: { _id: 0, maxBalance: 1 }}
//   , function (err, res) {
//   if (err) return handleError(err);
//   console.log(res); // [ { maxBalance: 98000 } ]
// });

    const catalogResult = await Alarm.aggregate()
      .match(query)
      .group({ "_id": "$catalog", num_alarms: { $sum: 1 } })
      //.select('-catalog maxBalance')
      .exec();

    //查出每天的alarm数
    let groupList = await AlarmService.getAlarmGroupDayInit(req.query.starttime, req.query.endtime);
    const listPromises = groupList.map((group) => {
      return AlarmService.getAlarmNumDay(group);
    });
    const nums = await Promise.all(listPromises);

    res.json({
      catalog_data: catalogResult[0],
      line_list: nums
    });
  }

  /*查询查询的人未读的报警*/
  @swallow
  static async getUnReadCount(req, res, next) {
    let count = 0;
    let query = {hasRead: false, active: true};

    if(req.user.role == 'user'){
      query.authorId = req.user._id;
    }else{
      query.masterId = req.user._id;
    }

    count = await Alarm.countAsync(query);
    return res.json({success: true, data: count});
  }
  
}
