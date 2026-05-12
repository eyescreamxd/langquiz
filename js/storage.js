const KEY = 'langquiz:v1';
const EMPTY = { version: 1, sessions: 0, letters: {} };

let memoryFallback = null;
let useFallback = false;

function readRaw() {
  if (useFallback) return structuredClone(memoryFallback);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(EMPTY);
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1) return structuredClone(EMPTY);
    return parsed;
  } catch (_) {
    useFallback = true;
    memoryFallback = structuredClone(EMPTY);
    return memoryFallback;
  }
}

function writeRaw(state) {
  if (useFallback) { memoryFallback = state; return; }
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (_) {
    useFallback = true;
    memoryFallback = state;
  }
}

export function load() {
  return readRaw();
}

export function recordSession(letterResults) {
  // letterResults: { [char]: { mode: 'quiz'|'writing', seen: number, errors: number } }
  const state = readRaw();
  state.sessions += 1;
  for (const [char, r] of Object.entries(letterResults)) {
    const entry = state.letters[char] || { quizSeen: 0, quizErrors: 0, writeSeen: 0, writeErrors: 0 };
    if (r.mode === 'quiz') {
      entry.quizSeen += r.seen;
      entry.quizErrors += r.errors;
    } else {
      entry.writeSeen += r.seen;
      entry.writeErrors += r.errors;
    }
    state.letters[char] = entry;
  }
  writeRaw(state);
  return state;
}

export function weakLetters(limit = 5) {
  const state = readRaw();
  const out = [];
  for (const [char, e] of Object.entries(state.letters)) {
    const seen = e.quizSeen + e.writeSeen;
    const errors = e.quizErrors + e.writeErrors;
    if (seen < 2) continue;
    const rate = errors / seen;
    if (rate < 0.3) continue;
    out.push({ char, rate, errors, seen });
  }
  out.sort((a, b) => b.rate - a.rate);
  return out.slice(0, limit);
}

export function reset() {
  try { localStorage.removeItem(KEY); } catch (_) {}
  useFallback = false;
  memoryFallback = null;
}
