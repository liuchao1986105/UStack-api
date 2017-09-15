import Promise from 'bluebird';
import { Datapoint } from '../models/datapoint';
import { Device } from '../models/device';
import { Sensor } from '../models/sensor';
import { Alarm } from '../models/alarm';
import { DeviceType } from '../models/deviceType';
import { swallow } from '../utils/decorators';
import tools from '../utils/tools';
import qiniuHelper from '../utils/qiniu';
import config from '../config/env';
import _ from 'lodash';
import moment from 'moment';
import xlsx from 'node-xlsx';

import fs from 'fs';
import path from 'path'

export default class DatapointController {
  @swallow
  static async getDatapoints(req, res, next) {
    const query = {active: true};
    if(req.query.deviceId){
      query.deviceId = req.query.deviceId
    }

    if(req.query.sensorId){
      query.sensorId = req.query.sensorId
    }

    if(req.query.starttime && req.query.endtime){
      const starttime = moment(req.query.starttime).toDate();
      const endtime = moment(req.query.endtime).toDate();
      query.time = {$gte:starttime, $lte:endtime};
    }
    
    const result = await Datapoint.paginate(query, {
      populate: [
         {path: 'sensorId', model: 'Sensor', select: '_id title sensorcode'},
         {path: 'deviceId', model: 'Device', select: '_id  title'}
      ],
      page: parseInt(req.query.page, 10) || 1,
      limit: Number(req.query.limit) || config.maxLimit,
      sort: {
        time: -1
      }
    })
    res.json({
      data: result.docs,
      count: result.pages,
      total: result.total 
    });
  }

  static exportExcel(req, res, next) {
    const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
    var buffer = xlsx.build([{name: "mySheetName", data: data}]); // Returns a buffer 
    const file = 'report-'+ tools.getCurrentTime() +'.xlsx';
    fs.writeFileSync('report', buffer, 'binary');

    qiniuHelper.upload('report', 'ustack/' + file).then(function (result) {
      const url = result.url.replace(config.qnConfig.DOMAIN,config.qnConfig.DOMAIN + '/')
      fs.unlinkSync('report');
      return res.status(200).json({success:true, data: url});
    }).catch(function (err) {
      fs.unlinkSync('report');
      return res.status(200).json({ success: false, error_msg:err});
    });
  }

  @swallow
  static async importExcel(req, res, next) {
    var filename='./public/test.xlsx';  //xlsx.parse(`${__dirname}/myFile.xlsx`);
    console.error(filename);
     // read from a file
    var obj = xlsx.parse(filename);   
    console.log(JSON.stringify(obj));
     
    res.send('import successfully!');


    //读取文件内容
    // var obj = xlsx.parse(__dirname+'/test.xlsx');
    // var excelObj=obj[0].data;
    // console.log(excelObj);

    // var data = [];
    // for(var i in excelObj){
    //     var arr=[];
    //     var value=excelObj[i];
    //     for(var j in value){
    //         arr.push(value[j]);
    //     }
    //     data.push(arr);
    // }
    // var buffer = xlsx.build([
    //     {
    //         name:'sheet1',
    //         data:data
    //     }        
    // ]);
  }

}
