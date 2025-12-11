const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));

let line_history = [];

io.on('connection', (socket) => {
  // 1. 发送历史记录
  for (let i in line_history) {
    socket.emit('drawing', line_history[i]);
  }

  // 2. 接收并存储新画的线
  socket.on('drawing', (data) => {
    line_history.push(data);
    socket.broadcast.emit('drawing', data);
  });
  
  // (防止内存溢出，如果记录太多清理一下，可选)
  if(line_history.length > 10000) { line_history.shift(); }
});

http.listen(port, () => {
  console.log('Server running on port ' + port);
});
