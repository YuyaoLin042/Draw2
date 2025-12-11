const socket = io();
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => drawing = false);

canvas.addEventListener('mousemove', e => {
  if (!drawing) return;

  const pos = { x: e.clientX, y: e.clientY };
  draw(pos, 'black');
  socket.emit('draw', pos);
});

socket.on('draw', pos => {
  draw(pos, 'red');
});

function draw(pos, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
  ctx.fill();
}
