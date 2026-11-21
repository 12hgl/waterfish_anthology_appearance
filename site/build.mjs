#!/usr/bin/env node
/**
 * 站点构建。零依赖：读 appearance/，写 site/dist。
 * Vercel 的 Build Command 就是 `node site/build.mjs`。
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT, scan, readmeOf, normalize } from '../scripts/lib/core.mjs';
import { SITE, esc, page, shot, themeRow, catNav, crumb, ICON } from './view.mjs';
import { paletteOf } from './palette.mjs';
import { md, bodyOf } from './markdown.mjs';
import { frameDocument } from './frame.mjs';

SITE.origin = (process.env.SITE_ORIGIN || 'https://appearance.waterfish.ren').replace(/\/$/, '');

const DIST = path.join(ROOT, 'site', 'dist');
const TODAY = new Date().toISOString().slice(0, 10);

/* ---------------- 读数据 ---------------- */

const { items, problems, categories } = scan();
if (problems.length) {
  console.error('✗ 外观目录有问题，先修再构建：');
  problems.forEach((p) => console.error('  - ' + p));
  process.exit(1);
}

const themes = items.map((t) => ({ ...t, palette: paletteOf(t.source, { paper: '#F5F2E9', accent: '#8B8578', ink: '#1A1915' }) }));
const counts = Object.fromEntries(categories.map((c) => [c.id, themes.filter((t) => t.category === c.id).length]));
const stats = {
  total: themes.length,
  authors: new Set(themes.map((t) => t.author)).size,
  categories: categories.length,
};

/* ---------------- 写文件 ---------------- */

fs.rmSync(DIST, { recursive: true, force: true });
const routes = [];

function write(rel, content) {
  const file = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function wellKnown(rel, content) {
  write(`.well-known/${rel}`, content);
  write(`well-known/${rel}`, content);
}

function route(pathname, priority, lastmod = TODAY) {
  routes.push({ loc: SITE.origin + pathname, priority, lastmod });
}

/* ---------------- 首页 ---------------- */

const hero = themes.filter((t) => t.category === 'recommended').slice(0, 3);
const featured = hero.length ? hero : themes.slice(0, 3);
const frames = {};
featured.forEach((t, i) => {
  frames['h' + i] = { src: t.source, dark: t.mode === 'dark' };
});

const switcher = `<div class="switch">${featured
  .map(
    (t, i) =>
      `<button type="button" data-key="h${i}" data-label="${esc(t.name)} · ${esc(t.author)}" aria-pressed="${i === 0}"><span class="sw" style="--sw:${t.palette.accent}"></span>${esc(t.name)}</button>`,
  )
  .join('')}</div>
<p class="caption">这个窗口真的在跑这套主题。书架是假的，CSS 变量是真的。右上角可以切深浅。</p>`;

const homeBody = `
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">appearance library</p>
      <h1>给同一堆字，<br>换一张纸。</h1>
      <p class="lede">
        水鱼文集是跑在自己 NAS 上的阅读应用，允许上传一个 <code>.js</code> 换掉整套外观：
        配色、字体、圆角、背景一起走。这里是别人写好的 ${stats.total} 套，下载、上传、生效，
        不用登录，也没有插件市场。
      </p>
      <div class="acts">
        <a class="btn" href="/library/">翻一遍外观库 ${ICON.arrow}</a>
        <a class="btn ghost" href="/submit/">我也想写一套</a>
      </div>
      <ul class="facts">
        <li><b>${stats.total}</b><span>套外观</span></li>
        <li><b>${stats.categories}</b><span>个分类</span></li>
        <li><b>64 KB</b><span>单文件上限</span></li>
        <li><b>0</b><span>依赖与统计</span></li>
      </ul>
    </div>
    <div>
      ${shot({ key: 'h0', label: `${featured[0].name} · ${featured[0].author}`, dark: featured[0].mode === 'dark', extra: switcher })}
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <h2>三步，不到一分钟</h2>
    <ol class="steps">
      <li><span class="num">01</span><div><b>挑一套</b><p>按气质分成了七类。拿不定主意就看「推荐」，那几套是长期在用的。</p></div></li>
      <li><span class="num">02</span><div><b>下载 .js</b><p>一套就一个文件。存成什么名字，应用里就显示什么主题名。</p></div></li>
      <li><span class="num">03</span><div><b>传上去</b><p>点左下角用户卡片 → 外观 → 自定义主题 → 选文件。选完立即生效。</p></div></li>
    </ol>
  </div>
</section>

<section class="band">
  <div class="wrap split">
    <div>
      <h2>库里有什么</h2>
      <p>七类，${stats.total} 套。分类看的是气质，不是功能——同一套外观可能两边都像，归到更像的那一类。</p>
    </div>
    <div class="toc">
      ${categories
        .map(
          (c, i) =>
            `<a class="toc-row" href="/library/c/${c.id}/"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="nm">${esc(c.name)}</span><span class="ds">${esc(c.note)}</span><span class="ct"><b>${counts[c.id] || 0}</b> 套</span></a>`,
        )
        .join('')}
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap split">
    <div>
      <h2>怎么进来</h2>
      <p>投稿走 issue 表单，不收邮件，也不收 PR 里塞的压缩包。三道关：</p>
    </div>
    <ul class="checks">
      <li><b>静态规则</b>先扫一遍。eval、发请求、碰 cookie / localStorage、监听键盘，这类直接拦。</li>
      <li><b>AI 复审</b>再看语义：这段代码到底是不是只改外观，有没有违规内容。</li>
      <li><b>人看一眼</b>，然后关闭 issue。机器人把文件写进 <code>appearance/</code>，CI 过了就上线。</li>
      <li><b>「推荐」不开放投稿</b>。那三套是维护者自己在用的，看到合适的会主动去要。</li>
    </ul>
  </div>
</section>`;

write(
  'index.html',
  page({
    title: '',
    description: `水鱼文集外观库：${stats.total} 套社区写好的 .js 界面主题，按 ${stats.categories} 个分类整理，下载后上传即可换掉整套外观。`,
    path: '/',
    body: homeBody,
    frames,
    md: '/index.md',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.origin + '/',
        inLanguage: 'zh-CN',
        description: '水鱼文集的外观库：社区投稿、自动审核、按内容哈希收录的界面主题。',
      },
    ],
  }),
);
route('/', '1.0');

