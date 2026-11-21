// @name 子夜
// @author waterfish
// @category night
// @mode dark
// @date 2026-11-13
// @summary 蓝灰底，字是雾白，夜里不刺眼也不发黄。
// @note 这套只做深色：浅色版试过，蓝味在白天很脏，就不放了。
function theme(api) {
  const d = api.dark;
  const v = (k, a) => api.setVar(k, a);

  v('--paper',       '#14161A');
  v('--surface',     '#1A1D22');
  v('--surface-2',   '#20242A');
  v('--surface-3',   '#272C33');
  v('--line',        '#2E343C');
  v('--line-strong', '#3F4650');
  v('--ink',         '#DFE4EA');
  v('--ink-2',       '#A3ABB6');
  v('--ink-3',       '#727A85');

  v('--accent',      '#7FA6C9');
  v('--accent-ink',  '#9CBEDC');
  v('--accent-soft', '#1B2733');
  v('--accent-line', '#2C3F51');
  v('--btn-bg',      '#7FA6C9');
  v('--btn-ink',     '#0E151C');

  v('--r-sm', '4px');
  v('--r',    '6px');
  v('--r-lg', '8px');

  api.css(`
    /* 深色下白底图片会炸眼，压一点亮度 */
    img { filter: brightness(.92) contrast(.98); }
    .card { border: 1px solid var(--line); }
  `);
}
