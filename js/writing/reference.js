import { CANVAS_SIZE } from './canvas.js';

const cache = new Map();
let fontReady = null;
let fontUnavailable = false;

export function ensureFontReady() {
  if (fontReady) return fontReady;
  fontReady = (async () => {
    const loadPromise = (async () => {
      await document.fonts.load(`bold 170px "Noto Sans Armenian"`);
      await document.fonts.ready;
      return true;
    })();
    const timeout = new Promise((resolve) => setTimeout(() => resolve(false), 3000));
    try {
      const loaded = await Promise.race([loadPromise, timeout]);
      if (!loaded) fontUnavailable = true;
      return loaded;
    } catch (e) {
      console.warn('Font readiness check failed:', e);
      fontUnavailable = true;
      return false;
    }
  })();
  return fontReady;
}

export function isFontUnavailable() {
  return fontUnavailable;
}

export async function buildReference(char) {
  if (cache.has(char)) return cache.get(char);
  await ensureFontReady();

  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE)
    : Object.assign(document.createElement('canvas'), { width: CANVAS_SIZE, height: CANVAS_SIZE });
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.font = `bold 170px "Noto Sans Armenian"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 17;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const cx = CANVAS_SIZE / 2;
  const cy = CANVAS_SIZE / 2 + 8;
  ctx.fillText(char, cx, cy);
  ctx.strokeText(char, cx, cy);

  const data = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
  const mask = new Uint8Array(CANVAS_SIZE * CANVAS_SIZE);
  let count = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const isInk = data[i] > 128;
    mask[p] = isInk ? 1 : 0;
    if (isInk) count += 1;
  }

  const silhouetteCanvas = document.createElement('canvas');
  silhouetteCanvas.width = CANVAS_SIZE;
  silhouetteCanvas.height = CANVAS_SIZE;
  const sctx = silhouetteCanvas.getContext('2d');
  sctx.fillStyle = '#1a1a1a';
  sctx.font = `bold 170px "Noto Sans Armenian"`;
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.fillText(char, cx, cy);
  const silhouetteDataUrl = silhouetteCanvas.toDataURL('image/png');

  const ref = { mask, pixelCount: count, silhouette: silhouetteDataUrl };
  cache.set(char, ref);
  return ref;
}

export function clearReferenceCache() {
  cache.clear();
}
