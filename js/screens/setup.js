import { go, session } from '../app.js';
import { SETS, isWeakAvailable } from '../letterSets.js?v=2';

let currentMode = null;
let currentSet = 'random10';
let currentDifficulty = 'easy';

export function mount(root) {
  function render() {
    const weakAvail = isWeakAvailable();
    const setKeys = ['random10', 'capital', 'lower', 'all'].concat(weakAvail ? ['weak'] : []);
    root.innerHTML = `
      <h2>${currentMode === 'quiz' ? 'Узнавание букв' : 'Прописи'}</h2>
      <div class="label">Выбери набор</div>
      <div class="option-list">
        ${setKeys.map(k => `
          <button class="option ${k === currentSet ? 'selected' : ''}" data-set="${k}">
            ${SETS[k].label}
          </button>
        `).join('')}
      </div>
      ${currentMode === 'writing' ? `
        <div class="label">Сложность</div>
        <div class="option-list option-list-row">
          <button class="option ${currentDifficulty === 'easy' ? 'selected' : ''}" data-difficulty="easy">Лёгкий — с силуэтом</button>
          <button class="option ${currentDifficulty === 'hard' ? 'selected' : ''}" data-difficulty="hard">Сложный — без силуэта</button>
        </div>
      ` : ''}
      <div class="actions">
        <button class="btn btn-ghost" data-action="back">Назад</button>
        <button class="btn btn-primary" data-action="start">Начать</button>
      </div>
    `;

    root.querySelectorAll('button[data-set]').forEach(b => {
      b.addEventListener('click', () => { currentSet = b.dataset.set; render(); });
    });
    root.querySelectorAll('button[data-difficulty]').forEach(b => {
      b.addEventListener('click', () => { currentDifficulty = b.dataset.difficulty; render(); });
    });
    root.querySelector('button[data-action="back"]').addEventListener('click', () => go('welcome'));
    root.querySelector('button[data-action="start"]').addEventListener('click', start);
  }

  function start() {
    const letters = SETS[currentSet].build();
    if (letters.length === 0) {
      alert('Не удалось собрать набор букв. Попробуй другой.');
      return;
    }
    session.mode = currentMode;
    session.difficulty = currentMode === 'writing' ? currentDifficulty : null;
    session.letters = letters;
    session.index = 0;
    session.errors = {};
    go(currentMode);
  }

  window.addEventListener('screen:enter', (e) => {
    if (e.detail.screen !== 'setup') return;
    currentMode = e.detail.payload?.mode || 'quiz';
    currentSet = 'random10';
    currentDifficulty = 'easy';
    render();
  });
}
