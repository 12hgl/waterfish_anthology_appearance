#!/usr/bin/env node
/**
 * 投稿 issue 的自动审核：静态规则 + GitHub Models 复审。
 * 只在 issue 打开 / 编辑时跑，结论写成一条可覆盖的评论，并打标签。
 *
 * 本地演练：
 *   DRY_RUN=1 node scripts/review-issue.mjs --body-file ./issue.md
 */
import fs from 'node:fs';
import { readCategories } from './lib/shared.mjs';
import { scan } from './lib/rules.mjs';
import { parseIssueBody, resolveCategory } from './lib/issue.mjs';
import { reviewWithAI, isConfigured } from './lib/ai.mjs';
import {
  addComment,
  addLabels,
  getIssue,
  hasLabel,
  listComments,
  updateComment,
} from './lib/github.mjs';

const MARKER = '<!-- appearance-review -->';
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
    const body = fsRead(arg('body-file'));
    issue = {
      number: Number(arg('number') || 0),
      title: arg('title') || '[投稿] 本地演练',
      body,
      html_url: 'https://github.com/local/dry-run',
      user: { login: arg('author') || 'local' },
      labels: [],
    };
  } else {
    issue = await getIssue();
  }

  const title = issue.title || '';
  const body = issue.body || '';
  if (!/^\[投稿\]/.test(title) && !/###\s*JS\s*内容/i.test(body)) {
    console.log('不是主题投稿，跳过。');
    return;
  }
  if (hasLabel(issue, 'accepted') || hasLabel(issue, 'skip-ai')) {
    console.log('已收录或要求跳过，跳过审核。');
    return;
  }

  const parsed = parseIssueBody(body);
  const source = (parsed.code || '').trim();
  const requestedCategory = resolveCategory(parsed.category, categories);

  if (!source) {
    await publish(issue, {
      body: [
        MARKER,
        '## 自动审核：没读到代码',
        '',
        'issue 里没有找到「JS 内容」。请把主题代码放进一行 ` ```js ` 开头的代码块，或者贴一个 `raw.githubusercontent.com` / gist 的直链。',
        '',
        '改完直接编辑这个 issue，我会重新审。',
      ].join('\n'),
      labels: ['needs-human-review'],
    });
    return;
  }

  const result = scan(source, {
    category: requestedCategory,
    acceptsSubmissions: requestedCategory ? catMap.get(requestedCategory)?.acceptsSubmissions : undefined,
  });

  const ai = await reviewWithAI({
    source,
    name: parsed.name,
    summary: parsed.summary,
    category: parsed.category,
    ruleFindings: {
      blocks: result.blocks.map((b) => b.id),
      warns: result.warns.map((w) => w.id),
      bytes: result.bytes,
      syntax: result.syntax,
    },
  });

  const verdict = decide(result, ai);
  const risks = [...result.blocks.map((b) => `（规则）${b.why}`), ...result.warns.map((w) => `（提示）${w.why}`), ...((ai && ai.risks) || [])];

  const comment = render({
    issue,
    parsed,
    result,
    ai,
    verdict,
    risks,
    requestedCategory,
    catMap,
    categories,
  });

  const labels = [];
  if (verdict === 'pass') labels.push('ai-approved');
  else if (verdict === 'reject') labels.push('ai-rejected');
  else labels.push('needs-human-review');

  await publish(issue, { body: comment, labels });
}

function decide(result, ai) {
  if (result.blocks.length) return 'reject';
  if (!ai) return result.warns.length ? 'review' : 'pass';
  if (ai.verdict === 'reject') return 'reject';
  if (ai.is_theme === false) return 'reject';
  const score = Math.min(result.score, ai.score);
  if (ai.verdict === 'review' || result.warns.length || score < 78) return 'review';
  return 'pass';
}

