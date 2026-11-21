/**
 * 外观库的共享逻辑：哈希、元信息、扫描、README 生成、投稿解析、安全规则。
 * 构建、CI 校验、投稿收录三个入口都从这里取，保证口径一致。
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const LIB = path.join(ROOT, 'appearance');

/** 和客户端一致：单个主题文件 64 KB。 */
export const MAX_BYTES = 64 * 1024;
/** 目录名取内容 SHA-256 的前 12 位。 */
export const HASH_LEN = 12;

/* ------------------------------ 文本与哈希 ------------------------------ */

/** 统一成 LF、去行尾空白、只留一个结尾换行——同一份内容在任何平台都得算出同一个哈希。 */
export function normalize(src) {
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/[ \t]+$/, ''));
  let text = lines.join('\n').replace(/^\n+/, '').replace(/\n+$/, '');
  return text + '\n';
}

export function hashOf(src) {
  return createHash('sha256').update(normalize(src), 'utf8').digest('hex').slice(0, HASH_LEN);
}

export function bytesOf(src) {
  return Buffer.byteLength(normalize(src), 'utf8');
}

/* ------------------------------ 分类 ------------------------------ */

export function categories() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'categories.json'), 'utf8'));
  return raw.categories.slice().sort((a, b) => a.order - b.order);
}

export function categoryById(id) {
  return categories().find((c) => c.id === id) || null;
}

/* ------------------------------ 主题文件 ------------------------------ */

/**
 * 头部注释里的元信息：
 *   // @name 松烟
 *   // @author waterfish
 * 简单写法的文件里也允许写这些行——应用只认「键: 值」，// 开头一律跳过。
 */
const META_KEYS = ['name', 'author', 'category', 'summary', 'mode', 'date', 'note'];

export function metaOf(src) {
  const meta = {};
  for (const line of String(src).split('\n')) {
    const m = /^\s*\/\/\s*@(\w+)\s+(.+?)\s*$/.exec(line);
    if (m && META_KEYS.includes(m[1])) meta[m[1]] = m[2];
  }
  return meta;
}

/** 出现 function theme( 就是复杂写法，否则当一行一条的声明读——和应用的判别方式一致。 */
export function syntaxOf(src) {
  return /function\s+theme\s*\(/.test(src) ? 'complex' : 'simple';
}

/** 简单写法里声明了哪些键，用来在列表页画色块、在 README 里列改动。 */
export function declsOf(src) {
  const out = [];
  for (const line of String(src).split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('//') || t.startsWith('#')) continue;
    const m = /^([^:=\s][^:=]*?)\s*[:=]\s*(.+?)\s*$/.exec(t);
    if (m) out.push({ key: m[1], value: m[2] });
  }
  return out;
}

/* ------------------------------ 扫描 ------------------------------ */

const NAME_MAX = 12;
const SUMMARY_MAX = 60;

/**
 * 读 appearance/<分类>/<哈希>/。
 * 返回 { items, problems }，problems 里的每一条都会让 verify 和构建失败。
 */
export function scan() {
  const cats = categories();
  const byId = new Map(cats.map((c) => [c.id, c]));
  const items = [];
  const problems = [];

  if (!fs.existsSync(LIB)) return { items, problems, categories: cats };

  for (const catId of fs.readdirSync(LIB).sort()) {
    const catDir = path.join(LIB, catId);
    if (!fs.statSync(catDir).isDirectory()) continue;
    const cat = byId.get(catId);
    if (!cat) {
      problems.push(`appearance/${catId}：categories.json 里没有这个分类`);
      continue;
    }

    for (const dirName of fs.readdirSync(catDir).sort()) {
      const dir = path.join(catDir, dirName);
      if (!fs.statSync(dir).isDirectory()) continue;
      const at = `appearance/${catId}/${dirName}`;
      const jsPath = path.join(dir, `${dirName}.js`);
      const mdPath = path.join(dir, 'README.md');

      if (!/^[a-f0-9]{12}$/.test(dirName)) {
        problems.push(`${at}：目录名要 12 位小写十六进制`);
        continue;
      }
      if (!fs.existsSync(jsPath)) {
        problems.push(`${at}：缺少 ${dirName}.js`);
        continue;
      }
      const src = fs.readFileSync(jsPath, 'utf8');
      const hash = hashOf(src);
      if (hash !== dirName) {
        problems.push(`${at}：目录名和内容的哈希对不上（应为 ${hash}）`);
        continue;
      }
      if (bytesOf(src) > MAX_BYTES) {
        problems.push(`${at}：${bytesOf(src)} 字节，超过 64 KB`);
        continue;
      }
      if (!fs.existsSync(mdPath)) {
        problems.push(`${at}：缺少 README.md`);
        continue;
      }

      const meta = metaOf(src);
      if (!meta.name) problems.push(`${at}：js 头部缺 @name`);
      if (!meta.author) problems.push(`${at}：js 头部缺 @author`);
      if (meta.category && meta.category !== catId) {
        problems.push(`${at}：@category 写的是 ${meta.category}，和所在目录不一致`);
      }

      items.push({
        hash,
        dir: dir,
        jsPath,
        mdPath,
        relJs: `${catId}/${dirName}/${dirName}.js`,
        category: catId,
        categoryName: cat.name,
        categoryNote: cat.note,
        name: meta.name || dirName,
        author: meta.author || '佚名',
        summary: meta.summary || '',
        note: meta.note || '',
        mode: ['light', 'dark', 'both'].includes(meta.mode) ? meta.mode : 'both',
        date: meta.date || '',
        syntax: syntaxOf(src),
        decls: declsOf(src),
        bytes: bytesOf(src),
        source: normalize(src),
        url: `/library/${hash}/`,
        file: `/library/${hash}/${hash}.js`,
      });
    }
  }

  // 名字重复会让人以为是同一套的两份，提示一下（不拦）
  const seen = new Map();
  for (const it of items) {
    const key = it.name;
    if (seen.has(key)) {
      problems.push(`重名：${seen.get(key)} 和 ${it.relJs} 都叫「${key}」，改一个再提交`);
    }
    seen.set(key, it.relJs);
  }

  return { items: sortItems(items), problems, categories: cats };
}

