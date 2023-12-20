const sharedCanvas = wx.getSharedCanvas();
const ctx = sharedCanvas.getContext('2d');

const input = document.createElement('input');
input.type = 'text';
input.style.display = 'none';
document.body.appendChild(input);

wx.onTouchStart((e) => {
  const x = e.touches[0].clientX;
  const y = e.touches[0].clientY;

  if (x >= 50 && x <= 200 && y >= 10 && y <= 40) {
    input.style.display = 'block';
    input.focus();
  } else {
    input.style.display = 'none';
    input.blur();
  }
});

function render() {
  ctx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 10, 150, 30);

  ctx.fillStyle = '#000000';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(input.value, 50 + 150 / 2, 10 + 30 / 2);

  requestAnimationFrame(render);
}

wx.onMessage((data) => {
  if (data.type === 'getSurveyId') {
    data.callback(input.value);
  }
});

render();
