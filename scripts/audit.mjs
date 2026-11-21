#!/usr/bin/env node
/**
 * 投稿 issue 的自动审核：先跑静态规则，再让 GitHub Models 复审一遍，结论写成一条可覆盖的评论。
 * issue 打开、编辑、重开时触发；已收录或已打 skip-ai 的跳过。
 *
 * 本地演练（不碰 GitHub）：
 *   DRY_RUN=1 node scripts/audit.mjs --body ./issue.md
 */
import fs from 'node:fs';
import { categories, parseIssue, guard, metaOf } from './lib/core.mjs';
import { review, configured, MODEL } from './lib/model.mjs';
import { getIssue, listComments, createComment, editComment, addLabels, removeLabel, labelsOf } from './lib/github.mjs';

const MARK = '<!-- wf-audit -->';
const DRY = process.env.DRY_RUN === '1' || process.argv.includes('--dry');

const LABELS = {
  ok: 'ai-ok',
  check: 'manual-check',
  reject: 'blocked',
};

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? null : process.argv[i + 1];
}

async function main() {
  const cats = categories();
  const issue = DRY
    ? {
        number: 0,
        title: arg('title') || '[投稿] 本地演练',
        body: fs.readFileSync(arg('body') || '/dev/stdin', 'utf8'),
        user: { login: arg('author') || 'local' },
        labels: [],
      }
    : await getIssue();

  const labels = labelsOf(issue);
  if (labels.includes('accepted')) return console.log('已收录，跳过。');
  if (labels.includes('skip-ai')) return console.log('维护者要求跳过审核。');

  const parsed = parseIssue(issue.body || '');
  const code = typeof parsed.code === 'string' ? parsed.code.trim() : '';
  if (!code) {
    await publish(issue, {
      body: [
        MARK,
        '## 没读到代码',
        '',
        'issue 里没找到「JS 内容」。把主题代码放进一个 ` ```js ` 代码块，或者贴 `raw.githubusercontent.com` / gist 的直链，然后编辑这个 issue，我会重新看。',
      ].join('\n'),
      labels: ['manual-check'],
    });
    return;
  }

  const meta = metaOf(code);
  const cat = cats.find((c) => c.id === parsed.category || c.name === parsed.category) || null;
  const g = guard(code);
  const ai = await review({
    source: code,
    name: parsed.name || meta.name,
    summary: parsed.summary,
    category: parsed.category,
    findings: { hard: g.hard.map((h) => h.id), soft: g.soft.map((s) => s.id), bytes: g.bytes, syntax: g.syntax },
  });

  const verdict = decide(g, ai);
  const text = render({ issue, parsed, meta, cat, g, ai, verdict, cats });

  const label = LABELS[verdict];
  const stale = Object.values(LABELS).filter((l) => l !== label);
  await publish(issue, { body: text, labels: [label], staleLabels: stale });
  if (!DRY) await addLabels(['submission'].filter((l) => !labels.includes(l))).catch(() => {});
}

function decide(g, ai) {
  if (g.hard.length) return 'reject';
  if (!ai) return g.soft.length ? 'check' : 'ok';
  if (ai.verdict === 'reject' || ai.is_theme === false) return 'reject';
  const score = Math.min(g.score, ai.score);
  if (ai.verdict === 'review' || g.soft.length || score < 76) return 'check';
  return 'ok';
}

const BADGE = { ok: '看着没问题 ✅', check: '要人看一眼 ⚠️', reject: '不建议收 ⛔' };

function render({ issue, parsed, meta, cat, g, ai, verdict, cats }) {
  const L = [];
  L.push(MARK, `## 自动审核：${BADGE[verdict]}`, '');

  L.push('| 项 | 结果 |', '| --- | --- |');
  L.push(`| 静态规则 | ${g.score}/100，${g.hard.length} 处拦截，${g.soft.length} 处留意 |`);
  L.push(`| AI 复审 | ${ai ? `${ai.score}/100，${ai.summary || '没给结论'}` : configured() ? '调用失败，只看规则' : '未启用，只看规则'} |`);
  L.push(`| 写法 | ${g.syntax === 'complex' ? '复杂（`function theme(api)`）' : '简单（键值对）'} |`);
  L.push(`| 体积 | ${(g.bytes / 1024).toFixed(1)} KB（上限 64 KB） |`);
  L.push(`| 分类 | ${cat ? `${cat.name}${cat.open ? '' : '（不开放投稿）'}` : parsed.category ? `${parsed.category}（没有这个分类）` : '未填'} |`);
  L.push(`| 作者 / 名称 | ${parsed.author || meta.author || '未填'} / ${parsed.name || meta.name || '未填'} |`);
  L.push('');

  if (g.hard.length) {
    L.push('### 拦下来的地方', '');
    for (const h of g.hard) L.push(`- 第 ${h.line} 行 \`${h.id}\`：${h.why}`);
    L.push('');
  }

  if (g.soft.length) {
    L.push('### 留意', '');
    const seen = new Set();
    for (const s of g.soft) {
      const key = s.id + s.sample;
      if (seen.has(key)) continue;
      seen.add(key);
      L.push(`- 第 ${s.line} 行：${s.why}${s.sample ? `（\`${s.sample}\`）` : ''}`);
    }
    L.push('');
  }

  if (ai && (ai.risks.length || ai.suggested_name || ai.suggested_category)) {
    L.push('### AI 复审', '');
    if (ai.risks.length) for (const r of ai.risks) L.push(`- ${r}`);
    if (ai.suggested_name) L.push(`- 建议名称：**${ai.suggested_name}**`);
    const s = cats.find((c) => c.id === ai.suggested_category);
    if (s) L.push(`- 建议分类：**${s.name}**（自报：${parsed.category || '无'}）`);
    L.push('');
  }

  L.push('### 接下来', '');
  if (verdict === 'reject') {
    L.push('- 投稿人：按上面「拦下来的地方」改，改完直接编辑这个 issue，机器人会重审。');
    L.push('- 维护者：确认真是误判的话，打 `skip-ai` 再打 `approved` 关闭，仍然会收录。');
  } else if (verdict === 'check') {
    L.push('- 维护者：看完没问题就加 `approved` 标签，然后关闭 issue，机器人会把文件写进 `appearance/`。');
    L.push('- 想改分类，关闭前加一个 `category:reading` 这样的标签，标签优先。');
  } else {
    L.push('- 维护者：加 `approved` 标签再关闭，剩下的交给机器人。');
    L.push(`- 分类不对就先加 \`category:xxx\`，可选：${cats.filter((c) => c.open).map((c) => '`' + c.id + '`').join('、')}。`);
  }
  if (parsed.summary) L.push('', '<details><summary>投稿人填的简介</summary>', '', parsed.summary, '', '</details>');
  void issue;
  return L.join('\n');
}

async function publish(issue, { body, labels, staleLabels = [] }) {
  if (DRY) {
    console.log('\n----- 评论 -----\n' + body + '\n---------------');
    console.log('标签：' + labels.join(', '));
    return;
  }
  const mine = (await listComments(issue.number)).find((c) => c.body?.includes(MARK));
  if (mine) await editComment(mine.id, body);
  else await createComment(body);
  await addLabels(labels);
  for (const l of staleLabels) await removeLabel(l).catch(() => {});
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
