import Promise from 'bluebird';
import { Classification } from '../models/classification';
import { Area } from '../models/area';
import { Collector } from '../models/collector';
import { swallow } from '../utils/decorators';
import _ from 'lodash';
import config from '../config/env';
import validate from '../utils/tools/validator';

export default class ClassificationController {
  @swallow
  static async getClassification(req, res, next) {
    const classification = await Classification.findByIdAsync(req.params.classification_id);
    res.json({success: true, data: classification});
  }

  @swallow
  static async addClassification(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '设备层级类型不能为空 ');
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const classification = await Classification.createAsync(req.body);
    return res.status(200).json({ success: true, data:classification});
  }


  @swallow
  static async updateClassification(req, res, next){
    let error = '';
     error += validate.validateEmptyOrNull(req.body.title, '设备层级类型不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const classification = await Classification.findByIdAndUpdateAsync(req.params.classification_id , req.body, {new:true});
    return res.status(200).send({success: true, data: classification});
  }

  @swallow
  static async deleteClassification(req, res, next) {
    let classification = await Classification.findByIdAndUpdateAsync(req.params.classification_id, {$set: {active: false}});
    return res.status(200).send({success: true, classification_id: classification._id});
  }

  @swallow
  static async getClassifications(req, res, next) {
    const query = {active: true};

    const  result = await Classification.paginate(query,
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
      total: result.total  
    });
  }


  @swallow
  static async getClassificationsOfDevices(req, res, next) {
    let classification = req.query.classification.split("-");

    //let areas = await Area.findAsync({projectId: req.query.projectId, areaType:classification[0]});
    //   //找到type是floor并且属于这个project_id的所有area
    // if(classification.length ==2  && _.indexOf(classification, "collector") > -1){   //这个适用于building-collector department-collector
    //   areas = await Area.populateAsync(areas, [{path: 'collectors', model: 'Collector'}]);
    // }else if(classification.length ==2  && _.indexOf(classification, "subareas") > -1){   //building-subareas
    //   areas = await Area.populateAsync(areas, [{path: 'subareas', model: 'Area'}]);
    // }

    //前端根据是否含有collector来进行显示
    //areas = await Area.populateAsync(areas, [{path: 'subareas', model: 'Area'},{path: 'collectors', model: 'Collector'}]);

    const areas = await Area.find({
      active: true, projectId: req.query.projectId, areaType:classification[0]
    }).populate([
      //{path: 'posts', model: 'Post', select: 'pic', options: {limit: 1}},
      {path: 'subareas', model: 'Area'},{path: 'collectors', model: 'Collector'}
    ]).exec();
    return res.status(200).json({success: true, data: areas});
  }

}
