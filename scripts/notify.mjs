#!/usr/bin/env node
/**
 * 收录完成后回话：在投稿 issue 里贴结果，打 accepted 标签。
 * 读的是 intake.mjs 写下的 .intake.json，失败时也靠它说明原因。
 */
import fs from 'node:fs';
import { createComment, addLabels } from './lib/github.mjs';

const file = '.intake.json';
const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { failed: '没有收到收录结果' };
const pushed = fs.existsSync('.pushed');
const origin = process.env.SITE_ORIGIN || '';

if (data.failed) {
  await createComment(['没收进去：', '', '```', data.failed, '```', '', '修好之后重开 issue、加 `approved` 再关一次。'].join('\n'));
  process.exit(0);
}

if (!pushed) {
  await createComment(
    [
      '文件已经写进工作目录，但提交或推送这一步失败了，需要人工看一眼 Actions 日志。',
      '',
      `准备写入：\`${data.rel}/\``,
    ].join('\n'),
  );
  process.exit(0);
}

const url = origin ? `${origin}/library/${data.hash}/` : `/library/${data.hash}/`;
await createComment(
  [
    data.existed ? '这套外观库里已经有了，这次没有重复写入。' : '收进去了。',
    '',
    `- 位置：\`${data.rel}/\``,
    `- 哈希：\`${data.hash}\``,
    `- 页面：${url}`,
    `- 文件：${origin}${'/library/' + data.hash + '/' + data.hash + '.js'}`,
    '',
    data.existed ? '' : 'CI 跑完、页面构建好之后就能看到。谢谢。',
    '',
    '如果这套不是你自己写的，或者想撤下来，直接在这里回一句就行。',
  ].filter(Boolean).join('\n'),
);
await addLabels(['accepted']).catch(() => {});