function render({ parsed, result, ai, verdict, risks, requestedCategory, catMap, categories }) {
  const badge = {
    pass: '建议通过 ✅',
    review: '需要人看一眼 ⚠️',
    reject: '不建议收录 ⛔',
  }[verdict];

  const fmt = (n) => `${(n / 1024).toFixed(1)} KB`;
  const lines = [
    MARKER,
    `## 自动审核：${badge}`,
    '',
    '| | |',
    '| --- | --- |',
    `| 静态检查 | ${result.score}/100 · ${result.blocks.length} 处拒绝 · ${result.warns.length} 处提示 |`,
    `| AI 复审 | ${ai ? `${ai.score}/100 · ${ai.summary || '没有结论'}` : '未启用或调用失败，只跑规则'} |`,
    `| 写法识别 | ${result.syntax === 'complex' ? '复杂写法 `function theme(api)`' : '简单写法（键值对）'} |`,
    `| 体积 | ${fmt(result.bytes)}（上限 64 KB） |`,
    `| 自报分类 | ${requestedCategory ? catMap.get(requestedCategory).name : parsed.category ? `「${parsed.category}」不是有效分类` : '未填'} |`,
    `| 作者 / 名称 | ${parsed.author || '未填'} / ${parsed.name || '未填'} |`,
    '',
  ];

  if (result.blocks.length) {
    lines.push('### 卡住的地方（必须改）', '');
    for (const b of result.blocks) lines.push(`- 第 ${b.line} 行 \`${b.id}\`：${b.why}`);
    lines.push('');
  }

  if (result.warns.length) {
    lines.push('### 提示项（不一定拦）', '');
    for (const w of result.warns.slice(0, 10)) {
      lines.push(`- ${w.line ? `第 ${w.line} 行：` : ''}${w.why}`);
    }
    lines.push('');
  }

  if (ai) {
    lines.push('### AI 复审意见', '');
    lines.push(`> ${ai.summary || '（没有给出摘要）'}`);
    lines.push('');
    if (ai.risks?.length) for (const r of ai.risks) lines.push(`- ${r}`);
    if (ai.suggested_name) lines.push(`- 建议名称：**${ai.suggested_name}**`);
    if (ai.suggested_category && catMap.has(ai.suggested_category)) {
      lines.push(`- 建议分类：**${catMap.get(ai.suggested_category).name}**（当前自报：${parsed.category || '无'}）`);
    }
    lines.push('');
  } else if (!isConfigured()) {
    lines.push('### AI 复审意见', '', '> 这次没跑 AI（环境里没有模型凭据），结论只来自静态规则。', '');
  }

  lines.push('### 下一步', '');
  if (verdict === 'reject') {
    lines.push(
      '- 投稿人：按上面「必须改」的那几条改完，直接编辑 issue 正文，机器人会重审。',
      '- 维护者：如果认为规则误判，打上 `skip-ai` 再手动关，仍可走 `approved` 收录。',
    );
  } else if (verdict === 'review') {
    lines.push(
      '- 维护者：确认没问题后，给这个 issue 打上 `approved` 标签**再关闭**，机器人会把文件写进 `appearance/` 并生成页面。',
      '- 想换分类就在关闭前加一个 `category:reading` 这样的标签，标签优先于 issue 里选的那项。',
    );
  } else {
    lines.push(
      '- 维护者：打上 `approved` 标签然后关闭 issue，剩下的交给机器人。',
      `- 如果觉得分类不合适，关闭前加一个 \`category:xxx\` 标签，可选：${categories
        .filter((c) => c.acceptsSubmissions)
        .map((c) => `\`${c.id}\``)
        .join('、')}。`,
    );
  }
  if (parsed.summary) {
    lines.push('', `<details><summary>投稿人写的简介</summary>`, '', parsed.summary, '', '</details>');
  }
  void risks;
  return lines.join('\n');
}

async function publish(issue, { body, labels }) {
  if (DRY) {
    console.log('\n----- 评论预览 -----\n' + body + '\n--------------------');
    console.log('标签：', labels.join(', '));
    return;
  }
  const comments = await listComments();
  const mine = comments.find((c) => c.user?.login?.endsWith('[bot]') && c.body?.includes(MARKER));
  if (mine) {
    await updateComment(mine.id, body);
  } else {
    await addComment(body);
  }
  await addLabels(labels);
}

function fsRead(file) {
  if (!file) return process.env.ISSUE_BODY || '';
  return fs.readFileSync(file, 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