export const homeMd = () => `# 水鱼文集 · 外观库

> 给同一堆字，换一张纸。

水鱼文集是自托管的阅读应用（跑在自己的 NAS 上），允许上传一个 \`.js\` 换掉整套外观。
这里收了 ${stats.total} 套别人写好的主题，按 ${stats.categories} 个分类整理。

## 怎么用

1. 挑一套：${SITE.origin}/library/
2. 下载对应的 \`.js\` 文件，文件名就是之后显示的主题名
3. 应用里点左下角用户卡片 → 外观 → 自定义主题 → 选文件，选完立即生效

## 分类

${categories.map((c) => `- ${c.name}（${counts[c.id] || 0} 套）：${SITE.origin}/library/c/${c.id}/ —— ${c.note}`).join('\n')}

## 全部外观

${themes.map((t) => `- ${t.name} · ${t.author} · ${t.categoryName} · ${(t.bytes / 1024).toFixed(1)} KB：${SITE.origin}${t.url}`).join('\n')}

## 机器可读

- 全部数据：${SITE.origin}/api/themes.json
- 站点地图：${SITE.origin}/sitemap.xml
- 抓取规则：${SITE.origin}/robots.txt
- 任意页面加 \`Accept: text/markdown\` 会返回同路径的 markdown
`;

write('index.md', homeMd());

/* ---------------- 库 ---------------- */

