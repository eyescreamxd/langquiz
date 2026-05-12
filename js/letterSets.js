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
  all:     { label: 'Все буквы',     build: () => shuffle(buildEntries(['capital', 'lower'])) },
  capital: { label: 'Заглавные',     build: () => shuffle(buildEntries(['capital'])) },
  lower:   { label: 'Строчные',      build: () => shuffle(buildEntries(['lower'])) },
  weak:    { label: 'Сложные буквы', build: () => {
    const weak = weakLetters(40);
    if (weak.length === 0) return [];
    const allEntries = buildEntries(['capital', 'lower']);
    const byChar = new Map(allEntries.map(e => [e.char, e]));
    return weak.map(w => byChar.get(w.char)).filter(Boolean);
  } },
};

export const LENGTHS = [
  { value: 5,    label: '5' },
  { value: 10,   label: '10' },
  { value: 20,   label: '20' },
  { value: null, label: 'Все' },
];

export function applyLength(entries, length) {
  if (length == null) return entries;
  return entries.slice(0, length);
}

export function isWeakAvailable() {
  return weakLetters(10).length >= 5;
}

// Pool used by pick mode when it needs additional distractors beyond the session
export function getAllEntries() {
  return buildEntries(['capital', 'lower']);
}
