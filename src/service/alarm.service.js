import { Alarm } from '../models/alarm';
import { swallow, innerSwallow} from '../utils/decorators';
import moment from 'moment';
import _ from 'lodash';

export default class AlarmService {
  @innerSwallow
  static async getAlarmGroupDayInit(start_time, end_time) {
    let starttime = moment(start_time).startOf('day');
    let endtime = moment(end_time).startOf('day').add(1, 'days');

    let groupList = [];
    //const diffs = endtime.diff(starttime, 'days')
    while (starttime < endtime){
      let group = {};
      var start = _.cloneDeep(starttime);
      var end = _.cloneDeep(starttime.add(1, 'days'));
      group.start_time = start;
      group.end_time = end;
      group.number = 0;
      groupList.push(group);
    }

    return groupList;
  }

  static async getAlarmNumDay(group){
    group.number =  await Alarm.countAsync({created_at:{$gte:group.start_time, $lte:group.end_time}});
    return group;
  }

  @innerSwallow
  static async sendAlarm(data) {
    await Alarm.createAsync(data);
    //并通过websocket给页面发消息
    global.io.to(data.projectId).emit('alarm', 'ddddd');//给project_id的客户端发送消息
  }
}