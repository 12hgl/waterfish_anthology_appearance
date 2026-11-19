function theme(api) {
  api.setVar('--paper',     '#0A0A12');
  api.setVar('--surface',   '#10101C');
  api.setVar('--surface-2', '#161628');
  api.setVar('--surface-3', '#1C1C33');
  api.setVar('--line',      '#262645');
  api.setVar('--line-strong', '#3A3A66');

  api.setVar('--ink',   '#E6E6F5');
  api.setVar('--ink-2', '#A3A3C4');
  api.setVar('--ink-3', '#6E6E92');

  api.setVar('--accent',      '#38E1FF');
  api.setVar('--accent-ink',  '#7BEDFF');
  api.setVar('--accent-soft', '#0E2C3A');
  api.setVar('--accent-line', '#2A5C77');
  api.setVar('--btn-bg',      '#38E1FF');
  api.setVar('--btn-ink',     '#04141B');

  api.setVar('--r', '14px');
  api.setVar('--r-lg', '20px');

  api.css(`
    .card, .theme-card {
      position: relative;
      background-clip: padding-box;
      border: 1px solid transparent !important;
    }
    .card::after, .theme-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(135deg, #38E1FF, #A855F7 55%, #FF3D9A);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: .55;
      pointer-events: none;
      transition: opacity .2s ease;
    }
    .card:hover::after, .theme-card:hover::after { opacity: 1; }
    .card:hover, .theme-card:hover {
      box-shadow: 0 0 24px -6px rgba(56,225,255,.4), 0 0 40px -20px rgba(168,85,247,.6);
    }
  `);
}
