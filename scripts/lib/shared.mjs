/**
 * 共享工具：哈希、front matter 解析、目录扫描、主题元数据。
 * 被构建脚本、CI 校验和 GitHub Action 共用，保证三处口径一致。
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const APPEARANCE_DIR = path.join(ROOT, 'appearance');

/** 单个主题文件上限，与客户端一致（64 KB）。 */
export const MAX_BYTES = 64 * 1024;
/** 目录名 / URL 里使用的哈希长度。 */
export const HASH_LEN = 12;

/** 归一化：统一 LF、去掉行尾空白与首尾空行，保证同一份内容在任何平台算出同一个哈希。 */
export function normalizeSource(src) {
  return (
    src
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+$/gm, '')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '') + '\n'
  );
}

/** 外观哈希 = 归一化内容 SHA-256 的前 12 位。 */
export function hashSource(src) {
  return createHash('sha256').update(normalizeSource(src), 'utf8').digest('hex').slice(0, HASH_LEN);
}

export function readCategories() {
  const file = path.join(ROOT, 'categories.json');
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  return raw.categories.slice().sort((a, b) => a.order - b.order);
}

export function categoryMap() {
  return new Map(readCategories().map((c) => [c.id, c]));
}

/** 极简 YAML front matter：只支持 `key: value` 与 `key: [a, b]`，够用且不引依赖。 */
export function parseFrontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (/^".*"$|^'.*'$/.test(value)) value = value.slice(1, -1);
    data[kv[1]] = value;
  }
  return { data, body: text.slice(m[0].length) };
}

/** 扫描 appearance/<category>/<hash>/，返回所有主题条目。结构不合规的会被记进 errors。 */
export function scanThemes() {
  const themes = [];
  const errors = [];
  const cats = categoryMap();

  if (!fs.existsSync(APPEARANCE_DIR)) return { themes, errors, categories: [...cats.values()] };

  for (const catId of fs.readdirSync(APPEARANCE_DIR)) {
    const catDir = path.join(APPEARANCE_DIR, catId);
    if (!fs.statSync(catDir).isDirectory()) continue;
    if (!cats.has(catId)) {
      errors.push(`appearance/${catId}: 不是 categories.json 里的分类`);
      continue;
    }
    for (const dirName of fs.readdirSync(catDir)) {
      const dir = path.join(catDir, dirName);
      if (!fs.statSync(dir).isDirectory()) continue;
      const jsPath = path.join(dir, `${dirName}.js`);
      const mdPath = path.join(dir, 'README.md');
      const rel = `appearance/${catId}/${dirName}`;

      if (!fs.existsSync(jsPath)) {
        errors.push(`${rel}: 缺少 ${dirName}.js`);
        continue;
      }
      if (!fs.existsSync(mdPath)) {
        errors.push(`${rel}: 缺少 README.md`);
        continue;
      }
      const src = fs.readFileSync(jsPath, 'utf8');
      const hash = hashSource(src);
      if (hash !== dirName) {
        errors.push(`${rel}: 目录名与内容哈希不一致（实际 ${hash}），改过 JS 就要重新生成目录`);
      }
      const { data, body } = parseFrontMatter(fs.readFileSync(mdPath, 'utf8'));
      for (const key of ['name', 'author', 'category', 'hash', 'summary']) {
        if (!data[key]) errors.push(`${rel}/README.md: front matter 缺少 ${key}`);
      }
      if (data.hash && data.hash !== hash) {
        errors.push(`${rel}/README.md: front matter hash 是 ${data.hash}，实际 ${hash}`);
      }
      if (data.category && data.category !== catId) {
        errors.push(`${rel}/README.md: category 是 ${data.category}，但放在 ${catId}/ 下`);
      }
      const bytes = Buffer.byteLength(src, 'utf8');
      if (bytes > MAX_BYTES) errors.push(`${rel}: ${bytes} 字节，超过 64 KB 上限`);

      themes.push({
        hash,
        dirName,
        category: catId,
        categoryName: cats.get(catId).name,
        name: data.name || dirName,
        author: data.author || '匿名',
        summary: data.summary || '',
        mode: data.mode || 'both',
        syntax: data.syntax || (/function\s+theme\s*\(/.test(src) ? 'complex' : 'simple'),
        created: data.created || '',
        bytes,
        source: normalizeSource(src),
        readme: body.trim(),
        readmeRaw: fs.readFileSync(mdPath, 'utf8'),
        path: rel,
        url: `/library/${hash}/`,
      });
    }
  }

  themes.sort((a, b) => {
    const ca = cats.get(a.category).order - cats.get(b.category).order;
    return ca !== 0 ? ca : a.name.localeCompare(b.name, 'zh-Hans-CN');
  });
  return { themes, errors, categories: [...cats.values()] };
}

/** 站点的对外地址；Vercel 项目里把 SITE_ORIGIN 设成正式域名。 */
export function siteOrigin() {
  const raw = process.env.SITE_ORIGIN || 'https://appearance.waterfish.ren';
  return raw.replace(/\/+$/, '');
}
