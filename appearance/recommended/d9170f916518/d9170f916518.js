// @name 檐下
// @author waterfish
// @category recommended
// @mode both
// @date 2026-11-12
// @summary 琥珀配米黄，像坐在屋檐下看一整天书。
// @note 圆角给得大一点，卡片边缘软，看长文不觉得在盯表格。
function theme(api) {
  const d = api.dark;
  const v = (k, a, b) => api.setVar(k, d ? a : b);

  v('--paper',       '#1B1611', '#FBF3E3');
  v('--surface',     '#221B15', '#FFFBF1');
  v('--surface-2',   '#2A2119', '#F6EBD6');
  v('--surface-3',   '#33281E', '#EFE0C4');
  v('--line',        '#3B2F23', '#E8D8BC');
  v('--line-strong', '#4F3F2E', '#D6C19C');

  v('--ink',   '#EFE3D2', '#33291C');
  v('--ink-2', '#C0AC92', '#6A5843');
  v('--ink-3', '#8F7A61', '#9A866B');

  v('--accent',      '#E0A463', '#B4652A');
  v('--accent-ink',  '#EFBE86', '#9C5220');
  v('--accent-soft', '#2E2117', '#F7E3CB');
  v('--accent-line', '#55402A', '#E6C49B');
  v('--btn-bg',      '#E0A463', '#A75E28');
  v('--btn-ink',     '#1A120A', '#FFF8EC');

  v('--r-sm', '7px',  '7px');
  v('--r',    '12px', '12px');
  v('--r-lg', '16px', '16px');

  api.css(`
    .sidebar { background-image: linear-gradient(180deg, var(--surface-2), var(--surface)); }
    .card, .list-row { border-color: var(--line); }
  `);
}
