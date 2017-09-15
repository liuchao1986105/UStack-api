import express from 'express';
import passport from 'passport';
import auth from '../auth.service';
import validator from 'validator';
import { User } from '../../models/user';
const ObjectId = require('mongoose').Types.ObjectId;

const router = express.Router();

router.post('/signin',  function(req, res, next) {
  const name = validator.trim(req.body.name);
  const password = validator.trim(req.body.password);

  let errorMsg;
  if (!name || !password) {
    errorMsg = '用户名或密码不能为空';
  }
  if (errorMsg) {
    return res.status(422).send({success:false, error_msg: errorMsg});
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.status(401).send({success:false, error_msg: err});
    }
    if (info) {
      return res.status(403).send(info);
    }

    const token = auth.signToken(user._id);

    return res.status(200).json({success:true, token: token});
  })(req, res, next);
});


module.exports = router;
