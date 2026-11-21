// @name 素纸
// @author waterfish
// @category plain
// @mode both
// @date 2026-11-10
// @summary 直角、无阴影、无渐变。界面只剩线和字。
// @note 删得很狠：卡片阴影、圆角、分隔渐变全去掉了。介意「太素」的话别选这套。
function theme(api) {
  const d = api.dark;
  const v = (k, a, b) => api.setVar(k, d ? a : b);

  v('--paper',       '#131211', '#FBFAF6');
  v('--surface',     '#1A1918', '#FFFFFF');
  v('--surface-2',   '#201F1D', '#F5F3EC');
  v('--surface-3',   '#272624', '#EDEAE0');
  v('--line',        '#2E2C2A', '#E7E4DA');
  v('--line-strong', '#403D39', '#D3CFC2');
  v('--ink',         '#E7E4DC', '#1D1B16');
  v('--ink-2',       '#ADA79B', '#4F4B43');
  v('--ink-3',       '#7C776D', '#8B8578');

  v('--r-sm', '0', '0');
  v('--r',    '0', '0');
  v('--r-lg', '0', '0');

  api.css(`
    * { box-shadow: none !important; }
    .card, .dialog, .theme-card, .list-row { border-radius: 0 !important; }
    .card { border: 1px solid var(--line); }
    .btn { border-radius: 0; }
    hr, .divider { background: var(--line-strong); }
  `);
}