function sortItems(items) {
  const order = new Map(categories().map((c) => [c.id, c.order]));
  return items.sort((a, b) => {
    const d = order.get(a.category) - order.get(b.category);
    if (d) return d;
    return a.date === b.date ? a.name.localeCompare(b.name, 'zh') : (b.date || '').localeCompare(a.date || '');
  });
}

/* ------------------------------ README ------------------------------ */

const MODE_TEXT = { light: '只做浅色', dark: '只做深色', both: '深浅都调过' };

/** 每个外观目录里的 README.md 都由这里生成，内容跟着 js 走，不靠手写。 */
export function readmeOf(item) {
  const fm = [
    '---',
    `name: ${item.name}`,
    `author: ${item.author}`,
    `category: ${item.category}`,
    `hash: ${item.hash}`,
    `mode: ${item.mode}`,
    `syntax: ${item.syntax}`,
    `bytes: ${item.bytes}`,
  ];
  if (item.date) fm.push(`date: ${item.date}`);
  if (item.summary) fm.push(`summary: ${item.summary}`);
  fm.push('---');

  const body = [
    '',
    `# ${item.name}`,
    '',
    item.summary ? `> ${item.summary}` : `> ${item.author} 写的一套外观。`,
    '',
    `- 作者：${item.author}`,
    `- 分类：${item.categoryName}`,
    `- 写法：${item.syntax === 'complex' ? '复杂（`function theme(api)`）' : '简单（一行一条键值）'}`,
    `- 适配：${MODE_TEXT[item.mode]}`,
    `- 体积：${(item.bytes / 1024).toFixed(1)} KB`,
    `- 文件：[\`${item.hash}.js\`](./${item.hash}.js)`,
    '',
  ];

  if (item.syntax === 'simple' && item.decls.length) {
    body.push('## 改了哪几项', '');
    for (const d of item.decls) body.push(`- \`${d.key}\`：${d.value}`);
    body.push('');
  }

  if (item.note) body.push('## 作者的话', '', item.note, '');

  body.push(
    '## 怎么装',
    '',
    '1. 打开水鱼文集，点左下角的用户卡片，进「外观」',
    '2. 「自定义主题」里选择上面那个 `.js` 文件（文件名就是主题名）',
    '3. 选完立即生效并保存；想退回去选「纸墨」',
    '',
    '单个文件上限 64 KB，每人最多 20 个自定义主题。',
    '',
    '---',
    '',
    `本文件由 \`npm run build\` 生成。哈希是文件内容 SHA-256 的前 12 位，改一个字符目录名就得换。`,
    '',
  );

  return fm.join('\n') + '\n' + body.join('\n');
}

/* ------------------------------ 写入 ------------------------------ */

/**
 * 把一份 js 落成 appearance/<分类>/<哈希>/。
 * 同一份内容重复提交会直接返回已有目录，不覆盖别人写的东西。
 */
export function putTheme(src, { category, force = false } = {}) {
  const text = normalize(src);
  const meta = metaOf(text);
  const cat = categoryById(category || meta.category);
  if (!cat) throw new Error(`分类不存在：${category || meta.category || '（未填）'}`);
  if (!cat.open && !force) throw new Error(`「${cat.name}」不开放投稿，只能手动收录`);
  if (bytesOf(text) > MAX_BYTES) throw new Error(`文件 ${bytesOf(text)} 字节，超过 64 KB`);
  if (!meta.name) throw new Error('js 头部缺 @name');
  if (!meta.author) throw new Error('js 头部缺 @author');

  const hash = hashOf(text);
  const dir = path.join(LIB, cat.id, hash);
  const jsPath = path.join(dir, `${hash}.js`);
  if (fs.existsSync(jsPath)) {
    return { hash, dir, existed: true, category: cat.id };
  }

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(jsPath, text, 'utf8');
  const item = { ...meta, hash, dir, category: cat.id, categoryName: cat.name, bytes: bytesOf(text), source: text };
  fs.writeFileSync(path.join(dir, 'README.md'), readmeOf({ ...item, syntax: syntaxOf(text), decls: declsOf(text), mode: meta.mode || 'both' }), 'utf8');
  return { hash, dir, existed: false, category: cat.id };
}

