const socket = io(); // 连接服务器
const canvas = document.querySelector('.whiteboard');
const context = canvas.getContext('2d');
const colors = document.querySelectorAll('.color');

let current = { color: 'black' };
let drawing = false;

// 监听颜色点击
colors.forEach(color => {
  color.addEventListener('click', (e) => {
    current.color = e.target.style.background;
  });
});

// 处理画画事件
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onThrottle, 10), false);

// 触摸屏支持（手机/iPad）
canvas.addEventListener('touchstart', onMouseDown, false);
canvas.addEventListener('touchend', onMouseUp, false);
canvas.addEventListener('touchcancel', onMouseUp, false);
canvas.addEventListener('touchmove', throttle(onThrottle, 10), false);

// 监听服务器发来的画画数据（你朋友画的）
socket.on('drawing', onDrawingEvent);

// 调整画布大小
window.addEventListener('resize', onResize, false);
onResize();

function drawLine(x0, y0, x1, y1, color, emit){
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.stroke();
  context.closePath();

  if (!emit) { return; }
  
  // 获取画布宽高，发送相对坐标（解决屏幕大小不一致问题）
  const w = canvas.width;
  const h = canvas.height;

  socket.emit('drawing', {
    x0: x0 / w,
    y0: y0 / h,
    x1: x1 / w,
    y1: y1 / h,
    color: color
  });
}

function onMouseDown(e){
  drawing = true;
  current.x = e.clientX || e.touches[0].clientX;
  current.y = e.clientY || e.touches[0].clientY;
}

function onMouseUp(e){
  if (!drawing) { return; }
  drawing = false;
  drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
}

function onThrottle(e){
  if (!drawing) { return; }
  let clientX = e.clientX || e.touches[0].clientX;
  let clientY = e.clientY || e.touches[0].clientY;
  
  drawLine(current.x, current.y, clientX, clientY, current.color, true);
  current.x = clientX;
  current.y = clientY;
}

// 接收远程画画数据
function onDrawingEvent(data){
  const w = canvas.width;
  const h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}

// 调整画布尺寸
function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// 节流函数，防止发送过多数据卡顿
function throttle(callback, delay) {
  let previousCall = new Date().getTime();
  return function() {
    const time = new Date().getTime();
    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}
