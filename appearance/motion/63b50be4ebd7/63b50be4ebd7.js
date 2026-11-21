// @name 落页
// @author waterfish
// @category motion
// @mode both
// @date 2026-11-07
// @summary 列表项悬停时会轻轻抬一下，像翻页前把纸角掀起来。
// @note 只动 transform 和 opacity，不触发布局；开了「减弱动态效果」就全部关掉。
function theme(api) {
  const d = api.dark;
  api.setVar('--r', d ? '6px' : '8px');
  api.setVar('--r-lg', d ? '8px' : '12px');

  api.css(`
    .list-row, .card, .article-item {
      transition: transform .22s cubic-bezier(.2,.7,.3,1), box-shadow .22s ease, background-color .22s ease;
      will-change: transform;
    }
    .list-row:hover, .article-item:hover {
      transform: translateY(-2px) rotate(-.15deg);
      box-shadow: 0 10px 24px -18px rgba(0,0,0,.55);
    }
    .card:hover { transform: translateY(-3px); }

    .sidebar a { transition: color .16s ease, background-color .16s ease; }
    .sidebar a::after {
      content: ''; position: absolute; left: 8px; right: 8px; bottom: 4px; height: 1px;
      background: currentColor; transform: scaleX(0); transform-origin: left;
      transition: transform .2s ease;
    }
    .sidebar a:hover::after { transform: scaleX(1); }

    @media (prefers-reduced-motion: reduce) {
      .list-row, .card, .article-item, .sidebar a { transition: none !important; }
      .list-row:hover, .article-item:hover, .card:hover { transform: none !important; }
      .sidebar a::after { display: none; }
    }
  `);
}
