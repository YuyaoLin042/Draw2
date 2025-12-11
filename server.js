const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

// --- 核心改动：用来存储画画历史的数组 ---
let line_history = [];

io.on('connection', (socket) => {
  console.log('有新用户连接: ' + socket.id);

  // 1. 新用户一进来，先把之前的历史记录发给他
  for (let i in line_history) {
    socket.emit('drawing', line_history[i]);
  }

  // 2. 监听画画事件
  socket.on('drawing', (data) => {
    // 把这一笔存入历史记录
    line_history.push(data);
    
    // 广播给其他人
    socket.broadcast.emit('drawing', data);
  });
  
  // (可选) 增加一个清空画布的功能，防止历史记录无限膨胀
  // 如果你想要所有人都清空，可以在前端加个按钮发 'clear' 事件
  socket.on('clear', () => {
    line_history = []; // 清空后端记录
    io.emit('clear_canvas'); // 告诉所有人清空前端
  });

  socket.on('disconnect', () => {
    console.log('用户断开连接');
  });
});

http.listen(port, () => {
  console.log('服务器运行在端口: ' + port);
});
