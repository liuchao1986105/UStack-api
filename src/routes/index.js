// RESTful API Design
// http://www.ruanyifeng.com/blog/2014/05/restful_api.html
// http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api
import auth from '../auth/auth.service';
import limit from '../middlewares/limit';
import config from '../config/env';
import { User } from '../models/user';

import UserController from '../api/user.controller';
import MessageController from '../api/message.controller';
import ImageController from '../api/image.controller';
import SysconfigController from '../api/sysconfig.controller';
import ProjectTypeController from '../api/projectType.controller';
import ProjectController from '../api/project.controller';
import SensorTypeController from '../api/sensorType.controller';
import SensorController from '../api/sensor.controller';
import DeviceTypeController from '../api/deviceType.controller';
import DatapointController from '../api/datapoint.controller';
import DeviceController from '../api/device.controller';
import CollectorController from  '../api/collector.controller';
import AlarmController from  '../api/alarm.controller';
import LogController from  '../api/log.controller';
import AreaController from  '../api/area.controller';
import AreaTypeController from  '../api/areaType.controller';
import ClassificationController from  '../api/classification.controller';
import StatisticsController from  '../api/statistics.controller';

import WechatController from '../api/wechat.controller';

import express from 'express';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

// Passport Configuration
require('../auth/local/passport').setup(User, config);
require('../auth/weibo/passport').setup(User, config);
require('../auth/qq/passport').setup(User, config);

const router = express.Router();
// router.post('/topics', middleware.auth, limit.peruserperday('create_topic', config.create_post_per_day), topicController.create);

// 基本功能
router.use('/auth', require('../auth/local'));  // 本地的登录(/auth/signin)
// router.use('/auth/weibo', require('../auth/weibo'));
router.use('/auth/qq', require('../auth/qq'));

//wechat
router.post('/wechat/token', WechatController.getToken); //微信小程序获取token
router.post('/wechat/verifyToken', WechatController.verifyToken);

//datapoint
router.get('/datapoints', auth.isAuthenticated(), DatapointController.getDatapoints);
router.get('/exportExcel',auth.isAuthenticated(),  DatapointController.exportExcel);
router.get('/importExcel', auth.isAuthenticated(), DatapointController.importExcel);

// user
router.get('/users', auth.isAuthenticated(), UserController.getUsers);
router.post('/users', auth.hasRole('admin'), UserController.addUser);
router.get('/users/me', auth.isAuthenticated(), UserController.getMe);
router.get('/users/getCaptcha', UserController.getCaptcha);
router.post('/users/signUp', UserController.signUp);
router.get('/users/:user_id', auth.isAuthenticated(), UserController.getUser);
router.put('/users/mdUser', auth.isAuthenticated(), UserController.setUser);
router.put('/users/modifyPassword', auth.isAuthenticated(), UserController.modifyPassword);
router.put('/users/:user_id', auth.isAuthenticated(), UserController.updateUser);
router.delete('/users/:user_id', auth.hasRole('admin'), UserController.deleteUser);
router.post('/users/sendResetMail', UserController.sendResetMail);
router.post('/users/sendResetPassword', UserController.sendResetPassword);
router.post('/users/validateUserInfo', UserController.validateUserInfo);
router.post('/users/validateUserUpdateInfo/:user_id', UserController.validateUserUpdateInfo);

//Statistics
router.get('/statistics/hourday',  auth.isAuthenticated(), StatisticsController.getHourDataOfDay);
router.get('/statistics/daymonth',  auth.isAuthenticated(), StatisticsController.getDayDataOfMonth);
router.get('/statistics/monthyear',  auth.isAuthenticated(), StatisticsController.getMonthDataOfYear);
router.get('/statistics/allhourday',  auth.isAuthenticated(), StatisticsController.getAllHourDataOfDay);

//device type
router.get('/devicetypes', auth.hasRole('admin'), DeviceTypeController.getDeviceTypes);
router.post('/devicetypes', auth.hasRole('super_admin'), DeviceTypeController.addDeviceType);
router.get('/devicetypes/:devicetype_id', auth.hasRole('super_admin'), DeviceTypeController.getDeviceType);
router.put('/devicetypes/:devicetype_id', auth.hasRole('super_admin'), DeviceTypeController.updateDeviceType);
router.delete('/devicetypes/:devicetype_id', auth.hasRole('super_admin'), DeviceTypeController.deleteDeviceType);

//device 
router.get('/devices', auth.hasRole('admin'), DeviceController.getDevices);
router.post('/devices', auth.hasRole('admin'), DeviceController.addDevice);
router.get('/devices/:device_id', auth.hasRole('admin'), DeviceController.getDevice);
router.put('/devices/:device_id/addSensor', auth.hasRole('admin'), DeviceController.addSensorForDevice);
router.put('/devices/:device_id', auth.hasRole('admin'), DeviceController.updateDevice);
router.delete('/devices/:device_id', auth.hasRole('admin'), DeviceController.deleteDevice);
router.post('/devices/:device_id/charge', auth.isAuthenticated(), DeviceController.chargeDevice);


//collecor
router.get('/collectors', auth.hasRole('admin'), CollectorController.getCollectors);
router.post('/collectors', auth.hasRole('admin'), CollectorController.addCollector);
router.get('/collectors/:collector_id', auth.hasRole('admin'), CollectorController.getCollector);
router.put('/collectors/:collector_id', auth.hasRole('admin'), CollectorController.updateCollector);
router.delete('/collectors/:collector_id', auth.hasRole('admin'), CollectorController.deleteCollector);