function libraryPage(catId) {
  const cat = catId ? categories.find((c) => c.id === catId) : null;
  const list = cat ? themes.filter((t) => t.category === cat.id) : themes;
  const groups = categories.map((c) => ({ c, items: list.filter((t) => t.category === c.id) })).filter((g) => g.items.length);

  const body = `
<div class="wrap">
  <div class="page-head">
    <p class="eyebrow">${cat ? 'category' : 'all'}</p>
    <h1>${cat ? esc(cat.name) : '全部外观'}</h1>
    <p class="lede">${cat ? esc(cat.note) : `${stats.total} 套，${stats.authors} 位作者。一套一个文件，用完可以直接删。`}</p>
  </div>
  <div class="lib">
    ${catNav(categories, counts, stats.total, cat ? cat.id : '')}
    <div>
      ${
        groups.length
          ? groups
              .map(
                (g) => `<section class="group">
        <div class="group-h"><h3>${esc(g.c.name)}</h3><span>${g.items.length} 套${g.c.open ? '' : ' · 不开放投稿'}</span></div>
        <p class="group-note">${esc(g.c.note)}</p>
        ${g.items.map(themeRow).join('\n')}
      </section>`,
              )
              .join('')
          : '<p class="empty">这一类还是空的。</p>'
      }
    </div>
  </div>
</div>`;

  const pathname = cat ? `/library/c/${cat.id}/` : '/library/';
  write(
    `${pathname.slice(1)}index.html`,
    page({
      title: cat ? `${cat.name}类外观` : '外观库',
      description: cat
        ? `水鱼文集外观库的「${cat.name}」分类，共 ${list.length} 套可下载的 .js 主题。${cat.note}`
        : `水鱼文集外观库全部 ${stats.total} 套主题，按 ${stats.categories} 个分类整理，每套都能直接下载 .js 上传使用。`,
      path: pathname,
      body,
      current: '/library/',
      md: `${pathname}index.md`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: cat ? `${cat.name}类外观` : '外观库',
          url: SITE.origin + pathname,
          inLanguage: 'zh-CN',
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: list.length,
            itemListElement: list.map((t, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: t.name,
              url: SITE.origin + t.url,
              creator: { '@type': 'Person', name: t.author },
            })),
          },
        },
      ],
    }),
  );

  const mdText = `# ${cat ? cat.name + '类外观' : '外观库'}

${cat ? cat.note : `${stats.total} 套，${stats.authors} 位作者。`}

${groups
  .map(
    (g) =>
      `## ${g.c.name}（${g.items.length} 套）\n\n${g.items
        .map((t) => `- ${t.name} · ${t.author} · ${(t.bytes / 1024).toFixed(1)} KB\n  ${SITE.origin}${t.url}\n  ${t.summary || '（没写简介）'}`)
        .join('\n')}`,
  )
  .join('\n\n')}
`;
  write(`${pathname}index.md`, mdText);
  route(pathname, cat ? '0.7' : '0.9', cat ? latestOf(list) : TODAY);
}

libraryPage(null);
for (const c of categories) libraryPage(c.id);

function latestOf(list) {
  const dates = list.map((t) => t.date).filter(Boolean).sort();
  return dates[dates.length - 1] || TODAY;
}

/* ---------------- 单套外观 ---------------- */

/** 详情页上标题、简介、元信息都在页头写过了，正文从第一个二级标题开始。 */
function proseOf(mdText) {
  const body = bodyOf(mdText).trim();
  const i = body.indexOf('\n## ');
  const tail = i === -1 ? body : body.slice(i + 1);
  // 结尾那句「本文件由 npm run build 生成」是给仓库读者看的，站点上没用
  const cut = tail.lastIndexOf('\n---\n');
  return cut === -1 ? tail : tail.slice(0, cut);
}

