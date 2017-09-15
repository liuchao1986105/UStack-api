import Promise from 'bluebird';
import { Sysconfig } from '../models/sysconfig';
import { swallow } from '../utils/decorators';
import validate from '../utils/tools/validator';
import _ from 'lodash';
import config from '../config/env';

export default class SysconfigController {
  @swallow
  static async getSysconfig(req, res, next) {
    const sysconfig = await Sysconfig.findByIdAsync(req.params.sysconfig_id);
    res.json({success: true, data: sysconfig});
  }

  @swallow
  static async addSysconfig(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.key, '键不能为空 ');
    error += validate.validateEmptyOrNull(req.body.value, '值不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const newSysconfig = await Sysconfig.createAsync(req.body);
    return res.status(200).json({ success: true, data:newSysconfig});
  }


  @swallow
  static async updateSysconfig(req, res, next){
    let error = '';
    error += validate.validateEmptyOrNull(req.body.key, '键不能为空 ');
    error += validate.validateEmptyOrNull(req.body.value, '值不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const sysconfig = await Sysconfig.findByIdAndUpdateAsync(req.params.sysconfig_id , req.body, {new:true});
    return res.status(200).send({success: true, data: sysconfig});
  }

  @swallow
  static async deleteSysconfig(req, res, next) {
    let sysconfig = await Sysconfig.findByIdAndUpdateAsync(req.params.sysconfig_id, {$set: {active: false}});
    return res.status(200).send({success: true, sysconfig_id: sysconfig._id});
  }

  @swallow
  static async getSysconfigs(req, res, next) {
    const query = {active: true};
    if(req.query.projectTypeId){
      query.projectTypeId = req.query.projectTypeId
    }

    // const sysconfigs = await Sysconfig.find(query, null, {
    //   // skip: 0, // Starting Row
    //   // limit: 10, // Ending Row
    //   // select: 'created_at',
    //   sort: {
    //     sort: 1,
    //   },
    // }).populate([
    //   {path: 'projectTypeId', model: 'projectType', select: '_id title'},
    // ]).exec();

    const result = await Sysconfig.paginate(query,
      {
        populate: [
           {path: 'projectTypeId', model: 'ProjectType', select: '_id title'},
        ],
        page: parseInt(req.query.page, 10) || 1,
        limit: Number(req.query.limit) || config.maxLimit,
        sort: {
          created_at: -1,
        },
      });

    return res.json({
      data: result.docs,
      count: result.pages,  //总页数
      total: result.total  //总config数
    });
  }
}
