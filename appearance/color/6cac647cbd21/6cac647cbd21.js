// @name 靛
// @author waterfish
// @category color
// @mode both
// @date 2026-11-09
// @summary 一支很正的靛蓝，纸面带一点点紫。
// @note 蓝色一旦偏亮就会显得廉价，这里压了明度，深色版换成更浅的靛。
function theme(api) {
  const d = api.dark;
  const v = (k, a, b) => api.setVar(k, d ? a : b);

  v('--paper',       '#121220', '#F4F4FB');
  v('--surface',     '#181829', '#FCFCFF');
  v('--surface-2',   '#1F1F33', '#EBEBF7');
  v('--surface-3',   '#26263D', '#E1E1F2');
  v('--line',        '#2D2D46', '#DBDBEF');
  v('--line-strong', '#3E3E5C', '#C4C4E2');
  v('--ink',         '#E3E3F1', '#1E1E2E');
  v('--ink-2',       '#A6A6C4', '#54546E');
  v('--ink-3',       '#767694', '#84849C');

  v('--accent',      '#8B8BF0', '#3A3AA8');
  v('--accent-ink',  '#A6A6F7', '#31318F');
  v('--accent-soft', '#1C1C36', '#E8E8FB');
  v('--accent-line', '#2E2E58', '#C9C9F2');
  v('--btn-bg',      '#8B8BF0', '#33339B');
  v('--btn-ink',     '#0D0D1A', '#F7F7FF');

  v('--r-sm', '6px',  '6px');
  v('--r',    '10px', '10px');
  v('--r-lg', '14px', '14px');

  api.css(`
    .sidebar { background: ${d ? '#16162A' : '#EDEDF9'}; }
    .tag, .chip { background: var(--accent-soft); color: var(--accent-ink); }
  `);
}