themes.forEach((t, i) => {
  const body = `
<div class="wrap">
  ${crumb([{ text: '外观库', href: '/library/' }, { text: t.categoryName, href: `/library/c/${t.category}/` }, { text: t.name }])}
  <div class="dhead">
    <div class="dhead-top">
      <h1>${esc(t.name)}</h1>
      <div class="acts">
        <a class="btn" href="/library/${t.hash}/${t.hash}.js" download>下载 .js ${ICON.down}</a>
        <button class="btn ghost" type="button" data-copy="/library/${t.hash}/${t.hash}.js">复制地址</button>
      </div>
    </div>
    <div class="dmeta">
      <span>作者 <b>${esc(t.author)}</b></span>
      <span>${esc(t.categoryName)}</span>
      <span><b>${t.hash}</b></span>
      <span>${(t.bytes / 1024).toFixed(1)} KB</span>
      <span>${t.mode === 'dark' ? '只做深色' : t.mode === 'light' ? '只做浅色' : '深浅都调过'}</span>
    </div>
    ${t.summary ? `<p class="dsummary">${esc(t.summary)}</p>` : ''}
  </div>

  <div class="dframe">
    ${shot({ key: 'd0', label: `${t.name} · ${t.author}`, dark: t.mode === 'dark' })}
  </div>

  <div class="dbody">
    <div class="prose">
      ${md(proseOf(fs.readFileSync(t.mdPath, 'utf8')))}
    </div>
    <aside>
      <dl class="spec">
        <div><dt>作者</dt><dd>${esc(t.author)}</dd></div>
        <div><dt>分类</dt><dd>${esc(t.categoryName)}</dd></div>
        <div><dt>写法</dt><dd>${t.syntax === 'complex' ? 'function theme(api)' : '键值对'}</dd></div>
        <div><dt>体积</dt><dd>${(t.bytes / 1024).toFixed(1)} KB / 64 KB</dd></div>
        <div><dt>日期</dt><dd>${t.date || '—'}</dd></div>
        <div><dt>许可</dt><dd>MIT</dd></div>
      </dl>
      <p class="side-note">
        下载后存成 <code>${esc(t.name)}.js</code>，应用里就显示这个名字。
        安装位置：左下角用户卡片 → 外观 → 自定义主题 → 选择文件。
      </p>
      <p class="side-note">
        这一套是社区投稿，代码在
        <a href="${SITE.repo}/blob/main/appearance/${t.category}/${t.hash}/${t.hash}.js" rel="noopener">仓库</a>里，
        改动会换哈希。发现问题请<a href="${SITE.repo}/issues/new" rel="noopener">提 issue</a>。
      </p>
    </aside>
  </div>

  <div class="pager">
    ${i > 0 ? `<a href="${themes[i - 1].url}"><span>上一套</span>${esc(themes[i - 1].name)}</a>` : '<span></span>'}
    ${i < themes.length - 1 ? `<a href="${themes[i + 1].url}" style="text-align:right"><span>下一套</span>${esc(themes[i + 1].name)}</a>` : '<span></span>'}
  </div>
</div>`;

  write(
    `library/${t.hash}/index.html`,
    page({
      title: `${t.name}｜${t.categoryName}外观`,
      description: `${t.summary || `${t.author} 写的${t.categoryName}外观。`}（${(t.bytes / 1024).toFixed(1)} KB，下载 .js 即可使用）`,
      path: t.url,
      body,
      current: '/library/',
      md: `${t.url}index.md`,
      frames: { d0: { src: t.source, dark: t.mode === 'dark' } },
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: t.name,
          url: SITE.origin + t.url,
          description: t.summary || undefined,
          author: { '@type': 'Person', name: t.author },
          dateCreated: t.date || undefined,
          license: 'https://opensource.org/licenses/MIT',
          encoding: {
            '@type': 'MediaObject',
            contentUrl: SITE.origin + t.file,
            encodingFormat: 'text/javascript',
            contentSize: String(t.bytes),
          },
          isPartOf: { '@type': 'CollectionPage', name: '水鱼文集外观库', url: SITE.origin + '/library/' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: '外观库', item: SITE.origin + '/library/' },
            { '@type': 'ListItem', position: 2, name: t.categoryName, item: `${SITE.origin}/library/c/${t.category}/` },
            { '@type': 'ListItem', position: 3, name: t.name, item: SITE.origin + t.url },
          ],
        },
      ],
    }),
  );

  write(`library/${t.hash}/${t.hash}.js`, t.source);
  write(
    `library/${t.hash}/index.md`,
    `# ${t.name}

${t.summary ? '> ' + t.summary + '\n' : ''}
- 作者：${t.author}
- 分类：${t.categoryName}
- 哈希：${t.hash}
- 体积：${(t.bytes / 1024).toFixed(1)} KB
- 写法：${t.syntax === 'complex' ? '复杂（function theme(api)）' : '简单（键值对）'}
- 适配：${t.mode === 'dark' ? '只做深色' : t.mode === 'light' ? '只做浅色' : '深浅都调过'}

## 下载

${SITE.origin}/library/${t.hash}/${t.hash}.js

## 安装

1. 打开水鱼文集，点左下角用户卡片，进「外观」
2. 「自定义主题」里选择上面那个文件（文件名就是主题名）
3. 选完立即生效；想退回内置外观就选「纸墨」

## 源码

\`\`\`js
${t.source.trimEnd()}
\`\`\`

许可：MIT。本文件由 \`npm run build\` 生成，哈希是内容 SHA-256 的前 12 位。
`,
  );
  route(t.url, '0.75', t.date || TODAY);
});

/* ---------------- 投稿 / 关于 / 404 ---------------- */

