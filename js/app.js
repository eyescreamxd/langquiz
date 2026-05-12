import { languages } from './data.js';
import { ensureFontReady } from './writing/reference.js';

const SCREENS = ['welcome', 'setup', 'quiz', 'writing', 'summary'];
const elements = {};

export const session = {
  mode: null,       // 'quiz' | 'writing'
  difficulty: null, // 'easy' | 'hard' (writing only)
  letters: [],      // array of { char, translits }
  index: 0,
  errors: {},       // { [char]: errorCount }
};

export function go(screen, payload) {
  if (!SCREENS.includes(screen)) throw new Error(`Unknown screen: ${screen}`);
  for (const name of SCREENS) elements[name].classList.add('hidden');
  elements[screen].classList.remove('hidden');
  window.dispatchEvent(new CustomEvent('screen:enter', { detail: { screen, payload } }));
}

export function getAlphabet() {
  return languages.armenian;
}

window.addEventListener('DOMContentLoaded', async () => {
  for (const name of SCREENS) {
    elements[name] = document.getElementById(`screen-${name}`);
  }
  ensureFontReady(); // pre-warm; fire-and-forget
  await Promise.all([
    import('./screens/welcome.js').then(m => m.mount(elements.welcome)),
    import('./screens/setup.js').then(m => m.mount(elements.setup)),
    import('./screens/quiz.js').then(m => m.mount(elements.quiz)),
    import('./screens/writing.js').then(m => m.mount(elements.writing)),
    import('./screens/summary.js').then(m => m.mount(elements.summary)),
  ]);
  go('welcome');
});
