export const CANVAS_SIZE = 360;

export function createDrawingCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  canvas.className = 'draw-canvas';
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1a1a1a';

  let drawing = false;
  let lastX = 0, lastY = 0;

  function toInternal(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (CANVAS_SIZE / rect.width);
    const y = (e.clientY - rect.top) * (CANVAS_SIZE / rect.height);
    return { x, y };
  }

  function onDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    drawing = true;
    canvas.setPointerCapture?.(e.pointerId);
    const { x, y } = toInternal(e);
    lastX = x; lastY = y;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01); // dot if just a tap
    ctx.stroke();
  }

  function onMove(e) {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = toInternal(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x; lastY = y;
  }

  function onUp(e) {
    if (!drawing) return;
    drawing = false;
    canvas.releasePointerCapture?.(e.pointerId);
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', onUp);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  function clear() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  function getMask() {
    const data = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
    const mask = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE);
    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      // alpha > 128 = drawn pixel
      mask[p] = data[i + 3] > 128 ? 1 : 0;
    }
    return mask;
  }

  return { canvas, clear, getMask };
}
