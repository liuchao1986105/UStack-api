var mqtt = require('mqtt');

//client = mqtt.createClient(8000, 'localhost');
client  = mqtt.connect('mqtt://localhost:1883',{
    // username:'username',
    // password:'password',
    // keepalive: 10,    最小值可以为0，表示客户端不断开。
    // protocolId: 'MQIsdp',
    // protocolVersion: 3,
    clientId: 'client-a'
   // clean:false    //作用是断开连接重连的时候服务器端帮助恢复session，不需要再次订阅
});

//var client = mqtt.createClient(5112, 'localhost',{clientId:'1',clean:false});

//客户端订阅应该以设备/用户的唯一ID为channel 

//qos是为了保证离线消息
//client.subscribe('test',{qos:1});


//client.publish('testMessage', '112233');

// client.on('message', function (topic, message) {

//   console.log("receive message:"+JSON.stringify(message))

//   console.log(topic,message.toString());
//   //client.end();
// });

client.publish('testMessage', '发布new测试信息0',{qos:1,retain: false});
client.publish('testMessage', '发布new测试信息1',{qos:1,retain: false});
client.publish('testMessage', '发布new测试信息2',{qos:1,retain: false});
client.publish('testMessage', '发布new测试信息3',{qos:1,retain: false});

setTimeout(function(){
  client.end();
},5000);


//client发布
// var num = 0;
// setInterval(function (){
//   client.publish('order', 'Hello mqtt ' + (num++),{qos:1, retain: true});
// }, 1000);



////client订阅
// var mqtt = require('mqtt');

// var client = mqtt.createClient(5112, 'localhost',{clientId:'1',clean:false});

// client.subscribe('test',{qos:1});

// client.on('message', function (topic, message) {
//   console.log(message);
// });
