function theme(api) {
  const dark = api.dark;

  api.setVar('--paper',     dark ? '#111111' : '#F7F7F7');
  api.setVar('--surface',   dark ? '#191919' : '#FFFFFF');
  api.setVar('--surface-2', dark ? '#212121' : '#F0F0F0');
  api.setVar('--surface-3', dark ? '#292929' : '#E8E8E8');
  api.setVar('--line',      dark ? '#333333' : '#E0E0E0');
  api.setVar('--line-strong', dark ? '#4A4A4A' : '#C9C9C9');

  api.setVar('--ink',   dark ? '#E8E8E8' : '#222222');
  api.setVar('--ink-2', dark ? '#A8A8A8' : '#5A5A5A');
  api.setVar('--ink-3', dark ? '#6E6E6E' : '#9A9A9A');

  api.setVar('--accent',      dark ? '#BDBDBD' : '#4A4A4A');
  api.setVar('--accent-ink',  dark ? '#E8E8E8' : '#2B2B2B');
  api.setVar('--accent-soft', dark ? '#262626' : '#EDEDED');
  api.setVar('--accent-line', dark ? '#3D3D3D' : '#D6D6D6');

  api.setVar('--r-sm', '4px');
  api.setVar('--r', '6px');
  api.setVar('--r-lg', '8px');

  api.css(`
    .card, .record, .theme-card {
      box-shadow: none !important;
      border: 1px solid var(--line);
    }
    .card, .record, .theme-card, a, button {
      transition: border-color .15s linear, color .15s linear;
    }
    .card:hover, .record:hover { transform: none !important; }
  `);
}
