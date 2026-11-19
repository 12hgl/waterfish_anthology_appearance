function theme(api) {
  const dark = api.dark;

  api.setVar('--paper',     dark ? '#16151A' : '#FBFAF5');
  api.setVar('--surface',   dark ? '#1D1C22' : '#FFFFFF');
  api.setVar('--surface-2', dark ? '#24232A' : '#F4F2E9');
  api.setVar('--line',      dark ? '#33323A' : '#E5E1D3');
  api.setVar('--ink',       dark ? '#DEDAD0' : '#26241F');
  api.setVar('--ink-2',     dark ? '#A9A498' : '#4E4A40');
  api.setVar('--accent',    dark ? '#C9A227' : '#8A6D1F');
  api.setVar('--accent-ink', dark ? '#E0BE4C' : '#6E5614');
  api.setVar('--accent-soft', dark ? '#2E2A1B' : '#F3EEDC');

  api.setVar('--serif', '"Source Han Serif SC", "Noto Serif CJK SC", "Songti SC", "SimSun", serif');
  api.setVar('--r', '6px');

  api.css(`
    .prose, .article-body, .content, .page-title {
      font-family: var(--serif);
      letter-spacing: .012em;
    }
    .prose p, .article-body p {
      line-height: 1.9;
      text-align: justify;
      text-justify: inter-ideograph;
      margin-bottom: 1.1em;
    }
    .prose h2, .article-body h2 { letter-spacing: .06em; }
  `);
}
