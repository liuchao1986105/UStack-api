import { innerSwallow} from '../utils/decorators';
import { Message } from '../models/message';

export default class MessageService {
  @innerSwallow
  static async sendMessage(data) {
    await Message.createAsync(data);
    //并通过websocket给页面发消息
    global.io.to(data.projectId).emit('message', 'ddddd');//给project_id的客户端发送消息
  }
}