import Promise from 'bluebird';
import { DeviceType } from '../models/deviceType';
import { Sensor } from '../models/sensor';
import { Device } from '../models/device';

export default class DeviceService {
  static async _createDeviceAndSensors(deviceType, device) {
    //根据deviceType默认创建sensor
    const devicetype = await DeviceType.findById(deviceType).populate('sensortypes').exec();
    const sensortypes = devicetype.sensortypes;
    
    if(sensortypes && sensortypes.length > 0){
      await Promise.map(sensortypes, (sensortype, index) => {
        const data = {
          deviceId: device._id,
          title: sensortype.title,
          sensorTypeId: sensortype._id,
          operation: sensortype.operation,
          sensorcode: sensortype.typeNum
        }
        const sensor = new Sensor(data);
        sensor.save();
        device.sensors.addToSet(sensor);
        return device.saveAsync();
      });
    }
    return device
  }

  /*通过设备id找到属于哪个project_id */
  static async getProjectFromDevice(device_id,cb) {
    const device = await Device.findByIdAsync(device_id);
    const project_id = device.projectId;
    cb && cb(null,project_id);
  }
}