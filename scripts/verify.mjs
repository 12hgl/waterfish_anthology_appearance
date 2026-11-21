#!/usr/bin/env node
/**
 * 结构校验：目录名对不对得上内容哈希、README 是不是最新的、js 能不能编译。
 * 跑法：node scripts/verify.mjs [--quiet]
 */
import fs from 'node:fs';
import { scan, readmeOf, categories } from './lib/core.mjs';

const quiet = process.argv.includes('--quiet');
const { items, problems } = scan();
const issues = [...problems];

for (const it of items) {
  if (it.syntax === 'complex') {
    try {
      // 只编译不执行：能过就说明语法没问题
      new Function(it.source);
    } catch (err) {
      issues.push(`${it.relJs}：语法错误 —— ${err.message}`);
    }
  }
  const md = fs.readFileSync(it.mdPath, 'utf8');
  if (md !== readmeOf(it)) {
    issues.push(`${it.relJs}：README.md 和 js 不同步，跑 npm run index 重新生成`);
  }
}

if (issues.length) {
  console.error(`✗ 有 ${issues.length} 个问题：`);
  for (const p of issues) console.error('  - ' + p);
  process.exit(1);
}

if (!quiet) {
  console.log(`✓ 结构没问题：${items.length} 套外观`);
  for (const c of categories()) {
    const n = items.filter((i) => i.category === c.id).length;
    console.log(`  ${c.name.padEnd(3, '　')} ${String(n).padStart(2)} 套${c.open ? '' : '（不开放投稿）'}`);
  }
}
