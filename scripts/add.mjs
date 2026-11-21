#!/usr/bin/env node
/**
 * 手动收录 / 重新生成 README。
 *
 *   node scripts/add.mjs .seed/松烟.js --category recommended --force
 *   node scripts/add.mjs --index          按现有 js 重写所有 README
 *
 * 「推荐」这类不开放投稿的分类只从这里进（--force），issue 那条路会被挡。
 */
import fs from 'node:fs';
import path from 'node:path';
import { putTheme, scan, readmeOf, normalize } from './lib/core.mjs';

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return null;
  const v = args[i + 1];
  args.splice(i, v && !v.startsWith('--') ? 2 : 1);
  return v && !v.startsWith('--') ? v : true;
};

if (flag('index')) {
  const { items, problems } = scan();
  if (problems.length) {
    console.error('✗ 先修这些问题：');
    problems.forEach((p) => console.error('  - ' + p));
    process.exit(1);
  }
  for (const it of items) fs.writeFileSync(it.mdPath, readmeOf(it), 'utf8');
  console.log(`✓ 重写了 ${items.length} 个 README.md`);
  process.exit(0);
}

const category = flag('category');
const force = Boolean(flag('force'));
const files = args.filter((a) => !a.startsWith('--'));

if (!files.length) {
  console.error('用法：node scripts/add.mjs <file.js…> [--category id] [--force]');
  process.exit(1);
}

let ok = 0;
for (const file of files) {
  const src = fs.readFileSync(path.resolve(file), 'utf8');
  try {
    const res = putTheme(src, { category, force });
    const rel = path.relative(process.cwd(), res.dir);
    console.log(res.existed ? `= ${rel}（已有同样的内容）` : `+ ${rel}`);
    ok++;
    void normalize;
  } catch (err) {
    console.error(`✗ ${path.basename(file)}：${err.message}`);
  }
}

if (!ok) process.exit(1);
console.log(`\n下一步：npm run index && npm run build`);
