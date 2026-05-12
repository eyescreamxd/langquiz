import { go } from '../app.js';
import { weakLetters } from '../storage.js';
import { isFontUnavailable } from '../writing/reference.js';

export function mount(root) {
  function render() {
    const weak = weakLetters(5);
    root.innerHTML = `
      <h1>Армянский алфавит</h1>
      <p class="subtitle">Тренажёр узнавания и прописи букв</p>
      <div class="mode-buttons">
        <button class="btn btn-primary btn-large" data-mode="quiz">Узнавание букв</button>
        <button class="btn btn-primary btn-large" data-mode="writing" ${isFontUnavailable() ? 'disabled' : ''}>Прописи</button>
        ${isFontUnavailable() ? `<p class="font-error">Не удалось загрузить шрифт, перезагрузите страницу.</p>` : ''}
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
  }
  window.addEventListener('screen:enter', (e) => {
    if (e.detail.screen === 'welcome') render();
  });
  render();
  import('../writing/reference.js').then(({ ensureFontReady }) => {
    ensureFontReady().then(() => render());
  });
}
