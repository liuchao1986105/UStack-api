import { swallow } from '../decorators';
import _ from 'lodash';
import config from '../../config/env';
import validator from 'validator';
import Promise from 'bluebird';

export default class Validator {
  static validateEmptyOrNull(name, msg) {
    let error = '';
    if(!name || !validator.trim(name)) {
      error = msg;
    }
    return error
  }

  static validateNumeric(name, msg, len, lenmsg) {
    let error = '';
    if(!name || !validator.isNumeric(name)) {
      error = msg;
    }else if(name.length != len){
      error = lenmsg;
    }
    return error
  }

  static validateAlphanumeric(name, msg, len, lenmsg) {
    let error = '';
    if(!name || !validator.isAlphanumeric(name)) {
      error = msg;
    }else if(name.length != len){
      error = lenmsg;
    }
    return error
  }

  

  static validateAlpha(name, msg, len, lenmsg) {
    let error = '';
    if(!name || !validator.isAlpha(name)) {
      error = msg;
    }else if(name.length != len){
      error = lenmsg;
    }
    return error
  }


  @swallow
  static  validateExist(name, data, msg, model) {
    let error = '';
    let query = {active:true};
    query[name] = data;
    return new Promise((resolve, reject) => {
      model.findOneAsync(query).then((data) => {
        if(data){
          error = msg;
        }

        resolve(error);
      }).catch(reject);
     });
  }
}
