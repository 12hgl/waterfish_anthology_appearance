#!/usr/bin/env node
/** 确保工作流用到的标签都存在。GitHub 不会自动创建 issue 模板里写的标签。 */
import { readCategories } from './lib/shared.mjs';
import { gh, repoCtx } from './lib/github.mjs';

const base = [
  ['submission', '8B5CF6', '主题投稿'],
  ['approved', '0E8A16', '维护者已同意收录，关闭即写入仓库'],
  ['ai-approved', '2EA043', '自动审核建议通过'],
  ['ai-rejected', 'B60205', '自动审核不建议收录'],
  ['needs-human-review', 'FBCA04', '需要人看一眼'],
  ['accepted', '1D76DB', '已经写进 appearance/'],
  ['duplicate', 'CFD3D7', '内容哈希与库里已有外观相同'],
  ['skip-ai', 'EDEDED', '跳过自动审核，直接人工处理'],
];

const cats = readCategories().map((c) => [
  `category:${c.id}`,
  c.accent.replace('#', ''),
  `收录到「${c.name}」分类`,
]);

const wanted = [...base, ...cats];

const { repo } = repoCtx();
const existing = new Set();
for (let page = 1; page <= 5; page++) {
  const list = await gh(`/repos/${repo}/labels?per_page=100&page=${page}`);
  if (!Array.isArray(list) || list.length === 0) break;
  for (const l of list) existing.add(l.name);
}

let created = 0;
for (const [name, color, description] of wanted) {
  if (existing.has(name)) continue;
  try {
    await gh(`/repos/${repo}/labels`, {
      method: 'POST',
      body: JSON.stringify({ name, color, description }),
    });
    created++;
  } catch (err) {
    console.warn(`标签 ${name} 创建失败：${err.message}`);
  }
}
console.log(`标签就绪（新建 ${created} 个，已有 ${existing.size} 个）。`);
