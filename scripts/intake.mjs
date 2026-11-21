#!/usr/bin/env node
/**
 * 把「已打 approved 且已关闭」的投稿 issue 落进 appearance/。
 * 只写文件，不提交——提交由 workflow 做，方便失败时留下现场。
 *
 * 分类优先级：category:xxx 标签 > issue 里选的 > js 头部 @category。
 */
import fs from 'node:fs';
import path from 'node:path';
import { categories, parseIssue, metaOf, putTheme, hashOf } from './lib/core.mjs';
import { getIssue, labelsOf, createComment } from './lib/github.mjs';

const cats = categories();

async function codeOf(parsed) {
  if (typeof parsed.code === 'string') return parsed.code;
  if (parsed.code?.fetchUrl) {
    const res = await fetch(parsed.code.fetchUrl, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`下载失败：${res.status}`);
    return await res.text();
  }
  return '';
}

async function main() {
  const issue = await getIssue();
  const labels = labelsOf(issue);

  if (!labels.includes('approved')) {
    await createComment(
      [
        '这个 issue 关了，但没有 `approved` 标签，所以**没有收录**。',
        '',
        '确认要收的话：重开 issue，加 `approved` 标签，再关一次。',
      ].join('\n'),
    );
    console.log('缺 approved 标签，跳过。');
    process.exit(0);
  }

  const parsed = parseIssue(issue.body || '');
  const code = (await codeOf(parsed)).trim();
  if (!code) throw new Error('issue 里没有可用的 js');

  const meta = metaOf(code);
  const fromLabel = labels.find((l) => l.startsWith('category:'))?.slice('category:'.length);
  const wanted = [fromLabel, parsed.category, meta.category].filter(Boolean);
  const cat = wanted.map((w) => cats.find((c) => c.id === w || c.name === w)).find(Boolean) || null;

  if (!cat) throw new Error(`分类定不下来（候选：${wanted.join(' / ') || '无'}）`);
  if (!cat.open) throw new Error(`「${cat.name}」不开放投稿，只能由维护者手动放进来`);

  const res = putTheme(code, { category: cat.id });
  const hash = hashOf(code);
  const rel = path.posix.join('appearance', cat.id, hash);

  const payload = {
    issue: issue.number,
    hash,
    category: cat.id,
    categoryName: cat.name,
    name: meta.name || parsed.name || hash,
    author: meta.author || parsed.author || '佚名',
    dir: res.dir,
    rel,
    existed: res.existed,
    bytes: Buffer.byteLength(code),
  };
  fs.writeFileSync(path.join(process.cwd(), '.intake.json'), JSON.stringify(payload, null, 2));
  console.log(res.existed ? `已存在：${rel}` : `已写入：${rel}`);
}

main().catch(async (err) => {
  console.error(err.message);
  fs.writeFileSync(
    path.join(process.cwd(), '.intake.json'),
    JSON.stringify({ failed: err.message }, null, 2),
  );
  process.exitCode = 1;
});
