export function createDots(total) {
  const wrap = document.createElement('div');
  wrap.className = 'dots';
  const items = [];
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('span');
    dot.className = 'dot dot-pending';
    wrap.appendChild(dot);
    items.push(dot);
  }
  return {
    element: wrap,
    setCurrent(i) {
      items.forEach((d, idx) => {
        if (d.classList.contains('dot-pass') || d.classList.contains('dot-fail')) return;
        d.classList.toggle('dot-current', idx === i);
        d.classList.toggle('dot-pending', idx !== i);
      });
    },
    markPass(i) {
      items[i].className = 'dot dot-pass';
    },
    markFail(i) {
      items[i].className = 'dot dot-fail';
    },
  };
}
