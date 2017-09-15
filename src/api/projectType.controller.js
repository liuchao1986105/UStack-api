import Promise from 'bluebird';
import { ProjectType } from '../models/projectType';
import { swallow } from '../utils/decorators';
import validate from '../utils/tools/validator';
import _ from 'lodash';

export default class ProjectTypeController {
  @swallow
  static async getProjectType(req, res, next) {
    const protype = await ProjectType.findByIdAsync(req.params.protype_id);
    res.json({success: true, data: protype});
  }

  @swallow
  static async addProjectType(req, res, next) {
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '项目类型不能为空 ');

    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }
    const protype = await ProjectType.createAsync(req.body);
    return res.status(200).json({ success: true, data:protype});
  }


  @swallow
  static async updateProjectType(req, res, next){
    let error = '';
    error += validate.validateEmptyOrNull(req.body.title, '项目类型不能为空 ');
    
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const protype = await ProjectType.findByIdAndUpdateAsync(req.params.protype_id , req.body, {new:true});
    return res.status(200).send({success: true, data: protype});
  }

  @swallow
  static async deleteProjectType(req, res, next) {
    let protype = await ProjectType.findByIdAndUpdateAsync(req.params.protype_id, {$set: {active: false}});
    return res.status(200).send({success: true, protype_id: protype._id});
  }

  @swallow
  static async getProjectTypes(req, res, next) {
    const query = {active: true};
    
    let protypes = await ProjectType.findAsync(query, null, {
      // skip: 0, // Starting Row
      // limit: 10, // Ending Row
      sort: {
        created_at: -1,
      },
    });

    //protypes = await ProjectType.populateAsync(protypes, [{path: 'classifications', model: 'Classification'}]);
    return res.status(200).json({success: true, data: protypes});
  }
}
