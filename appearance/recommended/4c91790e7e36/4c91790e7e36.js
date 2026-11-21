// @name 冷白
// @author waterfish
// @category recommended
// @mode both
// @date 2026-11-08
// @summary 近乎白纸配一支钴蓝，线细，边硬，像文档工具。
// @note 给「桌面要干净」的人。阴影全部去掉，靠 1px 线分层，屏幕看着薄。
function theme(api) {
  const d = api.dark;
  const v = (k, a, b) => api.setVar(k, d ? a : b);

  v('--paper',       '#0F1116', '#FCFCFD');
  v('--surface',     '#151821', '#FFFFFF');
  v('--surface-2',   '#1B1F2A', '#F6F7F9');
  v('--surface-3',   '#232833', '#EDEFF3');
  v('--line',        '#2A303C', '#E6E8ED');
  v('--line-strong', '#3B4353', '#D2D6DF');

  v('--ink',   '#E7E9F0', '#17181C');
  v('--ink-2', '#A6ACBC', '#4B4E58');
  v('--ink-3', '#757C8C', '#868A96');

  v('--accent',      '#7C9BFF', '#2B5CE0');
  v('--accent-ink',  '#9CB4FF', '#244FCC');
  v('--accent-soft', '#1A2038', '#E8EDFD');
  v('--accent-line', '#2C3960', '#C6D2F8');
  v('--btn-bg',      '#7C9BFF', '#1B2A55');
  v('--btn-ink',     '#0C1020', '#F7F9FF');

  v('--r-sm', '3px', '3px');
  v('--r',    '2px', '2px');
  v('--r-lg', '4px', '4px');

  api.css(`
    .card, .dialog, .list-row { box-shadow: none !important; }
    .card { border: 1px solid var(--line); }
    .list-row + .list-row { border-top: 1px solid var(--line); }
    .title, .page-title { letter-spacing: -.01em; }
  `);
}
