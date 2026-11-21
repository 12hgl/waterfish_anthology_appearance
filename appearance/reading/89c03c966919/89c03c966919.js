// @name 笺
// @author waterfish
// @category reading
// @mode both
// @date 2026-11-14
// @summary 米纸、朱印、衬线正文，行距松到可以念出声。
// @note 行距和段间距都调过，为的是读 PDF 转过来的长文；界面上的圆角压小了，像纸边。
function theme(api) {
  const d = api.dark;
  const v = (k, a, b) => api.setVar(k, d ? a : b);

  v('--paper',       '#17130F', '#F4EEE2');
  v('--surface',     '#1E1915', '#FBF6EC');
  v('--surface-2',   '#251F1A', '#EDE5D6');
  v('--surface-3',   '#2D2620', '#E3D9C6');
  v('--line',        '#37302A', '#DCCFB8');
  v('--line-strong', '#4A4138', '#C6B69A');
  v('--ink',         '#EAE0D0', '#2E2A22');
  v('--ink-2',       '#B5A692', '#5D5548');
  v('--ink-3',       '#847868', '#8E8471');

  v('--accent',      '#D0725C', '#96331F');
  v('--accent-ink',  '#E1907C', '#7E2917');
  v('--accent-soft', '#2C1C18', '#F3DDD6');
  v('--accent-line', '#4E2C24', '#DFBDB2');
  v('--btn-bg',      '#D0725C', '#8C2F1C');
  v('--btn-ink',     '#170E0B', '#FDF5F1');

  v('--r-sm', '3px', '3px');
  v('--r',    '4px', '4px');
  v('--r-lg', '6px', '6px');

  api.setVar('--app-font', 'var(--serif)');
  api.css(`
    .article-body, .prose { line-height: 1.95; letter-spacing: .01em; }
    .article-body p, .prose p { margin: 1.05em 0; }
    .article-body h2, .prose h2 { margin-top: 2.1em; letter-spacing: .02em; }
  `);
}
