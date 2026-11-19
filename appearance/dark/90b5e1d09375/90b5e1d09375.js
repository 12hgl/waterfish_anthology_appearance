function theme(api) {
  const dark = api.dark;

  api.setVar('--paper',     dark ? '#0D1512' : '#F3F6F1');
  api.setVar('--surface',   dark ? '#13201B' : '#FBFDF9');
  api.setVar('--surface-2', dark ? '#182822' : '#E9EFE5');
  api.setVar('--surface-3', dark ? '#1F312A' : '#DFE7D9');
  api.setVar('--line',      dark ? '#27392F' : '#DCE5D5');
  api.setVar('--line-strong', dark ? '#354B3E' : '#C4D2BB');

  api.setVar('--ink',   dark ? '#DDE7DC' : '#22301F');
  api.setVar('--ink-2', dark ? '#A2B4A1' : '#465843');
  api.setVar('--ink-3', dark ? '#6F8370' : '#77876F');

  api.setVar('--accent',      dark ? '#7FB069' : '#3F6B34');
  api.setVar('--accent-ink',  dark ? '#9CC98A' : '#2F5527');
  api.setVar('--accent-soft', dark ? '#1B2E1F' : '#E3EEDC');
  api.setVar('--accent-line', dark ? '#2F4A33' : '#C6DABB');
  api.setVar('--btn-bg',      dark ? '#7FB069' : '#3F6B34');
  api.setVar('--btn-ink',     dark ? '#0B1410' : '#F5FBF2');

  api.setVar('--r', '12px');
  api.css(`.page-title { letter-spacing: .01em; }`);
}