const submitBody = `
<div class="wrap narrow doc">
  <p class="eyebrow">submit</p>
  <h1>写一套，交上来</h1>
  <p class="lede">
    外观就是一个 <code>.js</code> 文件。简单写法几行键值就够了，复杂写法能改样式、动效、图标。
    写完之后开一个 issue，机器人先审，人再看一眼，通过就进库。
  </p>

  <div class="cols">
    <div class="prose">
      <h2>简单写法</h2>
      <p>一行一条，只写想改的，其余沿用内置外观。</p>
      <pre class="code"><code>主色: #3E5C50
底色: #F7F5EE
圆角: 8</code></pre>
      <p>认得的键：<code>主色</code> <code>副色</code> <code>背景</code> <code>字体</code> <code>文字</code> <code>底色</code> <code>圆角</code>。</p>
    </div>
    <div class="prose">
      <h2>复杂写法</h2>
      <p>文件里定义 <code>function theme(api)</code>，应用会执行它。</p>
      <pre class="code"><code>function theme(api) {
  const d = api.dark;
  api.setVar('--paper', d ? '#141414' : '#F7F5EE');
  api.setVar('--accent', '#3E5C50');
  api.css('.card:hover { transform: translateY(-2px); }');
}</code></pre>
      <p><code>api.setVar</code> 改变量，<code>api.css</code> 注入样式，<code>api.icon</code> 换图标。</p>
    </div>
  </div>

  <div class="callout">
    <b>会被拦下来的写法</b>：eval / new Function、fetch / XHR 等网络请求、读写 cookie 与 localStorage、
    跳转、监听键盘、往页面塞 script。外观只该碰样式，碰别的就不是外观了。
  </div>

  <h2 style="margin-top:40px">投什么</h2>
  <ol>
    <li>开 issue，标题以 <code>[投稿]</code> 开头，表单会问你作者、名称、简介、希望的分类，以及 js 内容。</li>
    <li>机器人回复一条审核结论：拦了什么、建议怎么改。改完直接编辑 issue，它会重审。</li>
    <li>维护者打 <code>approved</code> 标签并关闭 issue，文件就会写进 <code>appearance/</code>，CI 过了上线。</li>
  </ol>
  <p style="margin-top:26px">
    <a class="btn" href="${SITE.repo}/issues/new?template=theme-submission.yml">去开投稿 issue ${ICON.arrow}</a>
  </p>
  <p class="caption">开之前先读一遍 <a href="${SITE.repo}/blob/main/CONTRIBUTING.md">CONTRIBUTING.md</a>，能省一轮来回。</p>
</div>`;

write(
  'submit/index.html',
  page({
    title: '投稿',
    description: '怎么给水鱼文集外观库投稿：写一个 .js 主题，开 issue，自动审核 + 人工确认后进库。',
    path: '/submit/',
    body: submitBody,
    current: '/submit/',
    md: '/submit/index.md',
  }),
);
write(
  'submit/index.md',
  `# 投稿

外观就是一个 \`.js\` 文件，两种写法：一行一条的键值（主色 / 底色 / 字体 / 圆角…），或者定义 \`function theme(api)\`。

## 流程

1. 开 issue（标题以 \`[投稿]\` 开头），填作者、名称、简介、希望的分类，贴 js 内容
2. 机器人审核：静态规则 + AI 复审，结论写在 issue 里
3. 维护者打 \`approved\` 标签并关闭，文件写进 \`appearance/<分类>/<哈希>/\`

## 会被拦的写法

eval / new Function、网络请求、cookie 与 localStorage、跳转、监听键盘、往页面塞 script。

表单：${SITE.repo}/issues/new?template=theme-submission.yml
`,
);
route('/submit/', '0.6');

