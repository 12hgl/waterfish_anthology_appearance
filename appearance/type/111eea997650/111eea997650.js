// @name 等宽
// @author waterfish
// @category type
// @mode both
// @date 2026-11-01
// @summary 整站等宽字，写代码和看日志的人会顺眼。
// @note 等宽字的中文在某些系统上会显得方，介意的话把 --app-font 换回 var(--sans)。
function theme(api) {
  api.setVar('--app-font', 'var(--mono)');
  api.setVar('--r', '4px');
  api.setVar('--r-lg', '6px');

  api.css(`
    body { letter-spacing: -.01em; }
    .article-body, .prose { line-height: 1.85; }
    .title, .page-title, h1, h2, h3 { letter-spacing: -.02em; }
    .meta, .time, .tag { font-feature-settings: "tnum"; }
  `);
}
