import mosca from 'mosca';
import config from '../../config/env';
import DeviceService from '../../service/device.service';
import DatapointService from '../../service/datapoint.service';
import Xml from './xml';
import moment from 'moment';

//let subscribeTopics= global.subscribeTopics ={};
let subscribeClients= global.subscribeClients ={};

//用mongodb进行持久化数据
var settings = {
  port: 1883,
  backend:{
    type: 'mongo', 
    url: config.mongo.mqtturi,   //url: "mongodb://localhost:27017/mosca"
    pubsubCollection: 'ascoltatori',
    mongo: {}
  },
  persistence:{
    factory: mosca.persistence.Mongo,
    url: config.mongo.mqtturi
  }
};
const MqttServer = global.MqttServer = new mosca.Server(settings);

MqttServer.on('clientConnected', function(client){
    global.logger.info('client connected', client.id);
    subscribeClients[client.id]=client;
    //console.dir(Object.keys(client));
    //console.dir(Object.keys(client.connection));
});

MqttServer.on('clientDisconnected', function (client) {
    global.logger.info('Client Disconnected:', client.id);
});

//要向哪个设备充电费


//客户端发布主题时触发
//ps： server自己publish的话也会收到
MqttServer.on('published', function(packet, client) {   //新消息发布
    // var topic=packet.topic;
    // var payload=packet.payload;

    // //如果没有创建空的主题对应的client数组
    // if(subscribeTopics[topic]==null){
    //  subscribeTopics[topic]=[];
    // }else{
    //  //遍历该主题下全部client，并逐一发送消息
    //  for(var i in subscribeTopics[topic]){
    //    var client=subscribeTopics[topic][i];
    //    client.publish({
    //      topic: topic,
    //      payload: payload
    //    });
    //  }
    // }   

    var topic = packet.topic;   
    //console.log("message-arrived--->:"+ topic + ',message =' + JSON.stringify(packet.payload.toString())); 
    console.log("message-arrived--->:"+ topic); 
    switch(topic){
        case 'testMessage':
            console.log('message-publish', packet.payload.toString());
            var msg = {
                    topic: 'test',
                    payload: packet.payload,
                    qos: 1,
                    retain: false
                };

            //MQTT server转发主题消息   就是说server作为broker，进行转发，把收到的publish信息转发给其他可无端
            //MqttServer.publish(msg);    
            MqttServer.publish(msg,function(){
                console.log(' send repeat!  ');
            });

            //MQTT转发主题消息
           //MqttServer.publish({topic: 'other', payload: 'sssss'});

            //发送消息NODEJS
            //console.log('HD: '+ YHSocketMap.get('1000'));
            //发送socket.io消息 这里可以触发响应的事件给浏览器，即从中间件收到消息后如果有必要的话再去触发给页面
            //io.sockets.socket(YHSocketMap.get('1000')).emit('subState', packet);
            break;

        case 'alarm':
            //1.通过解析xml知道device_di ==> projectid.
            //2. 获取具体的报警信息，然后websocket给页面
            DeviceService.getProjectFromDevice('59454ed5a83694292a12364b',function(err,project_id){
                global.io.to(project_id).emit('alarm', 'ddddd');//给project_id的客户端发送消息
                if(err){
                    global.logger.info("callbackError:"+err);
                    //下发出错信息
                }
            })
            break;
        case 'report_data':
            let info = packet.payload.toString();

            Xml.parseXml(info,function(result){
                if(result){
                    if(result.root.data.$.operation == 'report' || result.root.data.$.operation == 'continuous'){
                          const rootData = result.root;
                          DatapointService.putReportData(rootData);
                    }
                }
            })

            break;

        case 'heartbeat':
            let beatinfo = packet.payload.toString();

            Xml.parseXml(beatinfo,function(result){
                if(result){
                    if(result.root.heart_beat.$.operation == 'notify'){
                      const obj = {
                        common:{
                          gateway_id: result.root.common.gateway_id,
                          fac_id: result.root.common.fac_id,
                          type: 'time'
                        },
                        heart_beat:
                          {
                            "$": 
                              {
                                "operation":"time"
                              },
                            time:moment().format("YYYYMMDDHHmmss")
                          }
                      };

                      const xml = Xml.buildXml(obj);
                      //global.logger.info("heart beat:"+xml)
                      //下发回去
                      client.connection._events.publish({topic: 'heartbeat_ack', payload: xml});
                    }
                }
                
            })
            break;
    }
});


//客户端订阅的话在这里会收到信息  当客户端订阅时触发
MqttServer.on('subscribed', function(topic, client) { 
    //如没有，创建空的主题对应的client数组
    // if(subscribeClients[client.id]==null){
    //  subscribeClients[client.id]=[];
    // }
    // //如果client数组中没有当前client，加入
    // if(subscribeClients[client.id].indexOf(client)==-1){
    //    subscribeClients[client.id].push(client);
    // }
    // if(subscribeClients[client.id]==null){
    //subscribeClients[client.id]=client;
    //}

    global.logger.info("subscribed topic: "+topic);  //test
    global.logger.info("subscribed client: "+client.id)  //client-a

});

//客户端取消订阅信息
MqttServer.on('unsubscribed', function(topic, client) { 
    global.logger.info('client unsubscribed...');
});
 
MqttServer.on('ready', function(){
    global.logger.info('Mosca server  is running...');
});