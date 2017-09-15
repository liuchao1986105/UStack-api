import Promise from 'bluebird';
import { AreaType } from '../models/areaType';
import { swallow } from '../utils/decorators';
import _ from 'lodash';
import config from '../config/env';
import validate from '../utils/tools/validator';

export default class AreaTypeController {
  @swallow
  static async getAreaType(req, res, next) {
    const areatype = await AreaType.findByIdAsync(req.params.areatype_id);
    res.json({success: true, data: areatype});
  }

  @swallow
  static async addAreaType(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '场景类型不能为空 ');
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const areatype = await AreaType.createAsync(req.body);
    return res.status(200).json({ success: true, data:areatype});
  }


  @swallow
  static async updateAreaType(req, res, next){
    let error = '';
     error += validate.validateEmptyOrNull(req.body.title, '场景类型不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const areatype = await AreaType.findByIdAndUpdateAsync(req.params.areatype_id , req.body, {new:true});
    return res.status(200).send({success: true, data: areatype});
  }

  @swallow
  static async deleteAreaType(req, res, next) {
    let areatype = await AreaType.findByIdAndUpdateAsync(req.params.areatype_id, {$set: {active: false}});
    return res.status(200).send({success: true, areatype_id: areatype._id});
  }

  @swallow
  static async getAreaTypes(req, res, next) {
    const query = {active: true};

    const  result = await AreaType.paginate(query,
      {
        page: parseInt(req.query.page, 10) || 1,
        limit: Number(req.query.limit) || config.maxLimit,
        sort: {
          created_at: -1,
        },
      });

    return res.json({
      data: result.docs,
      count: result.pages,  //总页数
      total: result.total  
    });
  }
}
