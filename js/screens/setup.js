import { go, session } from '../app.js';
import { SETS, LENGTHS, applyLength, isWeakAvailable } from '../letterSets.js?v=3';

let currentMode = null;
let currentSet = 'all';
let currentLength = 10;
let currentDifficulty = 'easy';
let currentDirection = 'forward';

export function mount(root) {
  function render() {
    const weakAvail = isWeakAvailable();
    const setKeys = ['all', 'capital', 'lower'].concat(weakAvail ? ['weak'] : []);

    const modeTitle = ({
      quiz: 'Узнавание букв',
      pick: 'Множественный выбор',
      writing: 'Прописи',
    })[currentMode] || 'Узнавание букв';

    root.innerHTML = `
      <h2>${modeTitle}</h2>

      <div class="setup-block">
        <div class="label">Набор</div>
        <div class="option-list">
          ${setKeys.map(k => `
            <button class="option ${k === currentSet ? 'selected' : ''}" data-set="${k}">
              ${SETS[k].label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="setup-block">
        <div class="label">Сколько букв за сессию</div>
        <div class="option-list option-list-row">
          ${LENGTHS.map(l => `
            <button class="option option-compact ${l.value === currentLength ? 'selected' : ''}" data-length="${l.value === null ? 'all' : l.value}">
              ${l.label}
            </button>
          `).join('')}
        </div>
      </div>

      ${currentMode === 'pick' ? `
        <div class="setup-block">
          <div class="label">Направление</div>
          <div class="option-list option-list-row">
            <button class="option ${currentDirection === 'forward' ? 'selected' : ''}" data-direction="forward">Буква → звук</button>
            <button class="option ${currentDirection === 'reverse' ? 'selected' : ''}" data-direction="reverse">Звук → буква</button>
          </div>
        </div>
      ` : ''}

      ${currentMode === 'writing' ? `
        <div class="setup-block">
          <div class="label">Сложность</div>
          <div class="option-list option-list-row">
            <button class="option ${currentDifficulty === 'easy' ? 'selected' : ''}" data-difficulty="easy">Лёгкий — с силуэтом</button>
            <button class="option ${currentDifficulty === 'hard' ? 'selected' : ''}" data-difficulty="hard">Сложный — без силуэта</button>
          </div>
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
    root.querySelectorAll('button[data-length]').forEach(b => {
      b.addEventListener('click', () => {
        const v = b.dataset.length;
        currentLength = v === 'all' ? null : Number(v);
        render();
      });
    });
    root.querySelectorAll('button[data-direction]').forEach(b => {
      b.addEventListener('click', () => { currentDirection = b.dataset.direction; render(); });
    });
    root.querySelectorAll('button[data-difficulty]').forEach(b => {
      b.addEventListener('click', () => { currentDifficulty = b.dataset.difficulty; render(); });
    });
    root.querySelector('button[data-action="back"]').addEventListener('click', () => go('welcome'));
    root.querySelector('button[data-action="start"]').addEventListener('click', start);
  }

  function start() {
    const built = SETS[currentSet].build();
    const letters = applyLength(built, currentLength);
    if (letters.length === 0) {
      alert('Не удалось собрать набор букв. Попробуй другой.');
      return;
    }
    // Pick mode needs at least 2 letters in the pool for distractors to work
    if (currentMode === 'pick' && letters.length < 2) {
      alert('Для множественного выбора нужно минимум 2 буквы. Возьми набор побольше.');
      return;
    }
    session.mode = currentMode;
    session.difficulty = currentMode === 'writing' ? currentDifficulty : null;
    session.direction = currentMode === 'pick' ? currentDirection : null;
    session.letters = letters;
    session.index = 0;
    session.errors = {};
    go(currentMode);
  }

  window.addEventListener('screen:enter', (e) => {
    if (e.detail.screen !== 'setup') return;
    currentMode = e.detail.payload?.mode || 'quiz';
    currentSet = 'all';
    currentLength = 10;
    currentDifficulty = 'easy';
    currentDirection = 'forward';
    render();
  });
}
