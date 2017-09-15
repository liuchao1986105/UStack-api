import Promise from 'bluebird';
import { Project } from '../models/project';
import { Device } from '../models/device';
import { swallow } from '../utils/decorators';
import validate from '../utils/tools/validator';
import config from '../config/env';
import _ from 'lodash';

export default class ProjectController {
  @swallow
  static async getProject(req, res, next) {
    const project = await Project.findById(req.params.project_id).populate([
      {path: 'projectTypeId', model: 'ProjectType', select: '_id title'},
    ]).exec();
    res.json({success: true, data: project});
  }

  @swallow
  static async addProject(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '项目名称不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const imgurl = 'thumb-' + _.random(1,13) + '.jpg';
    req.body.img = config.projectImageUrl + imgurl;
    req.body.userId = req.user._id;

    const project = await Project.createAsync(req.body);
    return res.status(200).json({ success: true, data:project});
  }


  @swallow
  static async updateProject(req, res, next){
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '项目名称不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const project = await Project.findByIdAndUpdateAsync(req.params.project_id , req.body, {new:true});
    return res.status(200).send({success: true, data: project});
  }

  @swallow
  static async deleteProject(req, res, next) {
    let project = await Project.findByIdAndUpdateAsync(req.params.project_id, {$set: {active: false}});
    //删除项目下面的所有设备
    Device.find({
      projectId: req.params.project_id
    }).limit(0).batchSize(100).stream().on('data', (device) => {
      ProjectController._deleteDevicesOfproject(device._id );
    }).on('error', (err) => {
      global.logger.error(err);
    }).on('close', () => {
      global.logger.info('delete project stream closed');
    });

    return res.status(200).send({success: true, project_id: project._id});
  }

  @swallow
  static async _deleteDevicesOfproject(device_id) {
    await Device.findByIdAndUpdateAsync(device_id ,  {$set: {active: false}});
  }

  @swallow
  static async getProjects(req, res, next) {
    const query = {active: true};

    if(req.query.userId){
      query.userId = req.query.userId;
    }

    const  result = await Project.paginate(query,
      {
        populate: [
         {path: 'userId', model: 'User', select: '_id name'},
         {path: 'projectTypeId', model: 'ProjectType', select: '_id title'},
        ],
        page: parseInt(req.query.page, 10) || 1,
        limit: Number(req.query.limit) || config.maxLimit,
        sort: {
          top: -1,
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
