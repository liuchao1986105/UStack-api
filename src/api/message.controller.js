import Promise from 'bluebird';
import { Message } from '../models/message';
import { swallow } from '../utils/decorators';
import mail from '../utils/email';
import config from '../config/env';

export default class MessageController {
  @swallow
  static async getUserMessges(req, res, next) {
    const query = {active: true};

    ///查询出未读的通知
    if(req.query.hasRead == "false"){
      query.hasRead = false;
    }else if (req.query.hasRead == "true"){
      query.hasRead = true;
    }

    if(req.user.role == 'user'){
      query.authorId = req.user._id;
    }else{
      query.masterId = req.user._id;
    }

    if(req.query.projectId){
      query.projectId = req.query.projectId;
    }

    const result = await Message.paginate(query, {
      populate: [
        {path: 'projectId', model: 'Project', select: '_id title'},
        {path: 'deviceId', model: 'Device', select: '_id title'},
        {path: 'authorId', model: 'User', select: '_id name headimgurl'},
        {path: 'masterId', model: 'User', select: '_id name headimgurl'},
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
  static async updateMessagesRead(req, res, next) {
    let query = {hasRead: false, active: true};
    if(req.user.role == 'user'){
      query.authorId = req.user._id;
    }else{
      query.masterId = req.user._id;
    }

  //  const ids = unReadMsgs.map((msg) => {
  //     return msg._id;
  //   });
  //   const query = { masterId: userId, _id: { $in: ids } };

    const messages = await Message.updateAsync(query, { $set: { hasRead: true } }, { multi: true });
    return res.json({
      success: true,
      data: messages.nModified
    });
  }

  /*查询未读的通知的数目*/
  @swallow
  static async getUnReadCount(req, res, next) {
    let count = 0;
    let query = {hasRead: false, active: true};

    if(req.user.role == 'user'){
      query.authorId = req.user._id;
    }else{
      query.masterId = req.user._id;
    }

    count = await Message.countAsync(query);
    return res.json({success: true, data: count});
  }

}
