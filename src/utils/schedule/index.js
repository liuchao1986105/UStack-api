import later from 'later';
import moment from 'moment';

import { User } from '../../models/user';
import { Device } from '../../models/device';
import { DeviceType } from '../../models/deviceType';
import mail from '../../utils/email';
import Queue from '../queue';

class ScheduleController {
  constructor() {
    this.timers = [];
  }

  addSchedule(scheduleText, callback) {
    //const schedule = later.parse.text();
    const schedule = later.parse.cron(scheduleText)
    global.logger.debug(later.schedule(schedule).next(5), 'schedule results');

    this.timers.push(later.setInterval(() => {
      callback();
    }, schedule));
  }

  clear() {
    this.timers.forEach((timer) => {
      timer.clear();
    });
    this.timers = [];
  }
}

// const testSchedule = later.parse.text('every 5 seconds');
// const dailySchedule = later.parse.text('at 3:00 am'); // fires at 03:00am every day

global.scheduler = new ScheduleController();

global.scheduler.clear();

function _atHour(today, hour, callback) {
  if (moment().isAfter(moment(today).add(hour, 'hours'))) {
    return;
  }

  Queue.addJob('at ' + hour + ':00', {
  }, (job) => {
    callback(job);
  }, moment(today).add(hour, 'hours').toDate());
}

function execSchedule() {
  const today = moment().startOf('day');

  // 重发未成功发送的红包order
  // RedPackTask.sendFailedRedPacks();

  // 3:00

  // 4:00

  // 5:00

  // 6:00

  // 7:00

  // 8:00

  // 9:00
  _atHour(today, 9, (job) => {
    console.log("9 clock")
  });

  // 10:00

  // 11:00

  // 12:00

  // 13:00

  // 14:00

  // 15:00

  // 16:00

  // 17:00

  // 18:00

  // 19:00

  // 20:00

  // 21:00

  // 22:00

  // 23:00

  // 24:00

  // 1:00

  // 2:00
}

//if (process.env.BACKUP_SERVER) { // 用备用docker执行定时任务

  // UTC时间 实际时间需＋8 为03:00
  global.scheduler.addSchedule('0 17 1 * *', () => {
   // global.redlock.lock('locks2:dailySchedule', 5 * 60 * 1000 /* 5 minutes */).then((lock) => {
     // execSchedule();
      //lock.unlock()
    // }).catch((err) => {
    //    global.logger.error(err);
    // });
  });
//}



// UTC时间 实际时间需＋8 为03:00
// 每月1号凌晨3点  19   //on the first day of the month
// global.scheduler.addSchedule('10 0 1 * *', () => {
//   //查所有用户的inviteds记录
//   User.findAsync({$and:[{inviteds: {$ne: null}}, {inviteds: {$ne: []}}]}).then((users) =>{
//     let infos = '';
//     infos += users.map(function (user) {
//         return '<p>'+ user.name + '邀请了 ' + user.inviteds.length + ' 好友成为会员。<p>' 
//     });

//     mail.sendInvitedsCountMail(infos);

//   })
// });


// 每月1号凌晨1点
global.scheduler.addSchedule('0 17 1 * *', () => {
  //电表每月总值num2清零
  // DeviceType.findOneAsync({typeNum:"elec_dev"}).then((devicetype)=>{
  //   Device.update({deviceTypeId: devicetype._id}, { $set: { num2: 0 } }, { multi: true }).exec();
  // });
  
});


// 每周一凌晨1点
// global.scheduler.addSchedule('0 17 * * 1', () => {
//   //monthScore清零
//   Article.update({}, { $set: { weekScore: 0 } }, { multi: true }).exec();
// });

//每隔两个小时执行一次fetch_post
// global.scheduler.addSchedule('0 */2 * * *', () => {
// });



