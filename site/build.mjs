#!/usr/bin/env node
/**
 * 静态站点构建。零依赖：把 appearance/ 读出来，渲染成 HTML + Markdown + 站点地图。
 * Vercel 的 Build Command 就是 `node site/build.mjs`。
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, scanThemes, siteOrigin, readCategories } from '../scripts/lib/shared.mjs';
import { SITE, esc } from './lib/layout.mjs';
import { paletteOf } from './lib/palette.mjs';
import { renderPreviewDocument } from './lib/preview.mjs';
import { home, library, themePage } from './lib/pages.mjs';
import {
  about,
  submit,
  notFound,
  homeMd,
  libraryMd,
  themeMd,
  aboutMd,
  submitMd,
  notFoundMd,
} from './lib/pages-extra.mjs';

SITE.origin = siteOrigin();

const DIST = path.join(ROOT, 'site', 'dist');
const today = new Date().toISOString().slice(0, 10);

/* ---------- 读数据 ---------- */
const scanned = scanThemes();
if (scanned.errors.length) {
  console.error('✗ 外观目录有问题，先修好再构建：');
  for (const e of scanned.errors) console.error('  - ' + e);
  process.exit(1);
}

const themes = scanned.themes.map((t) => ({ ...t, palette: paletteOf(t.source) }));
const categories = readCategories();
const stats = {
  total: themes.length,
  authors: new Set(themes.map((t) => t.author)).size,
  bytes: themes.reduce((n, t) => n + t.bytes, 0),
  byCategory: Object.fromEntries(categories.map((c) => [c.id, themes.filter((t) => t.category === c.id).length])),
};
const ctx = { themes, categories, stats };

/* ---------- 写文件 ---------- */
fs.rmSync(DIST, { recursive: true, force: true });

function write(rel, content) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  return rel;
}

const urls = [];
function route(rel, priority, lastmod = today) {
  urls.push({ loc: `${SITE.origin}/${rel === 'index.html' ? '' : rel.replace(/index\.html$/, '')}`, priority, lastmod });
}

/* 首页 */
write('index.html', home(ctx));
write('index.md', homeMd(ctx));
route('index.html', '1.0');

/* 库 */
write('library/index.html', library(ctx));
write('library/index.md', libraryMd(ctx));
route('library/index.html', '0.9');

/* 分类 */
for (const c of categories) {
  const list = themes.filter((t) => t.category === c.id);
  write(`library/c/${c.id}/index.html`, library(ctx, { categoryId: c.id }));
  write(`library/c/${c.id}/index.md`, libraryMd(ctx, c.id));
  route(`library/c/${c.id}/index.html`, '0.7', latestOf(list));
}

/* 每个外观 */
themes.forEach((t, i) => {
  const prev = themes[i - 1] || null;
  const next = themes[i + 1] || null;
  write(`library/${t.hash}/index.html`, themePage(ctx, t, prev, next));
  write(`library/${t.hash}/index.md`, themeMd(t));
  write(`library/${t.hash}/${t.hash}.js`, t.source);
  route(`library/${t.hash}/index.html`, '0.75', t.created || today);
});

/* 关于 / 投稿 / 404 */
write('about/index.html', about(ctx));
write('about/index.md', aboutMd(ctx));
route('about/index.html', '0.5');

write('submit/index.html', submit(ctx));
write('submit/index.md', submitMd());
route('submit/index.html', '0.6');

write('404.html', notFound(ctx));
write('404.md', notFoundMd());

/* 静态资源 */
const assets = path.join(ROOT, 'site', 'assets');
for (const f of fs.readdirSync(assets)) {
  write(`assets/${f}`, fs.readFileSync(path.join(assets, f)));
}
/* 预览模板：iframe 共用一份，省流量 */
write('assets/preview.html', renderPreviewDocument({ placeholder: true }));

/* ---------- robots / sitemap / llms / api ---------- */
const SITE_ORIGIN = SITE.origin;

write(
  'robots.txt',
  `# 水鱼文集 · 外观库
# 库里的东西本来就是给人用的，也欢迎 agent 读。
Content-Signal: search=yes, ai-train=yes, ai-input=yes

User-agent: *
Allow: /

# 明确欢迎的抓取方（列出来是为了让这些 bot 不用猜）
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: cohere-ai
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`,
);

write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`,
);

write(
  'llms.txt',
  `# 水鱼文集 · 外观库

> 水鱼文集（Waterfish Anthology）是一个自托管的个人阅读应用，允许上传 .js 文件自定义界面外观。本站收集社区写好的主题，按气质分类，每套一个不可变地址（目录名 = 文件内容 SHA-256 前 12 位）。

