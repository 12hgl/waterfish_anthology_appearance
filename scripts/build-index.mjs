#!/usr/bin/env node
/**
 * 扫描 appearance/ 生成 data/themes.json。
 * 站点构建、Action 收录、CI 校验都先跑这一步，保证只有一份事实来源。
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, scanThemes, siteOrigin } from './lib/shared.mjs';

const { themes, errors, categories } = scanThemes();

if (errors.length) {
  console.error('✗ 目录结构有问题：');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

const stats = {
  total: themes.length,
  authors: new Set(themes.map((t) => t.author)).size,
  bytes: themes.reduce((n, t) => n + t.bytes, 0),
  byCategory: Object.fromEntries(
    categories.map((c) => [c.id, themes.filter((t) => t.category === c.id).length]),
  ),
};

const out = {
  generatedAt: new Date().toISOString(),
  origin: siteOrigin(),
  categories,
  stats,
  themes: themes.map((t) => ({
    hash: t.hash,
    name: t.name,
    author: t.author,
    category: t.category,
    categoryName: t.categoryName,
    summary: t.summary,
    mode: t.mode,
    syntax: t.syntax,
    created: t.created,
    bytes: t.bytes,
    url: t.url,
  })),
};

const dataDir = path.join(ROOT, 'data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'themes.json'), JSON.stringify(out, null, 2) + '\n');

console.log(`✓ ${stats.total} 套外观，${stats.authors} 位作者，共 ${(stats.bytes / 1024).toFixed(0)} KB`);
for (const c of categories) {
  console.log(`  ${c.name.padEnd(4, '　')} ${String(stats.byCategory[c.id] || 0).padStart(2)} 套${c.acceptsSubmissions ? '' : '  （仅手动收录）'}`);
}
