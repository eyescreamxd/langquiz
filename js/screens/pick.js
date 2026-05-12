import { go, session } from '../app.js';
import { createDots } from '../ui/dots.js';
import { getAllEntries } from '../letterSets.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function mount(root) {
  let dots = null;
  let busy = false;

  function render() {
    root.innerHTML = `
      <div class="quiz-header">
        <span class="counter"></span>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      </div>
      <div class="pick-prompt"></div>
      <div class="pick-options"></div>
      <div class="dots-mount"></div>
      <div class="quiz-controls">
        <button class="btn btn-icon" data-action="hint" title="Подсказка">?</button>
        <button class="btn btn-icon" data-action="exit" title="Выйти">×</button>
      </div>
    `;
    dots = createDots(session.letters.length);
    root.querySelector('.dots-mount').appendChild(dots.element);
    root.querySelector('[data-action="exit"]').addEventListener('click', confirmExit);
    root.querySelector('[data-action="hint"]').addEventListener('click', revealCorrect);
    showCurrent();
  }

  function pickField() {
    return session.direction === 'reverse' ? 'char' : 'ru';
  }

  function pickPoolField() {
    // The pool from which we pull distractors uses the same field
    return pickField();
  }

  function buildChoices(correct) {
    const field = pickField();
    const seen = new Set([correct[field]]);
    // Prefer distractors from the current session — keeps focus on what's being practiced
    const sessionPool = shuffle(session.letters.filter(e => !seen.has(e[field])));
    const chosen = [];
    for (const e of sessionPool) {
      if (seen.has(e[field])) continue;
      seen.add(e[field]);
      chosen.push(e);
      if (chosen.length === 3) break;
    }
    // If session is too small, top up from the full alphabet
    if (chosen.length < 3) {
      const allPool = shuffle(getAllEntries().filter(e => !seen.has(e[field])));
      for (const e of allPool) {
        if (seen.has(e[field])) continue;
        seen.add(e[field]);
        chosen.push(e);
        if (chosen.length === 3) break;
      }
    }
    const list = [{ entry: correct, correct: true }]
      .concat(chosen.map(d => ({ entry: d, correct: false })));
    return shuffle(list);
  }

  function showCurrent() {
    const total = session.letters.length;
    const i = session.index;
    const current = session.letters[i];
    root.querySelector('.counter').textContent = `${i + 1} / ${total}`;
    root.querySelector('.progress-fill').style.width = `${(i / total) * 100}%`;
    dots.setCurrent(i);

    const reverse = session.direction === 'reverse';
    const promptEl = root.querySelector('.pick-prompt');
    const optsEl = root.querySelector('.pick-options');

    if (reverse) {
      promptEl.innerHTML = `<span class="prompt-ru">${current.ru}</span>`;
    } else {
      promptEl.innerHTML = `<span class="prompt-char">${current.char}</span>`;
    }

    const choices = buildChoices(current);
    const optClass = reverse ? 'pick-option pick-option-armenian' : 'pick-option';
    const display = reverse ? (c) => c.entry.char : (c) => c.entry.ru;
    optsEl.innerHTML = choices.map((c) =>
      `<button class="${optClass}" data-correct="${c.correct ? '1' : '0'}">${display(c)}</button>`
    ).join('');

    optsEl.querySelectorAll('.pick-option').forEach(btn => {
      btn.addEventListener('click', () => onPick(btn));
    });
    busy = false;
  }

  function onPick(btn) {
    if (busy) return;
    busy = true;
    const isCorrect = btn.dataset.correct === '1';
    const i = session.index;
    const { char } = session.letters[i];
    if (isCorrect) {
      btn.classList.add('pick-correct');
      const hadErrors = (session.errors[char] || 0) > 0;
      dots[hadErrors ? 'markFail' : 'markPass'](i);
      setTimeout(advance, 400);
    } else {
      btn.classList.add('pick-wrong');
      session.errors[char] = (session.errors[char] || 0) + 1;
      const correctBtn = root.querySelector('.pick-option[data-correct="1"]');
      if (correctBtn) correctBtn.classList.add('pick-correct-hint');
      setTimeout(advance, 1100);
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

  function revealCorrect() {
    const btn = root.querySelector('.pick-option[data-correct="1"]');
    if (btn) {
      btn.classList.add('pick-correct-hint');
      setTimeout(() => btn.classList.remove('pick-correct-hint'), 1500);
    }
  }

  function confirmExit() {
    if (confirm('Точно выйти? Прогресс не сохранится.')) {
      go('setup', { mode: 'pick' });
    }
  }

  window.addEventListener('screen:enter', (e) => {
    if (e.detail.screen === 'pick') render();
  });
}
