var socket = require('socket.io-client')('http://localhost:9000');

socket.on('connect', function(){
  console.log("client connected....")
});

socket.on('report', (data) => {
  console.log("report:"+data.value)
});


socket.emit('init', '5936aa46ff3590895f2289ab');    //5936aa46ff3590895f2289ab为project_id

socket.on('disconnect', function() {
    console.log("与服务器断开");
});

//socket.emit('', data);
// socket.emit('getInfo',info, (body) => {
//                 if(body.isError){
//                     alert('用户已经在线');
//                     //browserHistory.push('/login');
//                     browserHistory.push('/');
//                 } else{
//                     body.token = info.token;
//                     dispatch(setUserInfo(body));
//                     resolve(body);
//                 }
//             })