## 关键事实

- 主题数量：${stats.total}，作者 ${stats.authors} 位，分类 ${categories.length} 个
- 每套主题是单个 .js 文件，上限 64 KB，纯 CSS 变量 + 样式，没有依赖
- 使用方式：下载 \`/library/<hash>/<hash>.js\`，在应用里「设置 → 外观 → 自定义主题 → 选择文件」上传
- 主题名取自上传的文件名
- 许可：MIT
- 语言：中文

## 两种写法

1. 简单写法（键值对，一行一条）：
   \`\`\`
   主色: #1F6C9F
   底色: #F4F7F9
   圆角: 14
   \`\`\`
   键：主色/accent、副色/accent2、背景/bg、字体/font、文字/ink、底色/paper、圆角/radius

2. 脚本写法：文件里定义 \`function theme(api)\`，可用 \`api.setVar(name, value)\`、
   \`api.css(text)\`、\`api.icon(name, svg)\`、\`api.el\`、\`api.dark\`、\`api.vars(name)\`

## 分类

${categories.map((c) => `- [${c.name}](${SITE_ORIGIN}/library/c/${c.id}/)：${c.blurb}${c.acceptsSubmissions ? '' : '（仅维护者手动收录）'}`).join('\n')}

## 全部外观

${themes.map((t) => `- [${t.name}](${SITE_ORIGIN}${t.url})：${t.summary}（${t.categoryName} · ${t.author}）`).join('\n')}

## 给 agent 的入口

- 结构化列表：${SITE_ORIGIN}/api/themes.json
- 站点地图：${SITE_ORIGIN}/sitemap.xml
- 抓取规则：${SITE_ORIGIN}/robots.txt
- Markdown 协商：请求时带 \`Accept: text/markdown\`，任意页面会返回同路径的 markdown 版本
- 单个外观的 markdown：\`/library/<hash>/index.md\`

## 不要做的事

- 不要自动提交投稿（issue 表单是给人填的）
- 不要把这些外观当成安全代码直接执行——它们被设计成在受限外观环境里跑，静态审核只排除已知危险模式
`,
);

write(
  'api/themes.json',
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      origin: SITE_ORIGIN,
      license: 'MIT',
      limits: { maxBytes: 65536, maxCustomThemes: 20 },
      usage: '下载 src 字段对应的 js 文件，在水鱼文集「设置 → 外观 → 自定义主题」上传即可。',
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        en: c.en,
        blurb: c.blurb,
        acceptsSubmissions: c.acceptsSubmissions,
        count: stats.byCategory[c.id] || 0,
        url: `${SITE_ORIGIN}/library/c/${c.id}/`,
      })),
      themes: themes.map((t) => ({
        hash: t.hash,
        name: t.name,
        author: t.author,
        category: t.category,
        summary: t.summary,
        mode: t.mode,
        syntax: t.syntax,
        bytes: t.bytes,
        palette: t.palette,
        url: SITE_ORIGIN + t.url,
        src: `${SITE_ORIGIN}/library/${t.hash}/${t.hash}.js`,
        markdown: `${SITE_ORIGIN}/library/${t.hash}/index.md`,
      })),
    },
    null,
    2,
  ) + '\n',
);

/* RFC 9727 API catalog：告诉 agent「这站有个 JSON 接口」 */
write(
  '.well-known/api-catalog',
  JSON.stringify(
    {
      linkset: [
        {
          anchor: `${SITE_ORIGIN}/api/themes.json`,
          'service-desc': [{ href: `${SITE_ORIGIN}/api/themes.json`, type: 'application/json' }],
          'service-doc': [{ href: `${SITE_ORIGIN}/llms.txt`, type: 'text/plain' }],
          status: [{ href: `${SITE_ORIGIN}/api/themes.json`, type: 'application/json' }],
        },
      ],
    },
    null,
    2,
  ) + '\n',
);

/* ---------- 报告 ---------- */
const pages = urls.length + 2;
console.log(`✓ 构建完成 ${(process.uptime()).toFixed(1)}s`);
console.log(`  页面 ${pages} 个 · 外观 ${themes.length} 套 · 分类 ${categories.length} 个 · 作者 ${stats.authors} 位`);
console.log(`  sitemap 收录 ${urls.length} 条 · llms.txt · api/themes.json · robots.txt`);
console.log(`  输出目录 site/dist（${(dirSize(DIST) / 1024).toFixed(0)} KB）`);

function latestOf(list) {
  const dates = list.map((t) => t.created).filter(Boolean).sort();
  return dates[dates.length - 1] || today;
}

function dirSize(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(p) : fs.statSync(p).size;
  }
  return total;
}
