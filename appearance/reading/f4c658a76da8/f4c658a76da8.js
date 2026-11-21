// @name 灯芯
// @author waterfish
// @category reading
// @mode both
// @date 2026-11-04
// @summary 蜂蜜色的纸、灯芯黄的字，像台灯下的旧书。
// @note 深色把这套压到接近烛光，色温更低；如果在户外用会觉得偏黄。
function theme(api) {
  const d = api.dark;
  const v = (k, a, b) => api.setVar(k, d ? a : b);

  v('--paper',       '#161208', '#F8F0DF');
  v('--surface',     '#1D180D', '#FFF9E8');
  v('--surface-2',   '#241E11', '#F1E6CE');
  v('--surface-3',   '#2C2416', '#E8DABE');
  v('--line',        '#362C1B', '#DFCFAF');
  v('--line-strong', '#493B25', '#C8B490');
  v('--ink',         '#EEE2C7', '#33291A');
  v('--ink-2',       '#BCAC8B', '#64573F');
  v('--ink-3',       '#8A7C60', '#95866A');

  v('--accent',      '#E8B45C', '#A9702A');
  v('--accent-ink',  '#F3CA84', '#8F5C1F');
  v('--accent-soft', '#2E2410', '#F6E3C2');
  v('--accent-line', '#54411F', '#E2C795');
  v('--btn-bg',      '#E8B45C', '#9A6624');
  v('--btn-ink',     '#17120A', '#FFF8E9');

  v('--r-sm', '4px', '4px');
  v('--r',    '6px', '6px');
  v('--r-lg', '8px', '8px');

  api.setVar('--app-font', 'var(--serif)');
  api.css(`
    .article-body, .prose { line-height: 1.9; }
    .sidebar { background: var(--surface-2); }
  `);
}
