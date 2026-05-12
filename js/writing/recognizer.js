export const THRESHOLDS = {
  easy: { coverage: 0.3, precision: 0.55, minSizeRatio: 0.4, maxSizeRatio: 2.0 },
  hard: { coverage: 0.4, precision: 0.55, minSizeRatio: 0.4, maxSizeRatio: 2.0 },
};

export function compare(userMask, refMask, refPixelCount, difficulty = 'easy') {
  const t = THRESHOLDS[difficulty] || THRESHOLDS.easy;
  let intersection = 0;
  let union = 0;
  let userCount = 0;
  for (let i = 0; i < userMask.length; i++) {
    const a = userMask[i];
    const b = refMask[i];
    if (a) userCount += 1;
    if (a && b) intersection += 1;
    if (a || b) union += 1;
  }
  const coverage = refPixelCount > 0 ? intersection / refPixelCount : 0;
  const precision = userCount > 0 ? intersection / userCount : 0;
  const iou = union > 0 ? intersection / union : 0;
  const sizeRatio = refPixelCount > 0 ? userCount / refPixelCount : 0;

  const sizeOk = sizeRatio >= t.minSizeRatio && sizeRatio <= t.maxSizeRatio;
  const passed = sizeOk && coverage >= t.coverage && precision >= t.precision;

  return { passed, coverage, precision, iou, sizeRatio, userCount };
}
