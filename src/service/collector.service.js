import { Collector } from '../models/collector';
import { swallow, innerSwallow} from '../utils/decorators';
import { Area } from '../models/area';
import { Device } from '../models/device';

export default class CollectorService {
  @innerSwallow
  static async _deleteCollectorIdFromArea(area_id, collector_id) {
    await Area.findByIdAndUpdateAsync(area_id, {$pull: {collectors: collector_id}});
  }

  @innerSwallow
  static async _deleteCollectorIdFromDevice(device_id) {
    await Device.findByIdAndUpdateAsync(device_id, {$set: {collectorId: null}});
  }
}