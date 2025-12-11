const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

// 设置静态文件夹，也就是前端文件存放的位置
app.use(express.static(__dirname + '/public'));

// 监听客户端连接
io.on('connection', (socket) => {
  console.log('有新用户连接: ' + socket.id);

  // 监听 'drawing' 事件（当有人画画时）
  socket.on('drawing', (data) => {
    // 将画画的数据广播给除了发送者之外的所有人
    socket.broadcast.emit('drawing', data);
  });

  socket.on('disconnect', () => {
    console.log('用户断开连接');
  });
});

http.listen(port, () => {
  console.log('服务器运行在端口: ' + port);
});
