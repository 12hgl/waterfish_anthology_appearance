/**
 * 解析投稿 issue 的正文（GitHub Issue Form 渲染后的 markdown）。
 * Issue Form 的每个字段都会变成 `### 字段名` 一段，这里按标题切。
 */
import { parseSimpleStyle } from './rules.mjs';

const FIELD_ALIASES = {
  author: ['作者', 'author', 'github'],
  name: ['名称', '主题名', 'name'],
  summary: ['简介', 'summary', '描述'],
  category: ['希望分类', '分类', 'category'],
  source: ['js 内容', 'js内容', 'js', '代码', '主题代码'],
  ack: ['确认', 'checkbox'],
};

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[\s（）()【】[\]]/g, '');
}

/** 把 body 切成 { 标题: 内容 }，标题做小写去空格处理。 */
export function splitSections(body) {
  const text = String(body || '').replace(/\r\n?/g, '\n');
  const sections = new Map();
  const parts = text.split(/^#{2,3}\s+/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    if (nl === -1) continue;
    const title = normalizeTitle(part.slice(0, nl).trim());
    const content = part.slice(nl + 1).trim();
    sections.set(title, content);
  }
  return sections;
}

function pick(sections, keys) {
  for (const key of keys) {
    const k = normalizeTitle(key);
    if (sections.has(k)) return sections.get(k);
  }
  // 退一步做包含匹配，避免投稿人手改标题
  for (const [title, value] of sections) {
    for (const key of keys) {
      if (title.includes(normalizeTitle(key))) return value;
    }
  }
  return '';
}

/** 取正文里最长的一个围栏代码块。 */
export function extractCodeBlock(text) {
  const re = /```[a-zA-Z0-9+#-]*\s*\n([\s\S]*?)```/g;
  let best = '';
  let m;
  while ((m = re.exec(text))) {
    if (m[1].length > best.length) best = m[1];
  }
  return best;
}

const URL_RE = /^<?(https?:\/\/\S+?)>?$/;

export function parseIssueBody(body) {
  const sections = splitSections(body);

  const author = clean(pick(sections, FIELD_ALIASES.author)).replace(/^@/, '');
  const name = clean(pick(sections, FIELD_ALIASES.name));
  const summary = clean(pick(sections, FIELD_ALIASES.summary));
  const category = clean(pick(sections, FIELD_ALIASES.category));
  const rawSource = pick(sections, FIELD_ALIASES.source);
  const ack = pick(sections, FIELD_ALIASES.ack);

  const code = extractCodeBlock(rawSource);
  const withoutFence = clean(rawSource);
  const urlMatch = withoutFence.match(URL_RE);

  return {
    author,
    name,
    summary: summary.length > 160 ? summary.slice(0, 160) : summary,
    category,
    ack: /\[[xX]\]/.test(ack) || /- \[[xX]\]/.test(body),
    code: code || (urlMatch ? '' : withoutFence),
    remoteUrl: urlMatch ? urlMatch[1] : '',
    raw: String(body || ''),
  };
}

function clean(s) {
  const t = String(s || '').trim();
  if (/^_?no response_?$/i.test(t)) return '';
  if (/^_?无_?$/.test(t)) return '';
  return t.replace(/^```[a-zA-Z0-9]*\n?|```$/g, '').trim();
}

/** 「阅读」/「reading」/「Reading」都映射到分类 id。 */
export function resolveCategory(input, categories) {
  if (!input) return null;
  const t = normalizeTitle(input);
  for (const c of categories) {
    if (normalizeTitle(c.id) === t || normalizeTitle(c.name) === t || normalizeTitle(c.en || '') === t) {
      return c.id;
    }
  }
  for (const c of categories) {
    if (t.includes(normalizeTitle(c.name)) || normalizeTitle(c.name).includes(t)) return c.id;
  }
  return null;
}

/** 从代码里猜一个名字（投稿人漏填「名称」时兜底）。 */
export function guessName(code) {
  const { entries } = parseSimpleStyle(code);
  if (entries.length) {
    const accent = entries.find((e) => e.key === 'accent');
    return accent ? `自定义 ${accent.value}` : '未命名外观';
  }
  return '未命名外观';
}
