import { getAlphabet } from './app.js';
import { weakLetters } from './storage.js';

function buildEntries(types) {
  const alpha = getAlphabet();
  const result = [];
  for (const type of types) {
    for (const [char, info] of Object.entries(alpha[type])) {
      result.push({ char, translits: info.translits, ru: info.ru });
    }
  }
  return result;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const SETS = {
  random10: { label: '10 случайных', build: () => shuffle(buildEntries(['capital', 'lower'])).slice(0, 10) },
  capital:  { label: 'Заглавные',    build: () => shuffle(buildEntries(['capital'])) },
  lower:    { label: 'Строчные',     build: () => shuffle(buildEntries(['lower'])) },
  all:      { label: 'Все',          build: () => shuffle(buildEntries(['capital', 'lower'])) },
  weak:     { label: 'Тренировать слабые', build: () => {
    const weak = weakLetters(10);
    if (weak.length === 0) return [];
    const allEntries = buildEntries(['capital', 'lower']);
    const byChar = new Map(allEntries.map(e => [e.char, e]));
    return weak.map(w => byChar.get(w.char)).filter(Boolean);
  } },
};

export function isWeakAvailable() {
  return weakLetters(10).length >= 5;
}
