import { go, session } from '../app.js';
import { createDots } from '../ui/dots.js';
import { createDrawingCanvas } from '../writing/canvas.js';
import { buildReference, clearReferenceCache } from '../writing/reference.js';
import { compare } from '../writing/recognizer.js';

export function mount(root) {
  let dots = null;
  let drawing = null;
  let busy = false;

  function render() {
    root.innerHTML = `
      <div class="quiz-header">
        <span class="counter"></span>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      </div>
      <div class="writing-prompt">
        <span class="char-mini"></span>
        <span class="translit"></span>
      </div>
      <div class="canvas-wrap"></div>
      <div class="writing-controls">
        <button class="btn btn-ghost" data-action="clear">Очистить</button>
        <button class="btn btn-primary" data-action="check">Готово</button>
      </div>
      <div class="dots-mount"></div>
      <div class="quiz-controls">
        <button class="btn btn-ghost btn-icon" data-action="hint" title="Подсказка">?</button>
        <button class="btn btn-ghost btn-icon" data-action="exit" title="Выйти">×</button>
      </div>
    `;
    dots = createDots(session.letters.length);
    root.querySelector('.dots-mount').appendChild(dots.element);
    drawing = createDrawingCanvas();
    root.querySelector('.canvas-wrap').appendChild(drawing.canvas);

    root.querySelector('[data-action="clear"]').addEventListener('click', () => drawing.clear());
    root.querySelector('[data-action="check"]').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      onCheck();
      setTimeout(() => { btn.disabled = false; }, 600);
    });
    root.querySelector('[data-action="hint"]').addEventListener('click', async () => {
      const { char } = session.letters[session.index];
      const ref = await buildReference(char);
      const wrap = root.querySelector('.canvas-wrap');
      let existing = wrap.querySelector('.canvas-silhouette.peek');
      if (existing) { existing.remove(); return; }
      const peek = document.createElement('div');
      peek.className = 'canvas-silhouette peek';
      peek.style.backgroundImage = `url(${ref.silhouette})`;
      peek.style.opacity = '0.4';
      wrap.insertBefore(peek, wrap.firstChild);
      setTimeout(() => peek.remove(), 1500);
    });
    root.querySelector('[data-action="exit"]').addEventListener('click', confirmExit);

    showCurrent();
  }

  async function showCurrent() {
    const total = session.letters.length;
    const i = session.index;
    const { char, ru } = session.letters[i];
    root.querySelector('.counter').textContent = `${i + 1} / ${total}`;
    root.querySelector('.progress-fill').style.width = `${(i / total) * 100}%`;
    root.querySelector('.char-mini').textContent = char;
    root.querySelector('.translit').textContent = ru;
    drawing.clear();
    dots.setCurrent(i);

    // Silhouette overlay (easy mode only)
    const wrap = root.querySelector('.canvas-wrap');
    let silEl = wrap.querySelector('.canvas-silhouette');
    if (silEl) silEl.remove();
    if (session.difficulty === 'easy') {
      const ref = await buildReference(char);
      silEl = document.createElement('div');
      silEl.className = 'canvas-silhouette';
      silEl.style.backgroundImage = `url(${ref.silhouette})`;
      wrap.insertBefore(silEl, drawing.canvas);
      wrap.appendChild(drawing.canvas); // ensure canvas above silhouette
    }
  }

  function onCheck() {
    if (busy) return; busy = true;
    const i = session.index;
    const { char } = session.letters[i];
    buildReference(char).then(ref => {
      const userMask = drawing.getMask();
      const result = compare(userMask, ref.mask, ref.pixelCount, session.difficulty);
      const canvasWrap = root.querySelector('.canvas-wrap');
      if (result.passed) {
        canvasWrap.classList.add('flash-correct');
        const hadErrors = (session.errors[char] || 0) > 0;
        dots[hadErrors ? 'markFail' : 'markPass'](i);
        setTimeout(() => {
          canvasWrap.classList.remove('flash-correct');
          busy = false;
          session.index += 1;
          if (session.index >= session.letters.length) {
            root.querySelector('.progress-fill').style.width = '100%';
            go('summary');
          } else {
            showCurrent();
          }
        }, 400);
      } else {
        canvasWrap.classList.add('flash-incorrect');
        session.errors[char] = (session.errors[char] || 0) + 1;
        setTimeout(() => {
          canvasWrap.classList.remove('flash-incorrect');
          drawing.clear();
          busy = false;
        }, 500);
      }
    }).catch((err) => {
      console.warn('Recognition failed:', err);
      busy = false;
    });
  }

  function confirmExit() {
    if (confirm('Точно выйти? Прогресс не сохранится.')) {
      go('setup', { mode: 'writing' });
    }
  }

  window.addEventListener('screen:enter', (e) => {
    if (e.detail.screen !== 'writing') {
      clearReferenceCache();
      return;
    }
    render();
  });
}
