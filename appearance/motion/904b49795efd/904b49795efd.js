// @name 涟漪
// @author waterfish
// @category motion
// @mode both
// @date 2026-11-03
// @summary 按钮按下时从中心散开一圈，很轻，按完就没了。
// @note 纯 CSS，没有监听事件；动效只在按下那一刻，不占渲染线程。
function theme(api) {
  api.css(`
    .btn, .tab, .theme-card { position: relative; overflow: hidden; }
    .btn::after, .tab::after {
      content: ''; position: absolute; left: 50%; top: 50%;
      width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 50%;
      background: currentColor; opacity: 0; pointer-events: none;
      transform: scale(0);
    }
    .btn:active::after, .tab:active::after {
      animation: apRipple .45s ease-out;
    }
    @keyframes apRipple {
      0%   { transform: scale(0); opacity: .28; }
      100% { transform: scale(22); opacity: 0; }
    }
    .theme-card { transition: border-color .18s ease, transform .18s ease; }
    .theme-card:hover { transform: translateY(-1px); }
    .theme-card.is-active { border-color: var(--accent); }

    @media (prefers-reduced-motion: reduce) {
      .btn:active::after, .tab:active::after { animation: none; }
      .theme-card { transition: none; }
    }
  `);
}
