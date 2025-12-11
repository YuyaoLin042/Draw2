const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', socket => {
  socket.on('draw', data => {
    socket.broadcast.emit('draw', data);
  });
});

server.listen(3000, () => console.log('Listening on http://localhost:3000'));
