/** 为收录的外观生成 README.md（front matter 供站点解析，正文给人看）。 */
import { SIMPLE_KEYS } from './rules.mjs';

export function syntaxLabel(syntax) {
  return syntax === 'complex' ? '复杂写法（`function theme(api)`）' : '简单写法（键值对）';
}

export function cleanField(value, fallback = '', max = 80) {
  let s = String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/^-{3,}$/g, '')
    .replace(/[`*_<>]/g, '')
    .trim();
  if (!s) s = fallback;
  return s.length > max ? s.slice(0, max) : s;
}

/** 从扫描结果里挑出「改了哪些项」，写进 README 让人一眼看懂。 */
export function describeChanges(source, scanResult) {
  if (scanResult.syntax === 'complex') {
    const vars = [...source.matchAll(/setVar\(\s*['"](--[\w-]+)['"]\s*,\s*([^)]+)\)/g)].map((m) => ({
      name: m[1],
      value: m[2].trim().replace(/^['"`]|['"`]$/g, ''),
    }));
    if (vars.length) {
      return ['| CSS 变量 | 值 |', '| --- | --- |', ...vars.slice(0, 24).map((v) => `| \`${v.name}\` | \`${v.value}\` |`)].join('\n');
    }
    return '_这套用的是脚本方式，只注入样式，没有直接改 CSS 变量。_';
  }
  const rows = [];
  const lines = source.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || /^(\/\/|#)/.test(t)) continue;
    const m = t.match(/^([^\s:=]+)\s*[:=]?\s*(.+)$/);
    if (!m) continue;
    const key = SIMPLE_KEYS.get(m[1].trim());
    if (!key) continue;
    rows.push(`| \`${m[1].trim()}\` | \`${m[2].trim()}\` |`);
  }
  if (!rows.length) return '_没有识别到可展示的键值对。_';
  return ['| 键 | 值 |', '| --- | --- |', ...rows].join('\n');
}

export function buildReadme({
  name,
  author,
  summary,
  category,
  categoryName,
  hash,
  source,
  scanResult,
  issueNumber,
  issueUrl,
  date,
}) {
  const modeCn = { light: '浅色为主', dark: '深色为主', both: '深浅都调过' }[scanResult.mode || 'both'] || '深浅都调过';
  const riskText = scanResult.blocks.length
    ? '无（静态检查已通过）'
    : scanResult.warns.length
      ? `${scanResult.warns.length} 处提示：${scanResult.warns.map((w) => w.id).join('、')}`
      : '0 处';

  return `---
name: ${name}
author: ${author}
category: ${category}
hash: ${hash}
created: ${date}
summary: ${summary}
mode: both
syntax: ${scanResult.syntax}
---

# ${name}

> ${summary}

| | |
| --- | --- |
| 作者 | [@${author}](https://github.com/${author}) |
| 分类 | ${categoryName} |
| 哈希 | \`${hash}\` |
| 写法 | ${syntaxLabel(scanResult.syntax)} |
| 体积 | ${(scanResult.bytes / 1024).toFixed(1)} KB |
| 收录 | ${date}，来自 [#${issueNumber}](${issueUrl}) |

## 改了什么

${describeChanges(source, scanResult)}

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 下载 [\`${hash}.js\`](./${hash}.js)
3. 点「选择 .js 主题文件」上传，列表里出现以文件名命名的卡片即生效

\`\`\`js
${source.replace(/\n$/, '')}
\`\`\`

## 收录说明

- 静态检查：${riskText}
- 自动审核得分：${scanResult.score}/100
- 审核只看代码行为，不评价审美。外观好不好看请自己上一遍手。

## 卸载

设置 → 外观 → 自定义主题，鼠标悬停在这张卡片上，点右下角的 ✕。
`.replace(/\n{3,}/g, '\n\n');
}
