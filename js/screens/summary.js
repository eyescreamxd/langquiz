import { go, session } from '../app.js';
import { recordSession } from '../storage.js';

export function mount(root) {
  function render() {
    const total = session.letters.length;
    const errorChars = Object.entries(session.errors)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1]);
    const totalErrors = errorChars.reduce((acc, [, n]) => acc + n, 0);

    const results = {};
    for (const { char } of session.letters) {
      results[char] = { mode: session.mode, seen: 1, errors: session.errors[char] || 0 };
    }
    recordSession(results);

    root.innerHTML = `
      <h1>Готово!</h1>
      <div class="summary-stats">
        <div class="summary-stat">
          <div class="stat-value">${total}</div>
          <div class="stat-label">букв</div>
        </div>
        <div class="summary-stat">
          <div class="stat-value">${totalErrors}</div>
          <div class="stat-label">ошибок</div>
        </div>
      </div>
      ${errorChars.length ? `
        <div class="label">Сложные буквы</div>
        <div class="summary-letters">
          ${errorChars.map(([c, n]) => `
            <div class="summary-letter">
              <span class="char">${c}</span>
              <span class="count">×${n}</span>
            </div>
          `).join('')}
        </div>
      ` : `<p class="subtitle">Без ошибок!</p>`}
      <div class="actions">
        <button class="btn btn-ghost" data-action="home">На главную</button>
        <button class="btn btn-primary" data-action="again">Ещё раз</button>
      </div>
    `;
    root.querySelector('[data-action="home"]').addEventListener('click', () => go('welcome'));
    root.querySelector('[data-action="again"]').addEventListener('click', () => go('setup', { mode: session.mode }));
  }
  window.addEventListener('screen:enter', (e) => {
    if (e.detail.screen === 'summary') render();
  });
}