const aboutBody = `
<div class="wrap narrow doc">
  <p class="eyebrow">about</p>
  <h1>这是什么</h1>
  <p class="lede">
    水鱼文集的外观库。应用本身在 <a href="${SITE.app}" rel="noopener">另一个仓库</a>，
    这里只放外观：一堆 <code>.js</code> 文件、一个静态站点，和几条自动审核的流水线。
  </p>

  <div class="prose">
    <h2>为什么目录名是哈希</h2>
    <p>
      每个外观放在 <code>appearance/&lt;分类&gt;/&lt;哈希&gt;/</code>，哈希是文件内容 SHA-256 的前 12 位。
      好处是三件事：同一份内容永远同一个地址，改一个字符地址就变；重复投稿不会覆盖别人；
      下载链接不会因为有人重命名文件而失效。
    </p>
    <p>所以改主题请改文件名另存，不要改内容再指望地址不变。</p>

    <h2>审核是怎么跑的</h2>
    <p>投稿 issue 一打开，两个 Actions 就开始干活：</p>
    <ul>
      <li><b>静态规则</b>扫源码：动态执行、网络请求、存储访问、跳转、键盘监听，命中就拦。</li>
      <li><b>AI 复审</b>看语义：这段代码是不是只改外观，有没有夹带内容。用 GitHub Models，不需要额外密钥。</li>
      <li><b>人</b>最后看一眼，打 <code>approved</code> 关闭 issue，另一个工作流才写文件。</li>
    </ul>
    <p>也就是说：AI 说通过不等于收录，AI 说不行也不等于判死——维护者可以打 <code>skip-ai</code> 覆盖。</p>

    <h2>数据接口</h2>
    <ul>
      <li><a href="/api/themes.json">/api/themes.json</a>：全部外观的结构化数据</li>
      <li><a href="/sitemap.xml">/sitemap.xml</a>、<a href="/llms.txt">/llms.txt</a>：给爬虫和 agent 的入口</li>
      <li><code>Accept: text/markdown</code>：任意页面返回同路径的 markdown</li>
      <li><code>/.well-known/agent-skills/index.json</code>：一条安装技能，带 sha256 摘要</li>
    </ul>

    <h2>许可</h2>
    <p>
      站点代码和收录的外观都是 MIT。外观的著作权归各自作者；投稿即视为同意以 MIT 随本仓库分发。
      这里不承诺安全审计——静态规则和 AI 只看已知的危险写法。
    </p>
  </div>
</div>`;

write(
  'about/index.html',
  page({
    title: '关于',
    description: '水鱼文集外观库是什么、为什么用内容哈希命名、投稿是怎么审核的、有哪些机器可读接口。',
    path: '/about/',
    body: aboutBody,
    current: '/about/',
    md: '/about/index.md',
  }),
);
write(
  'about/index.md',
  `# 关于

水鱼文集的外观库。应用在 ${SITE.app}，这里只放外观：\`.js\` 文件、静态站点、几条自动审核的流水线。

## 为什么目录名是哈希

每个外观放在 \`appearance/<分类>/<哈希>/\`，哈希是内容 SHA-256 的前 12 位。同一份内容永远同一个地址，
改一个字符地址就变，重复投稿不会覆盖别人。

## 审核

1. 静态规则扫源码（动态执行、网络请求、存储、跳转、键盘监听）
2. GitHub Models 复审语义
3. 维护者打 \`approved\` 关闭 issue，才写文件

## 接口

- ${SITE.origin}/api/themes.json
- ${SITE.origin}/sitemap.xml 、/llms.txt
- \`Accept: text/markdown\` 返回同路径 markdown

## 许可

MIT。外观著作权归作者，投稿即同意以 MIT 分发。
`,
);
route('/about/', '0.5');

write(
  '404.html',
  page({
    title: '没有这一页',
    description: '这个地址没有对应的页面。',
    path: '/404.html',
    body: `<div class="wrap narrow nf"><p class="eyebrow">404</p><h1>没有这一页</h1>
<p>可能是外观改过内容，哈希变了，旧地址就失效了。回库里重新找一套。</p>
<a class="btn" href="/library/">去外观库 ${ICON.arrow}</a></div>`,
  }),
);

/* ---------------- 静态资源 ---------------- */

const assetsDir = path.join(ROOT, 'site', 'assets');
for (const f of fs.readdirSync(assetsDir)) {
  write(`assets/${f}`, fs.readFileSync(path.join(assetsDir, f)));
}
write('assets/frame.html', frameDocument());

/* ---------------- robots / sitemap / llms / api ---------------- */

write(
  'robots.txt',
  `# ${SITE.name}
# 库里的东西是给人用的，也欢迎 agent 读。
Content-Signal: search=yes, ai-train=yes, ai-input=yes

User-agent: *
Allow: /

# 常见 AI 抓取方，列出来省得它们猜
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
User-agent: Bytespider
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml
`,
);

