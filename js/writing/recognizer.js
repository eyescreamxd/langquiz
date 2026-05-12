export const THRESHOLDS = {
  easy: { coverage: 0.55, precision: 0.55, minSizeRatio: 0.15, maxAspectRatio: 2.5 },
  hard: { coverage: 0.6,  precision: 0.55, minSizeRatio: 0.15, maxAspectRatio: 2.0 },
};

const GRID = 96;

function bbox(mask, size) {
  let minX = size, minY = size, maxX = -1, maxY = -1;
  for (let y = 0; y < size; y++) {
    const row = y * size;
    for (let x = 0; x < size; x++) {
      if (mask[row + x]) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  return {
    minX, minY, maxX, maxY,
    width:  maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function rasterizeInto(mask, size, box, gridN) {
  const out = new Uint8Array(gridN * gridN);
  const stepX = box.width  / gridN;
  const stepY = box.height / gridN;
  for (let gy = 0; gy < gridN; gy++) {
    const sy = box.minY + (gy + 0.5) * stepY;
    const yi = Math.floor(sy) * size;
    const gyOff = gy * gridN;
    for (let gx = 0; gx < gridN; gx++) {
      const sx = box.minX + (gx + 0.5) * stepX;
      out[gyOff + gx] = mask[yi + Math.floor(sx)] ? 1 : 0;
    }
  }
  return out;
}

export function compare(userMask, refMask, refPixelCount, difficulty = 'easy') {
  const t = THRESHOLDS[difficulty] || THRESHOLDS.easy;

  const refBox  = bbox(refMask,  Math.sqrt(refMask.length)  | 0);
  const userBox = bbox(userMask, Math.sqrt(userMask.length) | 0);

  if (!userBox || !refBox) {
    return { passed: false, coverage: 0, precision: 0, iou: 0,
             sizeRatio: 0, userCount: 0, aspectRatio: 0 };
  }

  // Raw user pixel count (for the size sanity check)
  let userCount = 0;
  for (let i = 0; i < userMask.length; i++) if (userMask[i]) userCount++;
  const sizeRatio = refPixelCount > 0 ? userCount / refPixelCount : 0;

  // Aspect ratio sanity: how much does the user's bbox shape differ from the reference's?
  const userAR = userBox.width / userBox.height;
  const refAR  = refBox.width  / refBox.height;
  const aspectRatio = userAR > refAR ? userAR / refAR : refAR / userAR;

  // Rasterize both masks into a canonical GRID×GRID grid (bbox-aligned)
  const size = Math.sqrt(refMask.length) | 0;
  const userGrid = rasterizeInto(userMask, size, userBox, GRID);
  const refGrid  = rasterizeInto(refMask,  size, refBox,  GRID);

  let intersection = 0, union = 0, refOn = 0, userOn = 0;
  for (let i = 0; i < userGrid.length; i++) {
    const a = userGrid[i];
    const b = refGrid[i];
    if (a) userOn += 1;
    if (b) refOn  += 1;
    if (a && b) intersection += 1;
    if (a || b) union += 1;
  }

  const coverage  = refOn  > 0 ? intersection / refOn  : 0;
  const precision = userOn > 0 ? intersection / userOn : 0;
  const iou       = union  > 0 ? intersection / union  : 0;

  const sizeOk   = sizeRatio   >= t.minSizeRatio;
  const aspectOk = aspectRatio <= t.maxAspectRatio;
  const passed   = sizeOk && aspectOk &&
                   coverage  >= t.coverage &&
                   precision >= t.precision;

  return { passed, coverage, precision, iou, sizeRatio, userCount, aspectRatio };
}
