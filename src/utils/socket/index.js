module.exports = function (io) {
    global.sockets={};
    global.io = io;
    global.logger.info('websocket open');

    ////监听客户端连接,回调函数会传递本次连接的socket
    io.on('connect',function (socket) {  
      //如果没有创建空的主题对应的client数组
      const data = {
        value:'5',
        key:'price'
      }
      
      //socket.emit('report', data); // emit an event to the socket 
      //io.emit('broadcast', /* */); // emit an event to all connected

      socket.on('init', function(projectId){
        //加入projectid这个小组房间，然后mqtt有消息的时候往这个小组上推
        socket.join(projectId)
        // if(global.sockets[projectId]==null){
        //   global.sockets[projectId]=[];
        // }
        // let sockets = global.sockets[projectId];
        // sockets.push(socket.id)

        //获取所有客户端
        io.clients((error, clients) => {
          if (error) throw error;
          global.logger.info('clients:',clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
        });

      });  //客户端登录首页的时候注册，发送一个projectId

      socket.on('disconnect', function(){
        //从global.sockets[projectId]去除
        global.logger.info('socket disconnect', socket.id);
      });
    })
}


// io.sockets.emit(‘String’,data);//给所有客户端广播消息
// io.sockets.socket(socketid).emit(‘String’, data);//给指定的客户端发送消息
// socket.emit(‘String’, data);//给该socket的客户端发送消息

//socket.broadcast.to(message.room).emit('newMessage',message);
//socket.broadcast.to(toUser.online.socket).emit('privateMessage',send);

//1). 向所有客户端广播：socket.broadcast.emit('broadcast message');
//socket.broadcast.emit("msg",{data:"hello,everyone"}); 

//2).进入一个房间（非常好用！相当于一个命名空间，可以对一个特定的房间广播而不影响在其他房间或不在房间的客户端）：
//socket.join('your room name');

//3).向一个房间广播消息（发送者收不到消息）：socket.broadcast.to('your room name').emit('broadcast room message');

//4).向一个房间广播消息（包括发送者都能收到消息）（这个API属于io.sockets）：io.sockets.in('another room name').emit('broadcast room message

//5).强制使用WebSocket通信：（客户端）socket.send('hi')，（服务器）用socket.on('message', function(data){})来接收。