/* ------------------------------ 投稿 issue ------------------------------ */

const FIELD_ALIAS = {
  作者: 'author', author: 'author',
  名称: 'name', 名字: 'name', name: 'name',
  简介: 'summary', 说明: 'summary', summary: 'summary',
  希望分类: 'category', 分类: 'category', category: 'category',
  js内容: 'code', js: 'code', 代码: 'code', code: 'code',
};

/** GitHub issue 表单渲染出来是 `### 作者\n\n值`，按这个形状切字段。 */
export function parseIssue(body) {
  const out = {};
  const text = String(body || '');
  const parts = text.split(/^###\s*/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const label = (nl === -1 ? part : part.slice(0, nl)).trim().toLowerCase().replace(/\s+/g, '');
    const value = (nl === -1 ? '' : part.slice(nl + 1)).trim();
    const key = FIELD_ALIAS[label];
    if (key && !out[key]) out[key] = value;
  }
  out.code = extractCode(out.code);
  return out;
}

/** 从代码块里取 js；没有代码块时认一行 raw / gist 链接。 */
function extractCode(value) {
  if (!value) return '';
  const fence = /```(?:js|javascript|json)?\s*\n([\s\S]*?)```/.exec(value);
  if (fence) return fence[1].replace(/\s+$/, '');
  const url = /(https?:\/\/(?:raw\.githubusercontent\.com|gist\.githubusercontent\.com)\/\S+)/.exec(value);
  return url ? { fetchUrl: url[1] } : '';
}

/* ------------------------------ 安全规则 ------------------------------ */

/**
 * 外观只该碰 CSS 变量、样式、图标。下面这些一律拦：
 * 主题在页面主世界跑，能拿到 document，做点别的事太容易了。
 */
const HARD = [
  [/eval\s*\(/, 'eval', '执行字符串代码，看不懂它在干什么'],
  [/new\s+Function\s*\(/, 'new-function', '动态编译代码，等于 eval'],
  [/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket\s*\(/, 'network', '发网络请求，可以把页面内容送走'],
  [/document\s*\.\s*cookie|localStorage|sessionStorage|indexedDB/, 'storage', '碰登录态或本地存储，外观不需要这些'],
  [/location\s*\.\s*(href|assign|replace)\s*=|location\s*=|window\s*\.\s*open\s*\(/, 'redirect', '跳转或开新窗口，外观不该管导航'],
  [/<script|innerHTML\s*=.*<script/i, 'script-tag', '往页面里塞 script 标签'],
  [/addEventListener\s*\(\s*['"]key|onkey(down|up|press)/, 'keyboard', '监听键盘输入'],
  [/password|passwd|credential|token/i, 'credentials', '提到凭据，主题不需要这些词'],
];

const SOFT = [
  [/https?:\/\/([^\s'"`)]+)/g, 'external', '引用了外部地址，确认是字体或图片而不是脚本'],
  [/api\s*\.\s*el\b/, 'api-el', '直接用 api.el 摸 DOM，能用变量解决就别动元素'],
  [/@import/i, 'import', 'CSS @import 会拉远程样式，尽量内联'],
  [/url\(\s*['"]?(?!data:)/i, 'url', 'url() 指向外部资源'],
];

export function guard(src) {
  const text = String(src);
  const lines = text.split('\n');
  const hard = [];
  const soft = [];

  for (const [re, id, why] of HARD) {
    const keep = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    while ((m = keep.exec(text))) {
      hard.push({ id, why, line: lineOf(text, m.index), sample: m[0].slice(0, 40) });
      if (m.index === keep.lastIndex) keep.lastIndex++;
    }
  }
  for (const [re, id, why] of SOFT) {
    const keep = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    let m;
    let count = 0;
    while ((m = keep.exec(text)) && count < 4) {
      soft.push({ id, why, line: lineOf(text, m.index), sample: m[0].slice(0, 60) });
      count++;
    }
  }

  const score = Math.max(0, 100 - hard.length * 40 - soft.length * 6);
  return {
    hard,
    soft,
    score,
    syntax: syntaxOf(text),
    bytes: bytesOf(text),
    lines: lines.length,
  };
}

function lineOf(text, index) {
  let n = 1;
  for (let i = 0; i < index; i++) if (text[i] === '\n') n++;
  return n;
}
