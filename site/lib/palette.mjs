/**
 * 从主题源码里抠出能代表它的颜色，用来画列表卡片上的小色块。
 * 只认 CSS 变量和简单写法的键，不执行任何代码。
 *
 * 复杂写法里大量出现 `api.dark ? A : B`，两边颜色都得收集，
 * 再按「纸面取最亮的、字取最暗的、强调色取最后一个」挑，这样卡片呈现的
 * 基本就是浅色模式下的样子——那也是绠大多数第一眼看到的样子。
 */
import { parseSimpleStyle } from '../../scripts/lib/rules.mjs';

const FALLBACK = { paper: '#FBFAF7', accent: '#1F6C9F', ink: '#22201C' };

function luminance(color) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(color || '').trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function isColor(v) {
  return /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))$/.test(String(v || '').trim());
}

export function paletteOf(source) {
  /** @type {Map<string, string[]>} */
  const vars = new Map();
  const push = (name, value) => {
    if (!isColor(value)) return;
    const list = vars.get(name) || [];
    list.push(value.trim());
    vars.set(name, list);
  };

  // 复杂写法：setVar('--x', ...)，一个调用里可能有多个颜色（深浅分支）
  for (const m of source.matchAll(/setVar\(\s*['"](--[\w-]+)['"]\s*,\s*([^\n]*?)\)\s*;/g)) {
    const name = m[1];
    const body = m[2];
    const literals = body.match(/['"](#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\))['"]/g) || [];
    if (literals.length) {
      for (const lit of literals) push(name, lit.replace(/^['"]|['"]$/g, ''));
    } else {
      push(name, body.trim().replace(/^['"`]|['"`]$/g, ''));
    }
  }

  const pickPaper = () => {
    const primary = vars.get('--paper') || [];
    const cands = primary.length ? primary : vars.get('--surface') || [];
    if (!cands.length) return null;
    return cands
      .map((c) => ({ c, l: luminance(c) }))
      .filter((x) => x.l !== null)
      .sort((a, b) => b.l - a.l)[0]?.c || null;
  };

  const pickInk = () => {
    const cands = vars.get('--ink') || [];
    if (!cands.length) return null;
    return cands
      .map((c) => ({ c, l: luminance(c) }))
      .filter((x) => x.l !== null)
      .sort((a, b) => a.l - b.l)[0]?.c || null;
  };

  const pickAccent = () => {
    const cands = vars.get('--accent') || [];
    return cands.length ? cands[cands.length - 1] : null;
  };

  const out = { ...FALLBACK };
  const paper = pickPaper();
  const ink = pickInk();
  const accent = pickAccent();
  if (paper) out.paper = paper;
  if (ink) out.ink = ink;
  if (accent) out.accent = accent;

  // 简单写法：后面的行覆盖前面的
  const { entries } = parseSimpleStyle(source);
  for (const e of entries) {
    if (!isColor(e.value)) continue;
    if (e.key === 'paper' || e.key === 'bg') out.paper = e.value;
    if (e.key === 'accent') out.accent = e.value;
    if (e.key === 'ink') out.ink = e.value;
  }

  // 纸面很暗时，线条要用浅色，否则卡片一片糊
  if ((luminance(out.paper) ?? 1) < 0.25 && (luminance(out.ink) ?? 1) < 0.25) {
    out.ink = '#E6E3DA';
  }

  // 有没有自己指定主色。没有的话（纯字体 / 纯动效主题）卡片长得一样，
  // 列表里靠一个字符区分，别让人以为是重复收录。
  out.hasAccent = Boolean(accent) || parseSimpleStyle(source).entries.some((e) => e.key === 'accent');

  return out;
}

export function isDarkColor(hex) {
  return (luminance(hex) ?? 1) < 0.42;
}
