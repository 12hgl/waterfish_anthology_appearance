function theme(api) {
  const dark = api.dark;

  // 纸面：浅色是旧书纸，深色是关灯后的木桌
  api.setVar('--paper',     dark ? '#141110' : '#FBF5E8');
  api.setVar('--surface',   dark ? '#1C1917' : '#FFFCF2');
  api.setVar('--surface-2', dark ? '#241F1C' : '#F3EAD8');
  api.setVar('--surface-3', dark ? '#2C2622' : '#EADFC8');
  api.setVar('--line',      dark ? '#3A332D' : '#E2D5BB');
  api.setVar('--line-strong', dark ? '#4C433B' : '#CFBE9C');

  // 字：暖白，不用纯白
  api.setVar('--ink',   dark ? '#E9E1D2' : '#3A322A');
  api.setVar('--ink-2', dark ? '#B8AC98' : '#5C5044');
  api.setVar('--ink-3', dark ? '#847868' : '#8A7C69');

  // 强调：琥珀
  api.setVar('--accent',      dark ? '#E0A458' : '#B4700F');
  api.setVar('--accent-ink',  dark ? '#F0BE7E' : '#8A5410');
  api.setVar('--accent-soft', dark ? '#33281C' : '#F6E7CC');
  api.setVar('--accent-line', dark ? '#5A4429' : '#E3C99B');
  api.setVar('--btn-bg',      dark ? '#E0A458' : '#B4700F');
  api.setVar('--btn-ink',     dark ? '#1A1512' : '#FFFDF6');

  api.setVar('--r-sm', '8px');
  api.setVar('--r', '12px');
  api.setVar('--r-lg', '18px');

  // 一层几乎看不见的颗粒，让纸面别那么"数码"
  api.css(`
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      opacity: .035;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    .page-title { letter-spacing: .015em; }
  `);

  api.icon('book', '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 18.5V5.5" opacity=".45"/>');
}