write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${r.loc}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <priority>${r.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`,
);

write(
  'llms.txt',
  `# ${SITE.name}

> 水鱼文集是自托管的阅读应用，允许上传一个 .js 换掉整套界面外观。本站收集社区写好的主题，
> 每套一个按内容哈希命名的固定地址，下载 .js 后在应用里上传即可生效。

## 关键事实

- ${stats.total} 套外观，${stats.authors} 位作者，${stats.categories} 个分类
- 单个文件 ≤ 64 KB，纯 CSS 变量与样式，没有依赖
- 地址：/library/<12 位哈希>/，同目录下的 <哈希>.js 就是文件本身
- 文件名 = 应用里显示的主题名
- 许可 MIT，界面语言中文
- 「推荐」分类不开放投稿

## 分类

${categories.map((c) => `- ${c.name}（${counts[c.id] || 0} 套）：${SITE.origin}/library/c/${c.id}/ —— ${c.note}`).join('\n')}

## 全部外观

${themes.map((t) => `- ${t.name}（${t.categoryName} · ${t.author}）：${SITE.origin}${t.url} —— ${t.summary || '无简介'}`).join('\n')}

## 机器入口

- 结构化数据：${SITE.origin}/api/themes.json
- 站点地图：${SITE.origin}/sitemap.xml
- 抓取规则：${SITE.origin}/robots.txt
- 安装技能：${SITE.origin}/.well-known/agent-skills/index.json
- Markdown：请求带 \`Accept: text/markdown\` 返回同路径 .md；单套的 markdown 在 \`/library/<哈希>/index.md\`

## 别做

- 不要自动开投稿 issue（表单是给人填的）
- 不要把这些主题当成安全代码执行。静态规则只排除已知的危险写法，不是审计。
`,
);

write(
  'api/themes.json',
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      site: SITE.origin,
      repo: SITE.repo,
      license: 'MIT',
      limits: { maxBytes: 65536, maxThemesPerUser: 20 },
      install: '下载 src 指向的 js，在水鱼文集「外观 → 自定义主题」里上传；文件名会成为主题名。',
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        note: c.note,
        open: c.open,
        count: counts[c.id] || 0,
        url: `${SITE.origin}/library/c/${c.id}/`,
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
        date: t.date,
        palette: t.palette,
        page: SITE.origin + t.url,
        src: SITE.origin + t.file,
        markdown: `${SITE.origin}${t.url}index.md`,
      })),
    },
    null,
    2,
  ) + '\n',
);

wellKnown(
  'api-catalog',
  JSON.stringify(
    {
      linkset: [
        {
          anchor: `${SITE.origin}/api/themes.json`,
          'service-desc': [{ href: `${SITE.origin}/api/themes.json`, type: 'application/json' }],
          'service-doc': [{ href: `${SITE.origin}/llms.txt`, type: 'text/plain' }],
        },
      ],
    },
    null,
    2,
  ) + '\n',
);

/* Agent Skills：技能正文在 site/skills/ 下，构建时换域名、算摘要 */
const skillsDir = path.join(ROOT, 'site', 'skills');
const skills = [];
if (fs.existsSync(skillsDir)) {
  for (const slug of fs.readdirSync(skillsDir)) {
    const file = path.join(skillsDir, slug, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const text = normalize(fs.readFileSync(file, 'utf8')).replaceAll('{{ORIGIN}}', SITE.origin);
    const desc = /^description:\s*(.+)$/m.exec(text)?.[1]?.trim() || '';
    wellKnown(`agent-skills/${slug}/SKILL.md`, text);
    skills.push({
      name: slug,
      type: 'skill-md',
      description: desc,
      url: `${SITE.origin}/.well-known/agent-skills/${slug}/SKILL.md`,
      digest: 'sha256:' + createHash('sha256').update(text, 'utf8').digest('hex'),
    });
  }
}
wellKnown(
  'agent-skills/index.json',
  JSON.stringify({ $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json', skills }, null, 2) + '\n',
);

/* ---------------- 收尾 ---------------- */

const dirSize = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).reduce((n, e) => {
    const p = path.join(d, e.name);
    return n + (e.isDirectory() ? dirSize(p) : fs.statSync(p).size);
  }, 0);
const kb = Math.round(dirSize(DIST) / 1024);

console.log(`✓ 构建完成（${process.uptime().toFixed(1)}s）`);
console.log(`  ${stats.total} 套外观 · ${stats.categories} 个分类 · ${stats.authors} 位作者`);
console.log(`  sitemap ${routes.length} 条 · llms.txt · api/themes.json · robots.txt · agent-skills ${skills.length} 条`);
console.log(`  输出 site/dist（${kb} KB）`);
