import { go } from '../app.js';
import { weakLetters, getStreak } from '../storage.js';
import { isFontUnavailable } from '../writing/reference.js';

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function mount(root) {
  function render() {
    const weak = weakLetters(5);
    const streak = getStreak();
    root.innerHTML = `
      <h1>Армянский алфавит</h1>
      <p class="subtitle">Тренажёр узнавания и прописи букв</p>
      ${streak > 0 ? `
        <div class="streak">${streak} ${plural(streak, 'день', 'дня', 'дней')} подряд</div>
      ` : ''}
      <div class="mode-buttons">
        <button class="btn btn-primary btn-large" data-mode="quiz">Узнавание букв</button>
        <button class="btn btn-primary btn-large" data-mode="pick">Множественный выбор</button>
        <button class="btn btn-primary btn-large" data-mode="writing" ${isFontUnavailable() ? 'disabled' : ''}>Прописи</button>
        ${isFontUnavailable() ? `<p class="font-error">Не удалось загрузить шрифт, перезагрузите страницу.</p>` : ''}
        <button class="btn btn-outline" data-action="help">Алфавит и правила ответов</button>
      </div>
      ${weak.length ? `
        <div class="weak-letters">
          <div class="label">Сложные буквы</div>
          <div class="weak-letters-row">
            ${weak.map(w => `<span class="weak-letter">${w.char}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    `;
    root.querySelectorAll('button[data-mode]').forEach(btn => {
      btn.addEventListener('click', () => go('setup', { mode: btn.dataset.mode }));
    });
    const helpBtn = root.querySelector('button[data-action="help"]');
    if (helpBtn) helpBtn.addEventListener('click', () => go('help'));
  }
  window.addEventListener('screen:enter', (e) => {
    if (e.detail.screen === 'welcome') render();
  });
  render();
  import('../writing/reference.js').then(({ ensureFontReady }) => {
    ensureFontReady().then(() => render());
  });
}
