import Promise from 'bluebird';
import { User } from '../models/user';
import UserService from '../service/user.service';
import { swallow } from '../utils/decorators';
import captchapng from 'captchapng';
import validator from 'validator';
import config from '../config/env';
import auth from '../auth/auth.service';
import moment from 'moment'
import mail from '../utils/email';
import jwt from 'jsonwebtoken';
import  _ from 'lodash'

export default class UserController {
  /*用户的详细信息*/
  @swallow
  static async getUser(req, res, next) {
    let user = await User.findByIdAsync(req.params.user_id);
    if(user){
      return res.status(200).send({success: true, data: user});
    }else{
      return res.status(403).send({success: false, error_msg: '不存在该用户'});
    }
  }

  @swallow
  static async addUser(req, res, next) {
    let error = await UserService.validateUserInfo(req, res);
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    const newUser = new User(req.body);
    newUser.name = req.body.name;
    newUser.password = "123456";  //默认密码
    const headimgurl = _.random(1,config.imgCount) + '.jpg';
    newUser.headimgurl = config.qiniuImageUrl + headimgurl;
    newUser.ownerId = req.user._id;

    let user = await newUser.saveAsync();
    return res.status(200).json({success:true, data: user});
  }

  @swallow
  static async validateUserInfo(req, res, next) {
    let error = await UserService.validateUserInfo(req, res);
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }
    return res.status(200).json({success:true});
  }

  @swallow
  static async validateUserUpdateInfo(req, res, next) {
    let error = await UserService.validateUserUpdateInfo(req, res);
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }

    return res.status(200).json({success:true});
  }


  @swallow
  static async getUsers(req, res, next){
    const page = parseInt(req.query.page, 10) || 1;
    let query = {active: true};
    let sort = {created_at: -1};

    if(req.query.name){
      let search  = validator.trim(req.query.name)
      query.name = new RegExp(search, 'i');
    }

    if(req.query.position){
      let position  = validator.trim(req.query.position)
      query.position = new RegExp(position, 'i');
    }

    if(req.query.projectId){
      query.projectId = req.query.projectId;
    }

    const  result = await User.paginate(query,
      {
        populate: [
           {path: 'projectId', model: 'Project', select: '_id title'},
        ],
        page: page,
        limit: Number(req.query.limit) || config.maxLimit,
        sort: sort,
      });

    res.json({
      data: result.docs,
      count: result.pages,  //总页数
      total: result.total  //总用户数
    });
  }


  @swallow
  static async getMe(req, res, next) {
    const userId = req.user._id;
    let user = await User.findByIdAsync(userId);
    if(user){
      return res.status(200).send({success: true, data: user.userInfo});
    }else{
      return res.status(403).send({success: false, error_msg: '不存在该用户'});
    }
    
  }

  @swallow
  static async signUp(req, res, next){
    const name = validator.trim(req.body.name);
    const email = validator.trim(req.body.email);
    const password = validator.trim(req.body.password);
    let errorMsg;

    if (process.env.NODE_ENV !== 'test') {
      if (!req.body.captcha) {
        errorMsg = '验证码不能为空';
      } else if (req.session.captcha !== parseInt(req.body.captcha)) {
        errorMsg = '验证码错误';
      }
    }

    if (!name || !password) {
      errorMsg = '用户名或密码不能为空';
    } else if(!email) {
      errorMsg = '邮箱地址不能为空';
    }else if(!validator.isEmail(email)) {
      errorMsg = "邮箱地址不合法";
    }

    let user = await User.findOneAsync({email:email});
    if (user){
      errorMsg = "该邮箱名已经存在";
    }
    user = await User.findOneAsync({name:name});
    if (user){
      errorMsg = "该用户名已经存在";
    }

    if (errorMsg) {
      return res.status(422).send({success:false, error_msg: errorMsg});
    }

    const newUser = new User();    //var newUser = new User(req.body);
    newUser.name = name;
    newUser.email = email;
    newUser.password = password;
    // newUser.phone = req.body.phone;
    const headimgurl = _.random(1,config.imgCount) + '.jpg';
    newUser.headimgurl = config.qiniuImageUrl + headimgurl;
    newUser.role = ((_.indexOf(config.admins, name) > -1) ? 'super_admin' : 'admin');

    user = await newUser.saveAsync();
    const token = auth.signToken(user._id);
    return res.status(200).json({success:true, token: token});
  }

  @swallow
  static async updateUser(req, res, next){
    if ((req.params.user_id !== req.user._id.toString()) && (req.user.role !== 'admin'  && req.user.role !== 'super_admin')) {
      return res.status(403).send({success: false, error_msg: '没有权限对该用户进行更新'});
    }

    let error = await UserService.validateUserUpdateInfo(req, res);
    if(error){
      return res.status(422).send({success: false, error_msg: error});
    }
    let user = await User.findByIdAndUpdateAsync(req.params.user_id, req.body, {new:true});

    return res.status(200).send({success: true, data: user});
  }

  @swallow
  static async setUser(req, res, next){
    const user = await User.findByIdAndUpdateAsync(req.user._id, req.body, {new:true});
    return res.status(200).send({success: true, data: user});
  }

  @swallow
  static async deleteUser(req, res, next){
    const userId = req.user._id;

    if(String(userId) === String(req.params.user_id)){
      return res.status(403).send({success: false, err_msg:"不能删除自己已经登录的账号"});
    }
    let user = await User.findByIdAsync(req.params.user_id);
    user.active = false;
    await user.saveAsync();
    return res.status(200).send({success: true, user_id: user._id});
  }

  static async sendResetMail(req, res, next){
    const user = await User.findOneAsync({email:req.body.email});
    if (user){
      const token = auth.signToken(req.body.email);
      mail.sendResetPassMail(req.body.email, token);
      return res.status(200).send({success: true});
    }else{
      return res.status(403).send({success: false, error_msg: '不存在该邮箱对应的用户'});
    }
  }

  static async sendResetPassword(req, res, next){
    const eamil = jwt.decode(req.body.key);
    const user = await User.findOneAsync({email: eamil._id});
    if(user){
      user.password = req.body.password;
      await user.saveAsync();
      return res.status(200).send({success: true});
    }else{
      return res.status(403).send({success: false, error_msg: '不存在邮箱指定的用户'});
    }
  }

  static async modifyPassword(req, res, next){
    console.log("user:"+JSON.stringify(req.user))
    const user = await User.findByIdAsync(req.user._id);
    if (user){
      user.password = req.body.password;
      await user.saveAsync();
      return res.status(200).send({success: true});
    }else{
      return res.status(403).send({success: false, error_msg: '不存在该邮箱对应的用户'});
    }
  }

  static getCaptcha(req, res, next){
    let captcha = parseInt(Math.random() * 9000 + 1000);
    global.logger.debug(req.session);
    req.session.captcha = captcha;
    const pic = new captchapng(80, 30, captcha);
    pic.color(0, 0, 0, 0);
    pic.color(200, 200, 200, 255);

    const img = pic.getBase64();
    const imgbase64 = new Buffer(img, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });

    return res.end(imgbase64);
  }

}
