import Promise from 'bluebird';
import { DeviceType } from '../../src/models/deviceType';
import deviceTypes from './deviceTypes';

async putDatas(){

    //device type
    const promises = deviceTypes.map((deviceType) => {
        let devType = new DeviceType(deviceType);
        return devType.saveAsync();
    });
    await Promise.all(promises).catch();

    //user
    //sensor type
}