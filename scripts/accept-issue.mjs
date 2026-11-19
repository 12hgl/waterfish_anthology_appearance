#!/usr/bin/env node
/**
 * issue 被关闭且带 `approved` 标签时，把投稿写进 appearance/<分类>/<哈希>/。
 *
 * 触发方式见 .github/workflows/accept.yml（issues: closed）。
 * 也可以本地演练：
 *   DRY_RUN=1 node scripts/accept-issue.mjs --body-file ./issue.md --author someone
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { APPEARANCE_DIR, ROOT, hashSource, normalizeSource, readCategories, scanThemes, siteOrigin } from './lib/shared.mjs';
import { scan } from './lib/rules.mjs';
import { parseIssueBody, resolveCategory, guessName } from './lib/issue.mjs';
import { buildReadme, cleanField } from './lib/readme.mjs';
import { addComment, addLabels, categoryLabel, fetchRemoteSource, getIssue, hasLabel, repoCtx } from './lib/github.mjs';

const DRY = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? null : process.argv[i + 1];
}

async function main() {
  const categories = readCategories();
  const catMap = new Map(categories.map((c) => [c.id, c]));

  let issue;
  if (DRY) {
    const bodyFile = arg('body-file');
    const body = bodyFile ? fs.readFileSync(bodyFile, 'utf8') : process.env.ISSUE_BODY || '';
    issue = {
      number: Number(arg('number') || 0),
      title: arg('title') || '[投稿] 本地演练',
      body,
      html_url: 'https://github.com/local/dry-run',
      user: { login: arg('author') || 'local' },
      labels: [{ name: 'approved' }],
      state: 'closed',
    };
  } else {
    issue = await getIssue();
  }

  const title = issue.title || '';
  const body = issue.body || '';
  const isSubmission = /^\[投稿\]/.test(title) || /###\s*JS\s*内容/i.test(body);
  if (!isSubmission) {
    console.log('不是主题投稿 issue，跳过。');
    return;
  }

  const labels = (issue.labels || []).map((l) => (typeof l === 'string' ? l : l.name));
  if (!labels.includes('approved')) {
    console.log('没有 approved 标签，不收录。');
    if (!DRY) {
      await addComment(
        [
          '这个 issue 关掉了，但没加 `approved` 标签，所以**没有收录**。',
          '',
          '维护者如果确认要收录，请重开这个 issue、打上 `approved` 再关闭一次；或者直接关掉后手动跑 `Accept theme submission` 工作流。',
        ].join('\n'),
      );
    }
    return;
  }
  if (labels.includes('accepted')) {
    console.log('已经收录过，跳过。');
    return;
  }

  const parsed = parseIssueBody(body);
  let source = parsed.code;
  if (!source && parsed.remoteUrl) {
    console.log('从远端抓取源码：', parsed.remoteUrl);
    source = await fetchRemoteSource(parsed.remoteUrl);
  }
  source = normalizeSource(source || '');

  if (!source.trim()) {
    await fail(issue, '没能从 issue 里读到 JS 内容。请检查「JS 内容」一栏，把代码放进 ```js 代码块，或贴一个 raw 链接。');
    process.exitCode = 1;
    return;
  }

  const author = cleanField(parsed.author || issue.user?.login || '匿名', '匿名', 40).replace(/\s+/g, '');
  const name = cleanField(parsed.name || guessName(source), '未命名外观', 32);
  const summary = cleanField(parsed.summary, `${author} 投稿的外观。`, 120);

  // 分类：仓库标签 > issue 里选的 > 兜底 minimal
  let categoryId = categoryLabel(issue) || resolveCategory(parsed.category, categories);
  let categoryNote = '';
  if (!categoryId) {
    categoryId = 'minimal';
    categoryNote = `投稿里没写分类，先放进「${catMap.get('minimal').name}」，可以改标签后重跑。`;
  }
  if (!catMap.has(categoryId)) {
    await fail(issue, `分类 \`${categoryId}\` 不在 categories.json 里。可选：${categories.map((c) => `\`${c.id}\``).join('、')}`);
    process.exitCode = 1;
    return;
  }
  const category = catMap.get(categoryId);
  if (!category.acceptsSubmissions) {
    await fail(
      issue,
      `「${category.name}」不开放投稿，这套需要维护者手动收录。请改 \`category:*\` 标签换一个分类，或等维护者用 \`npm run new\` 手动加。`,
    );
    process.exitCode = 1;
    return;
  }

  const hash = hashSource(source);
  const result = scan(source, { category: categoryId, acceptsSubmissions: category.acceptsSubmissions });

  if (result.blocks.length) {
    await fail(
      issue,
      ['静态检查没通过，不能收录：', '', ...result.blocks.map((b) => `- 第 ${b.line} 行 \`${b.id}\`：${b.why}`), '', '改完再关一次 issue 即可重新触发。'].join('\n'),
    );
    process.exitCode = 1;
    return;
  }

  const targetDir = path.join(APPEARANCE_DIR, categoryId, hash);
  const targetJs = path.join(targetDir, `${hash}.js`);
  const targetMd = path.join(targetDir, 'README.md');

  if (fs.existsSync(targetJs)) {
    console.log(`内容哈希 ${hash} 已存在，跳过写入。`);
    if (!DRY) {
      await addComment(
        [
          `这套外观的内容和库里已有的 \`${hash}\` 完全一样（哈希是按文件内容算的），所以没有重复收录。`,
          '',
          `如果只是想换个名字或分类，请把改动写进 JS（哪怕改一个颜色），哈希就会变。`,
        ].join('\n'),
      );
      await addLabels(['accepted', 'duplicate']);
    }
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  const readme = buildReadme({
    name,
    author,
    summary,
    category: categoryId,
    categoryName: category.name,
    hash,
    source,
    scanResult: result,
    issueNumber: issue.number,
    issueUrl: issue.html_url,
    date,
  });

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(targetJs, source, 'utf8');
  fs.writeFileSync(targetMd, readme, 'utf8');
  console.log(`写入 ${path.relative(ROOT, targetDir)}`);

  // 收录后重新扫一遍，确保新目录不会把整个库搞坏
  const after = scanThemes();
  if (after.errors.length) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    await fail(issue, ['写入后目录结构校验失败，已回滚：', '', ...after.errors.map((e) => `- ${e}`)].join('\n'));
    process.exitCode = 1;
    return;
  }

  const url = `${siteOrigin()}/library/${hash}/`;

  if (DRY) {
    console.log('\n--- DRY RUN ---');
    console.log('hash:', hash, '| category:', categoryId, '| name:', name, '| author:', author);
    console.log('url:', url);
    console.log('\n' + readme);
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log('\n(演练结束，已删除临时目录)');
    return;
  }

  if (process.env.SKIP_PUSH === '1') {
    console.log('SKIP_PUSH=1，文件已写入但未提交、未评论。');
    return;
  }

  commitAndPush({ name, hash, categoryId, issueNumber: issue.number });

  await addComment(
    [
      '### 已收录',
      '',
      `| | |`,
      `| --- | --- |`,
      `| 名称 | ${name} |`,
      `| 作者 | @${author} |`,
      `| 分类 | ${category.name} |`,
      `| 哈希 | \`${hash}\` |`,
      `| 文件 | \`appearance/${categoryId}/${hash}/${hash}.js\` |`,
      `| 页面 | ${url} |`,
      '',
      categoryNote ? `> ${categoryNote}` : '',
      '',
      `Vercel 会在这次 push 之后自动重建，一般 1–2 分钟后 ${url} 就能打开。`,
      `收录不代表永久保留：如果后面发现行为有变（比如你更新了代码里指向的远程资源），维护者有权下架。`,
    ]
      .filter(Boolean)
      .join('\n'),
  );
  await addLabels(['accepted']);
  console.log('完成。');
}

function commitAndPush({ name, hash, categoryId, issueNumber }) {
  const git = (cmd) => execSync(cmd, { cwd: ROOT, stdio: 'pipe' }).toString();
  const branch = process.env.GITHUB_REF_NAME || 'main';
  git('git add appearance');
  const staged = git('git diff --cached --name-only').trim();
  if (!staged) {
    console.log('没有实际变更，跳过提交。');
    return;
  }
  git(
    `git -c user.name="appearance-bot" -c user.email="appearance-bot@users.noreply.github.com" commit -m "收录 ${name} (${hash.slice(0, 6)}) from #${issueNumber}"`,
  );
  try {
    git(`git push origin HEAD:${branch}`);
  } catch (e) {
    // 并发场景：拉一次再推
    git(`git pull --rebase --autostash origin ${branch}`);
    git(`git push origin HEAD:${branch}`);
  }
  console.log('已推送。');
}

async function fail(issue, message) {
  console.error(message);
  if (DRY) return;
  await addComment(`### 没有收录\n\n${message}`);
  await addLabels(['needs-human-review']);
}

main().catch(async (err) => {
  console.error(err);
  if (!DRY) {
    try {
      await addComment(`### 收录出错\n\n\`\`\`\n${String(err.message || err).slice(0, 1500)}\n\`\`\`\n维护者看一下工作流日志。`);
      await addLabels(['needs-human-review']);
    } catch {
      /* 评论失败就算了，别把原始错误盖掉 */
    }
  }
  process.exitCode = 1;
});
