// @name 松烟
// @author waterfish
// @category recommended
// @mode both
// @date 2026-11-15
// @summary 灰绿压住暖白，像旧纸上落了一层松烟墨。
// @note 深色不是把浅色翻过来：另配的一套，底色偏冷，字留一点灰，夜里看久了不发蓝。
function theme(api) {
  const d = api.dark;
  const v = (k, a, b) => api.setVar(k, d ? a : b);

  v('--paper',       '#131513', '#F7F5EE');
  v('--surface',     '#191C19', '#FFFDF7');
  v('--surface-2',   '#20241F', '#F1EEE4');
  v('--surface-3',   '#282D27', '#E8E4D7');
  v('--line',        '#2F352E', '#E2DDCE');
  v('--line-strong', '#414840', '#CFC8B4');

  v('--ink',   '#E4E6DF', '#24241F');
  v('--ink-2', '#A9AFA4', '#55564B');
  v('--ink-3', '#7B8078', '#8A8B7C');

  v('--accent',      '#8FBBA6', '#3E5C50');
  v('--accent-ink',  '#A9CCBA', '#33503F');
  v('--accent-soft', '#1E2A24', '#E4EBE4');
  v('--accent-line', '#31443A', '#C3D2C7');
  v('--btn-bg',      '#8FBBA6', '#2E4A3F');
  v('--btn-ink',     '#10160F', '#FBFDF9');

  v('--r-sm', '5px', '5px');
  v('--r',    '7px', '7px');
  v('--r-lg', '10px', '10px');

  // 纸面一层极淡的斜纹，纯色看着太像屏幕
  api.css(`
    body::before {
      content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 0;
      opacity: ${d ? '.05' : '.035'};
      background-image: repeating-linear-gradient(115deg, currentColor 0 1px, transparent 1px 5px);
    }
    .card { box-shadow: none; }
  `);
}
