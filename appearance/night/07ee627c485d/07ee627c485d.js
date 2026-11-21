// @name 炭
// @author waterfish
// @category night
// @mode both
// @date 2026-11-05
// @summary 近黑配一点旧金，字重压得低，像炭笔写的。
// @note 浅色版不是标配：暖灰纸配同一支金，白天用也不突兀。
function theme(api) {
  const d = api.dark;
  const v = (k, a, b) => api.setVar(k, d ? a : b);

  v('--paper',       '#191816', '#F6F4EF');
  v('--surface',     '#201F1C', '#FCFAF4');
  v('--surface-2',   '#272521', '#EFECE3');
  v('--surface-3',   '#2E2C27', '#E6E2D6');
  v('--line',        '#37342E', '#DFDACB');
  v('--line-strong', '#4A463E', '#C9C2AF');
  v('--ink',         '#DDD8CB', '#2B2822');
  v('--ink-2',       '#A8A294', '#5A554A');
  v('--ink-3',       '#7A756A', '#8A8375');

  v('--accent',      '#C9A227', '#8A6B12');
  v('--accent-ink',  '#DFBB45', '#755A0C');
  v('--accent-soft', '#2B2515', '#F1E7C8');
  v('--accent-line', '#4A3F20', '#DCCB95');
  v('--btn-bg',      '#C9A227', '#7E6210');
  v('--btn-ink',     '#100E08', '#FFF9E6');

  v('--r-sm', '3px', '3px');
  v('--r',    '5px', '5px');
  v('--r-lg', '7px', '7px');

  api.css(`
    .title, .page-title, h1, h2 { font-weight: 550; }
  `);
}
