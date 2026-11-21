#!/usr/bin/env node
/** 一次性把流程用到的标签建好。重复跑没关系，已存在的会跳过。 */
import { categories } from './lib/core.mjs';
import { ensureLabels } from './lib/github.mjs';

const base = [
  { name: 'submission', color: '0E8A16', description: '投稿' },
  { name: 'ai-ok', color: '1F6C9F', description: '自动审核建议通过' },
  { name: 'manual-check', color: 'D4A017', description: '自动审核要人看一眼' },
  { name: 'blocked', color: 'B60205', description: '自动审核不建议收' },
  { name: 'approved', color: '0B6E4F', description: '维护者同意收录，关闭后写入外观库' },
  { name: 'accepted', color: '5319E7', description: '已写进 appearance/' },
  { name: 'skip-ai', color: '999999', description: '跳过自动审核' },
];

const catLabels = categories().map((c) => ({
  name: `category:${c.id}`,
  color: 'C5DEF5',
  description: `收录时归到「${c.name}」`,
}));

await ensureLabels([...base, ...catLabels]);
console.log(`✓ 标签就绪：${base.length + catLabels.length} 个`);
