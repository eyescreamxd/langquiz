import { go, session } from '../app.js';
import { createDots } from '../ui/dots.js';

export function mount(root) {
  let dots = null;
  let busy = false;

  function render() {
    root.innerHTML = `
      <div class="quiz-header">
        <span class="counter"></span>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      </div>
      <div class="card-big">
        <div class="char-big"></div>
        <input class="answer-input" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" />
        <div class="hint" hidden></div>
      </div>
      <div class="dots-mount"></div>
      <div class="quiz-controls">
        <button class="btn btn-ghost btn-icon" data-action="hint" title="Подсказка">?</button>
        <button class="btn btn-ghost btn-icon" data-action="exit" title="Выйти">×</button>
      </div>
    `;
    dots = createDots(session.letters.length);
    root.querySelector('.dots-mount').appendChild(dots.element);

    root.querySelector('[data-action="hint"]').addEventListener('click', toggleHint);
    root.querySelector('[data-action="exit"]').addEventListener('click', confirmExit);

    const input = root.querySelector('.answer-input');
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    input.addEventListener('blur', () => { if (input.value.trim()) check(); });

    showCurrent();
  }

  function showCurrent() {
    const total = session.letters.length;
    const i = session.index;
    root.querySelector('.counter').textContent = `${i + 1} / ${total}`;
    root.querySelector('.progress-fill').style.width = `${(i / total) * 100}%`;
    const { char } = session.letters[i];
    root.querySelector('.char-big').textContent = char;
    const input = root.querySelector('.answer-input');
    input.value = '';
    input.disabled = false;
    root.querySelector('.hint').hidden = true;
    root.querySelector('.card-big').classList.remove('flash-correct', 'flash-incorrect');
    dots.setCurrent(i);
    setTimeout(() => input.focus(), 0);
  }

  function check() {
    if (busy) return;
    const i = session.index;
    const { char, translits } = session.letters[i];
    const input = root.querySelector('.answer-input');
    const value = input.value.trim();
    if (!value) return;
    busy = true;
    const card = root.querySelector('.card-big');
    if (translits.includes(value)) {
      card.classList.add('flash-correct');
      input.disabled = true;
      const hadErrors = (session.errors[char] || 0) > 0;
      dots[hadErrors ? 'markFail' : 'markPass'](i);
      setTimeout(() => { busy = false; advance(); }, 400);
    } else {
      card.classList.add('flash-incorrect');
      session.errors[char] = (session.errors[char] || 0) + 1;
      setTimeout(() => {
        card.classList.remove('flash-incorrect');
        input.value = '';
        input.focus();
        busy = false;
      }, 500);
    }
  }

  function advance() {
    session.index += 1;
    if (session.index >= session.letters.length) {
      root.querySelector('.progress-fill').style.width = '100%';
      go('summary');
    } else {
      showCurrent();
    }
  }

  function toggleHint() {
    const hint = root.querySelector('.hint');
    const { translits, ru } = session.letters[session.index];
    hint.textContent = `${translits.join(', ')} · ${ru}`;
    hint.hidden = !hint.hidden;
  }

  function confirmExit() {
    if (confirm('Точно выйти? Прогресс не сохранится.')) {
      go('setup', { mode: 'quiz' });
    }
  }

  window.addEventListener('screen:enter', (e) => {
    if (e.detail.screen === 'quiz') render();
  });
}
