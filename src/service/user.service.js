import { User } from '../models/user';
import { swallow} from '../utils/decorators';
import validate from '../utils/tools/validator';
import validator from 'validator';
import _ from 'lodash';

export default class UserService {
  @swallow
  static async validateUserInfo(req, res) {
    let error = '';
    if(req.body.name){
      error += await validate.validateExist('name', req.body.name, '该用户名已经存在 ', User);
    }
    
    if(req.body.phone){
      if(!(/^1[3|4|5|7|8][0-9]{9}$/.test(req.body.phone))){
        error = "手机号不合法";
      }else{
        error += await validate.validateExist('phone', req.body.phone, '该手机号已经存在 ', User);
      }
    }

    if(req.body.email){
      error += await validate.validateExist('email', req.body.email, '该邮箱已经存在 ', User);
    }

    return error
  }

  @swallow
  static async validateUserUpdateInfo(req, res) {
    let error = '';
    let user = await User.findByIdAsync(req.params.user_id);

    if (user.name != req.body.name){
      error += await validate.validateExist('name', req.body.name, '该用户名已经存在 ', User);
    }

    if(req.body.phone){
      if(!(/^1[3|4|5|7|8][0-9]{9}$/.test(req.body.phone))){
        error = "手机号不合法";
      }else{
        if (user.phone != req.body.phone){
          error += await validate.validateExist('phone', req.body.phone, '该手机号已经存在 ', User);
        }
      }
    }

    if(req.body.email){
      if(!validator.isEmail(req.body.email)){
        error = "邮箱地址不合法";
      }else{
        if (user.email != req.body.email){
          error += await validate.validateExist('email', req.body.email, '该邮箱已经存在 ', User);
        }
      }
    }
    return  error
  }
}