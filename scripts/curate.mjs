#!/usr/bin/env node
/**
 * 维护者手动收录一套外观。用于「推荐」这类不开放投稿的分类，
 * 也用于把 issue 里不方便贴的大文件收进来。
 *
 *   node scripts/curate.mjs --file ./my-theme.js --name 湖心纸 \
 *     --category recommended --author waterfish --summary "湖蓝配米白，看一天不累"
 *
 * 写完会顺手跑一遍校验，不通过就把目录删掉。
 */
import fs from 'node:fs';
import path from 'node:path';
import { APPEARANCE_DIR, ROOT, hashSource, normalizeSource, readCategories, scanThemes, siteOrigin } from './lib/shared.mjs';
import { scan } from './lib/rules.mjs';
import { buildReadme, cleanField } from './lib/readme.mjs';

function arg(name, fallback = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
}

const file = arg('file');
if (!file) {
  console.log(`用法：
  node scripts/curate.mjs --file <主题.js> [--name 名称] [--category ${readCategories().map((c) => c.id).join('|')}]
                          [--author 作者] [--summary 一句话简介] [--mode light|dark|both]

「推荐」分类（recommended）只允许用这个命令收，投稿 issue 进不来。`);
  process.exit(0);
}

const categories = readCategories();
const catMap = new Map(categories.map((c) => [c.id, c]));
const categoryId = arg('category', 'recommended');
if (!catMap.has(categoryId)) {
  console.error(`分类 ${categoryId} 不存在。可选：${categories.map((c) => c.id).join(', ')}`);
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(file), 'utf8');
const source = normalizeSource(raw);
const hash = hashSource(source);
const result = scan(source, { category: categoryId, acceptsSubmissions: catMap.get(categoryId).acceptsSubmissions });
result.mode = arg('mode', 'both');

if (result.verdict === 'reject') {
  console.error('这套外观没过静态检查：');
  for (const b of result.blocks) console.error(`  第 ${b.line} 行 [${b.id}]：${b.why}`);
  process.exit(1);
}

const author = cleanField(arg('author', process.env.USER || 'waterfish'), 'waterfish', 40).replace(/\s+/g, '');
const name = cleanField(arg('name', path.basename(file, '.js')), '未命名外观', 32);
const summary = cleanField(arg('summary', `${name}，${author} 收录。`), '', 120);
const category = catMap.get(categoryId);

const dir = path.join(APPEARANCE_DIR, categoryId, hash);
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, `${hash}.js`), source, 'utf8');
fs.writeFileSync(
  path.join(dir, 'README.md'),
  buildReadme({
    name,
    author,
    summary,
    category: categoryId,
    categoryName: category.name,
    hash,
    source,
    scanResult: result,
    issueNumber: 0,
    issueUrl: 'https://github.com/12hgl/waterfish_anthology_appearance',
    date: new Date().toISOString().slice(0, 10),
  }).replace(/来自 \[#0\]\([^)]+\)/, '维护者手动收录'),
  'utf8',
);

const after = scanThemes();
if (after.errors.length) {
  fs.rmSync(dir, { recursive: true, force: true });
  console.error('写入后校验失败，已回滚：');
  for (const e of after.errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`✓ 收录《${name}》到 ${path.relative(ROOT, dir)}`);
console.log(`  页面：${siteOrigin()}/library/${hash}/`);
console.log(`  提交：git add appearance && git commit -m "收录 ${name} (${hash.slice(0, 6)})"`);
