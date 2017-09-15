import mongoose from 'mongoose';
import baseModel from './base';
import timestamps from 'mongoose-timestamp';
import loadClass from 'mongoose-class-wrapper';
import mongoosePaginate from 'mongoose-paginate';
import crypto from 'crypto';

// 计算一个用户的积分
export const Values = {
  article: 10,
  video: 50,
  book: 10,
  comment: 0,
  collect: 0
};

const UserSchema = new mongoose.Schema({
  //name: { type: String, unique: true, required: true, index: true },
  name: { type: String, required: true, index: true },
  hashedPassword: {type: String},
  email: {type: String, lowercase: true},
  headimgurl: { type: String, default: '' },

  provider: { type: String, default: 'local'},
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project'},
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},

  role: { type: String, default: 'user'},
  salt: { type: String },
  active: { type: Boolean, default: true },
  is_sms: { type: Boolean, default: false },

  weixin: { type: String },  //微信
  alipay: { type: String },  //支付宝
  phone: { type: String },
  position: { type: String },  //42号204室

  weibo: {
    id: String,
    token: String,
    email: String,
    name: String,
  },
  qq: {
    id: String,
    token: String,
    email: String,
    name: String,
  },
});

class UserModel {
  get password() {
    return this._password;
  }

  set password(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  }

  get userInfo() {
    return {
      '_id': this._id,
      'name': this.name,
      'role': this.role,
      'headimgurl': this.headimgurl,
      'created_at': this.created_at,
      'email': this.email
    };
  }

  get token() {
    return {
      '_id': this._id,
      'role': this.role,
    };
  }

  // 生成盐
  makeSalt() {
    return crypto.randomBytes(16).toString('base64');
  }

  // 检查用户权限
  hasRole(role) {
    const selfRoles = this.role;
    return (selfRoles.indexOf('admin') !== -1 || selfRoles.indexOf(role) !== -1);
  }

  // 验证用户密码
  authenticate(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  }

  // 生成密码
  encryptPassword(password) {
    if (!password || !this.salt) return '';
    const salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
}

UserSchema
  .path('name')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({name: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, '该用户名已经被使用.');

UserSchema.plugin(loadClass, UserModel);
UserSchema.plugin(baseModel);
UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(timestamps, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

UserSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.hashedPassword;
    delete ret.updated_at;
    delete ret.active;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', UserSchema);