//area场景
router.get('/areas', auth.hasRole('admin'), AreaController.getAreas);
router.post('/areas', auth.hasRole('admin'), AreaController.addArea);
router.get('/areas/:area_id', auth.hasRole('admin'), AreaController.getArea);
router.put('/areas/:area_id', auth.hasRole('admin'), AreaController.updateArea);
router.delete('/areas/:area_id', auth.hasRole('admin'), AreaController.deleteArea);

//areatype
router.get('/areatypes', auth.hasRole('admin'), AreaTypeController.getAreaTypes);
router.post('/areatypes', auth.hasRole('super_admin'), AreaTypeController.addAreaType);
router.get('/areatypes/:areatype_id', auth.hasRole('super_admin'), AreaTypeController.getAreaType);
router.put('/areatypes/:areatype_id', auth.hasRole('super_admin'), AreaTypeController.updateAreaType);
router.delete('/areatypes/:areatype_id', auth.hasRole('super_admin'), AreaTypeController.deleteAreaType);


//sysconfig
router.get('/sysconfigs', auth.hasRole('admin'), SysconfigController.getSysconfigs);
router.post('/sysconfigs', auth.hasRole('super_admin'), SysconfigController.addSysconfig);
router.get('/sysconfigs/:sysconfig_id', auth.hasRole('super_admin'), SysconfigController.getSysconfig);
router.put('/sysconfigs/:sysconfig_id', auth.hasRole('super_admin'), SysconfigController.updateSysconfig);
router.delete('/sysconfigs/:sysconfig_id', auth.hasRole('super_admin'), SysconfigController.deleteSysconfig);

//project type
router.get('/protypes', auth.hasRole('admin'), ProjectTypeController.getProjectTypes);
router.post('/protypes', auth.hasRole('super_admin'), ProjectTypeController.addProjectType);
router.get('/protypes/:protype_id', auth.hasRole('super_admin'), ProjectTypeController.getProjectType);
router.put('/protypes/:protype_id', auth.hasRole('super_admin'), ProjectTypeController.updateProjectType);
router.delete('/protypes/:protype_id', auth.hasRole('super_admin'), ProjectTypeController.deleteProjectType);

//project 
router.get('/projects', auth.hasRole('admin'), ProjectController.getProjects);
router.post('/projects', auth.hasRole('admin'), ProjectController.addProject);
router.get('/projects/:project_id', auth.hasRole('admin'), ProjectController.getProject);
router.put('/projects/:project_id', auth.hasRole('admin'), ProjectController.updateProject);
router.delete('/projects/:project_id', auth.hasRole('admin'), ProjectController.deleteProject);

//sensor type
router.get('/sensortypes', auth.hasRole('admin'), SensorTypeController.getSensorTypes);
router.post('/sensortypes', auth.hasRole('super_admin'), SensorTypeController.addSensorType);
router.get('/sensortypes/:sensortype_id', auth.hasRole('super_admin'), SensorTypeController.getSensorType);
router.put('/sensortypes/:sensortype_id', auth.hasRole('super_admin'), SensorTypeController.updateSensorType);
router.delete('/sensortypes/:sensortype_id', auth.hasRole('super_admin'), SensorTypeController.deleteSensorType);

//sensor 
router.get('/sensors', auth.hasRole('admin'), SensorController.getSensors);
router.post('/sensors', auth.hasRole('admin'), SensorController.addSensor);
router.get('/sensors/:sensor_id', auth.hasRole('admin'), SensorController.getSensor);
router.put('/sensors/:sensor_id', auth.hasRole('admin'), SensorController.updateSensor);
router.delete('/sensors/:device_id/:sensor_id', auth.hasRole('admin'), SensorController.deleteSensor);

// message
router.get('/messages', auth.isAuthenticated(), MessageController.getUserMessges);  //auth.isSelf(),
router.get('/messages/unReadCount', auth.isAuthenticated(), MessageController.getUnReadCount);
router.put('/messages/updateMessagesRead', auth.isAuthenticated(), MessageController.updateMessagesRead);

// alarm
router.get('/alarms', auth.isAuthenticated(), AlarmController.getUserAlarms);  //auth.isSelf(),
router.get('/alarms/unReadCount', auth.isAuthenticated(), AlarmController.getUnReadCount);
router.get('/alarms/statistics', auth.isAuthenticated(), AlarmController.getAlarmStatistics);
router.put('/alarms/updateAlarmsRead', auth.isAuthenticated(), AlarmController.updateAlarmsRead);

//log 
router.get('/logs', auth.isAuthenticated(), LogController.getLogs);
router.get('/logs/:log_id', auth.isAuthenticated(), LogController.getLog);

//classification
router.get('/classifications', auth.hasRole('admin'), ClassificationController.getClassifications);
router.post('/classifications', auth.hasRole('admin'), ClassificationController.addClassification);
router.get('/classifications/devices', auth.isAuthenticated(),  ClassificationController.getClassificationsOfDevices);
router.get('/classifications/:classification_id', auth.hasRole('admin'), ClassificationController.getClassification);
router.put('/classifications/:classification_id', auth.hasRole('admin'), ClassificationController.updateClassification);
router.delete('/classifications/:classification_id', auth.hasRole('admin'), ClassificationController.deleteClassification);

// image
router.get('/getImage', ImageController.getImage); //获取首页图片
router.post('/uploadImage', upload.single('file'), ImageController.uploadImage);
router.post('/fetchImage', auth.isAuthenticated(), ImageController.fetchImage);

router.use('/*', function(req, res, next) {
  return res.status(404).json({success: 'false', data: 'cfliu is handsome.'});
});

module.exports = router;