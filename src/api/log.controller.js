import Promise from 'bluebird';
import { Log } from '../models/log';
import { swallow } from '../utils/decorators';
import config from '../config/env';
import _ from 'lodash';

export default class LogController {
  @swallow
  static async getLog(req, res, next) {
    let log = await Log.findById(req.params.log_id).populate([
      {path: 'userId', model: 'User', select: '_id name'},
      {path: 'deviceId', model: 'Device'}
    ]).exec();

    log = await log.populate({path: 'deviceId.deviceTypeId', model: 'DeviceType'}).execPopulate();
    res.json({success: true, data: log});
  }

  @swallow
  static async getLogs(req, res, next) {
    const query = {active: true};
    if(req.query.projectId){
      query.projectId = req.query.projectId
    }

    if(req.query.userId){
      query.userId = req.query.userId
    }

    let result = await Log.paginate(query, {
      populate: [
         {path: 'userId', model: 'User', select: '_id name'},
         {path: 'projectId', model: 'Project'},
         {path: 'deviceId', model: 'Device'}
      ],
      page: parseInt(req.query.page, 10) || 1,
      limit: Number(req.query.limit) || config.maxLimit,
      sort: {
        projectId: 1,
        created_at: -1
      }
    })
    // const opts = [
    //   {path: 'deviceId.deviceTypeId', model: 'DeviceType'},
    // ];

    // const devices = await Device.populateAsync(result.docs, opts);

    res.json({
      data: result.docs,
      count: result.pages,
      total: result.total 
    });
  }

  @swallow
  static async createLog(data) {
    await Log.createAsync(data);
  }

}
