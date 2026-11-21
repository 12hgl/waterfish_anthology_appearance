/** 从主题源码里抠三个颜色，用来画列表行前面的小色块。不执行任何代码。 */

const isColor = (v) => /^#[0-9a-fA-F]{3,8}$/.test(String(v || '').trim());

export function paletteOf(source, fallback) {
  const found = { paper: [], ink: [], accent: [] };

  // 复杂写法：setVar('--paper', dark ? A : B)。作者常写个 v() 包一层，
  // 所以这里不认函数名，只认「第一个参数是 --paper / --ink / --accent」的调用。
  // 取参数里最后一个色值，那通常是浅色那一支。
  for (const m of String(source).matchAll(/\(\s*['"]--(paper|ink|accent)['"]\s*,\s*([^\n;]*)/g)) {
    const colors = m[2].match(/#[0-9a-fA-F]{3,8}/g);
    if (colors && colors.length) found[m[1]].push(colors[colors.length - 1]);
  }

  // 简单写法：主色 / 底色 / 文字
  const alias = { 主色: 'accent', accent: 'accent', 底色: 'paper', paper: 'paper', 纸面: 'paper', 文字: 'ink', ink: 'ink' };
  for (const line of String(source).split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('//') || t.startsWith('#')) continue;
    const m = /^([^:=]+?)\s*[:=]\s*(.+)$/.exec(t);
    if (!m) continue;
    const key = alias[m[1].trim().toLowerCase()] || alias[m[1].trim()];
    const val = m[2].trim();
    if (key && isColor(val) && !found[key].includes(val)) found[key].push(val);
  }

  return {
    paper: found.paper[0] || fallback.paper,
    accent: found.accent[0] || fallback.accent,
    ink: found.ink[0] || fallback.ink,
  };
}
