function theme(api) {
  api.setVar('--paper',     '#F2E8D5');
  api.setVar('--surface',   '#F8F1E1');
  api.setVar('--surface-2', '#EBDDC4');
  api.setVar('--surface-3', '#E2D1B4');
  api.setVar('--line',      '#DCC9A8');
  api.setVar('--line-strong', '#C9B08A');

  api.setVar('--ink',   '#3B2F22');
  api.setVar('--ink-2', '#5C4B37');
  api.setVar('--ink-3', '#8A755A');

  api.setVar('--accent',      '#9B4A28');
  api.setVar('--accent-ink',  '#7A3A1E');
  api.setVar('--accent-soft', '#EFDEC5');
  api.setVar('--accent-line', '#DCBF97');

  api.setVar('--r', '10px');

  api.css(`
    body {
      background-image:
        repeating-linear-gradient(112deg, rgba(140,110,70,.045) 0 2px, transparent 2px 7px),
        repeating-linear-gradient(22deg,  rgba(120,95,60,.035) 0 1px, transparent 1px 9px);
      background-attachment: fixed;
    }
    .card, .record { box-shadow: 0 1px 0 rgba(120,90,50,.14), 0 6px 18px -12px rgba(80,55,20,.5); }
  `);
}
