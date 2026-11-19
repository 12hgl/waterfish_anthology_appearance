#!/usr/bin/env node
/**
 * 校验所有已收录的外观：目录结构 + 静态安全规则。
 * CI 里跑；也可以在提交 PR 前本地跑一遍。
 *
 *   node scripts/validate-all.mjs            # 有 block 就退出码 1
 *   node scripts/validate-all.mjs --report   # 额外把 markdown 报告打到 stdout
 */
import { scanThemes } from './lib/shared.mjs';
import { scan } from './lib/rules.mjs';

const wantReport = process.argv.includes('--report');
const { themes, errors, categories } = scanThemes();
const acceptsMap = new Map(categories.map((c) => [c.id, c.acceptsSubmissions]));

let failed = 0;
let warned = 0;
const rows = [];

for (const t of themes) {
  const result = scan(t.source, { category: t.category, acceptsSubmissions: acceptsMap.get(t.category) });
  if (result.blocks.length) failed++;
  else if (result.warns.length) warned++;
  rows.push({ theme: t, result });
}

if (wantReport) {
  const lines = [];
  lines.push('## 外观校验报告', '');
  lines.push(`共 ${themes.length} 套，${failed} 套被拒，${warned} 套需要留意。`, '');
  lines.push('| 外观 | 哈希 | 写法 | 得分 | 结论 |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const { theme, result } of rows) {
    lines.push(
      `| ${theme.name} | \`${theme.hash}\` | ${result.syntax} | ${result.score} | ${
        result.verdict === 'pass' ? '通过' : result.verdict === 'review' ? '需留意' : '拒绝'
      } |`,
    );
  }
  console.log(lines.join('\n'));
}

if (errors.length) {
  console.error('\n✗ 目录结构错误：');
  for (const e of errors) console.error('  - ' + e);
}

const bad = rows.filter((r) => r.result.blocks.length);
for (const { theme, result } of bad) {
  console.error(`\n✗ ${theme.path}（${theme.name}）`);
  for (const b of result.blocks) console.error(`   [${b.id}] 第 ${b.line} 行：${b.why}`);
}

if (!errors.length && !bad.length) {
  console.log(`\n✓ 全部通过。${warned ? `${warned} 套有提示项，不阻塞。` : ''}`);
}

process.exit(errors.length || bad.length ? 1 : 0);
