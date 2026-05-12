import { go, getAlphabet } from '../app.js';

export function mount(root) {
  function render() {
    const alpha = getAlphabet();
    const caps = Object.entries(alpha.capital);
    const lows = Object.entries(alpha.lower);
    const rows = caps.map(([capChar, info], i) => ({
      cap: capChar,
      low: lows[i][0],
      translits: info.translits,
      ru: info.ru,
    }));

    root.innerHTML = `
      <h2>Армянский алфавит</h2>
      <p class="subtitle">В режиме «Узнавание» вводи русскую транскрипцию. Если букв несколько — подходит любая из колонки «Можно ввести».</p>
      <div class="help-table">
        <div class="help-row help-row-head">
          <span class="help-chars-head">Буква</span>
          <span>Можно ввести</span>
          <span>Звучание</span>
        </div>
        ${rows.map(r => `
          <div class="help-row">
            <span class="help-chars">${r.cap} ${r.low}</span>
            <span class="help-translit">${r.translits.join(', ')}</span>
            <span class="help-ru">${r.ru}</span>
          </div>
        `).join('')}
      </div>
      <div class="help-notes">
        <h3>Заметки про неочевидные буквы</h3>
        <ul>
          <li><b>Ը ը</b> — короткий звук между <i>ы</i> и <i>э</i>, как в безударных слогах русских слов.</li>
          <li><b>Թ թ / Փ փ / Ք ք</b> — это <i>т</i>, <i>п</i>, <i>к</i> с придыханием (как «t» в английском <i>top</i>).</li>
          <li><b>Հ հ</b> — английское «h», глухой выдох, не путать с «х» (это <b>Խ խ</b>).</li>
          <li><b>Ղ ղ</b> — звонкое «гх», как украинское/южнорусское «г», но грубее.</li>
          <li><b>Ճ ճ</b> — слитное «тч», твёрдое.</li>
          <li><b>Ռ ռ</b> — раскатистое, как итальянское «r». <b>Ր ր</b> — мягкое, как обычное русское «р».</li>
          <li><b>Ց ց</b> — «ц» с придыханием (отличается от обычного <b>Ծ ծ</b>).</li>
        </ul>
        <p class="subtitle">Если в quiz'е латинский ответ кажется странным, нажми <b>?</b> — покажется и латиница, и русское звучание.</p>
      </div>
      <button class="btn btn-ghost" data-action="back">Назад</button>
    `;
    root.querySelector('[data-action="back"]').addEventListener('click', () => go('welcome'));
  }
  window.addEventListener('screen:enter', (e) => {
    if (e.detail.screen === 'help') render();
  });
}
