const socket = io();
const canvas = document.querySelector('.whiteboard');
const context = canvas.getContext('2d');

const colorPicker = document.getElementById('colorPicker');
const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');

let current = { color: '#000000' };
let savedColor = '#000000';
let drawing = false;
let isErasing = false;

// --- 工具栏逻辑 ---
colorPicker.addEventListener('input', (e) => {
  savedColor = e.target.value;
  if (!isErasing) {
    current.color = savedColor;
  }
  switchToBrush();
});

brushBtn.addEventListener('click', switchToBrush);
eraserBtn.addEventListener('click', switchToEraser);

function switchToBrush() {
  isErasing = false;
  current.color = savedColor;
  brushBtn.classList.add('active');
  eraserBtn.classList.remove('active');
  canvas.style.cursor = 'crosshair';
}

function switchToEraser() {
  isErasing = true;
  current.color = '#ffffff'; 
  eraserBtn.classList.add('active');
  brushBtn.classList.remove('active');
  canvas.style.cursor = 'default'; 
}

// --- 画画核心逻辑 ---

canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onThrottle, 10), false);

canvas.addEventListener('touchstart', onMouseDown, false);
canvas.addEventListener('touchend', onMouseUp, false);
canvas.addEventListener('touchcancel', onMouseUp, false);
canvas.addEventListener('touchmove', throttle(onThrottle, 10), false);

// 监听服务器发来的画画数据 (包括历史记录回放，也是走的这个通道)
socket.on('drawing', onDrawingEvent);

window.addEventListener('resize', onResize, false);
onResize();

function drawLine(x0, y0, x1, y1, color, emit){
  context.beginPath();
  context.moveTo(x0, y0);
  context.lineTo(x1, y1);
  context.strokeStyle = color;
  
  // 橡皮擦逻辑：如果是白色，加粗
  if (color.toLowerCase() === '#ffffff' || color.toLowerCase() === '#fff') {
      context.lineWidth = 20; // 橡皮擦大一点
  } else {
      context.lineWidth = 2;
  }
  
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.stroke();
  context.closePath();

  if (!emit) { return; }
  
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
  current.x = getX(e);
  current.y = getY(e);
}

function onMouseUp(e){
  if (!drawing) { return; }
  drawing = false;
  drawLine(current.x, current.y, getX(e), getY(e), current.color, true);
}

function onThrottle(e){
  if (!drawing) { return; }
  let clientX = getX(e);
  let clientY = getY(e);
  drawLine(current.x, current.y, clientX, clientY, current.color, true);
  current.x = clientX;
  current.y = clientY;
}

// 辅助函数：处理鼠标和触摸坐标
function getX(e) { return e.clientX || (e.touches && e.touches[0].clientX); }
function getY(e) { return e.clientY || (e.touches && e.touches[0].clientY); }

function onDrawingEvent(data){
  const w = canvas.width;
  const h = canvas.height;
  drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}

function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

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
