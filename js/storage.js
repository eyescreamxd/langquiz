const KEY = 'langquiz:v1';
const EMPTY = { version: 1, sessions: 0, letters: {}, streak: 0, lastSessionDate: null };

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(a, b) {
  // both are 'YYYY-MM-DD' strings
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / 86400000);
}

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
  // letterResults: { [char]: { mode: 'quiz'|'pick'|'writing', seen: number, errors: number } }
  const state = readRaw();
  state.sessions = (state.sessions || 0) + 1;
  state.letters = state.letters || {};
  for (const [char, r] of Object.entries(letterResults)) {
    const entry = state.letters[char] || { quizSeen: 0, quizErrors: 0, writeSeen: 0, writeErrors: 0 };
    if (r.mode === 'writing') {
      entry.writeSeen += r.seen;
      entry.writeErrors += r.errors;
    } else {
      // quiz + pick share the recognition bucket
      entry.quizSeen += r.seen;
      entry.quizErrors += r.errors;
    }
    state.letters[char] = entry;
  }

  // Streak update
  const today = todayKey();
  const last = state.lastSessionDate;
  if (last === today) {
    // already counted today, streak unchanged
  } else if (last && daysBetween(last, today) === 1) {
    state.streak = (state.streak || 0) + 1;
  } else {
    state.streak = 1;
  }
  state.lastSessionDate = today;

  writeRaw(state);
  return state;
}

export function getStreak() {
  const state = readRaw();
  const last = state.lastSessionDate;
  if (!last) return 0;
  const today = todayKey();
  // Streak alive if practiced today or yesterday
  const diff = daysBetween(last, today);
  if (diff <= 1) return state.streak || 0;
  return 0;
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
