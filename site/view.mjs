/** 页面骨架与几个重复出现的块。 */

export const SITE = {
  name: '水鱼文集 · 外观库',
  short: '外观库',
  tagline: '给同一堆字，换一张纸',
  origin: '',
  repo: 'https://github.com/12hgl/waterfish_anthology_appearance',
  app: 'https://github.com/12hgl/waterfish_anthology',
};

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#A63126"/><path d="M9 10h14M9 16h14M9 22h9" stroke="#F5F2E9" stroke-width="2.2" stroke-linecap="square"/></svg>',
  );

export const ICON = {
  arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8h10M9 4.5 12.5 8 9 11.5"/></svg>',
  down: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5v7M4.8 6.8 8 10l3.2-3.2M3 12.5h10"/></svg>',
  gh: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>',
};

const NAV = [
  ['/library/', '外观库'],
  ['/submit/', '投稿'],
  ['/about/', '关于'],
];

export function page({ title, description, path, body, current = '', jsonLd = [], md = '', frames = null }) {
  const full = title ? `${title} · ${SITE.name}` : `${SITE.name}｜${SITE.tagline}`;
  const canonical = SITE.origin + path;

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#F5F2E9">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/assets/site.css">
${md ? `<link rel="alternate" type="text/markdown" href="${md}" title="Markdown">` : ''}
${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#main">跳到正文</a>
<header class="bar">
  <div class="wrap">
    <a class="brand" href="/"><span class="mark">文</span>水鱼文集<small>外观库</small></a>
    <nav class="nav">
      ${NAV.map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
      <a class="ext" href="${SITE.repo}" rel="noopener">GitHub</a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
${footer()}
<script src="/assets/site.js" defer></script>
${frames ? `<script type="application/json" id="wf-frames">${JSON.stringify({ frames }).replace(/</g, '\\u003c')}</script>` : ''}
</body>
</html>`;
}

export function footer() {
  return `<footer class="foot">
  <div class="wrap">
    <span>社区维护，不是官方商店。外观代码由各自的作者负责。</span>
    <span class="sp"></span>
    <a href="${SITE.app}" rel="noopener">水鱼文集</a>
    <a href="${SITE.repo}/blob/main/CONTRIBUTING.md" rel="noopener">投稿说明</a>
    <a href="/llms.txt">llms.txt</a>
    <span>MIT</span>
  </div>
</footer>`;
}

/** 预览窗：外面这层带 data-shell，深色按钮、切换按钮都在里面找。 */
export function shot({ key, label, dark = false, height = '', extra = '' }) {
  return `<div class="shot-col" data-shell>
  <div class="shot">
    <div class="shot-bar">
      <span class="dots"><i></i><i></i><i></i></span>
      <span class="name">${esc(label)}</span>
      <span class="sp"></span>
      <button type="button" data-mode="light" aria-pressed="${!dark}">浅色</button>
      <button type="button" data-mode="dark" aria-pressed="${dark}">深色</button>
    </div>
    <iframe class="frame" data-frame="${key}" title="${esc(label)} 的界面预览" sandbox="allow-scripts" loading="lazy"${height ? ` style="height:${height}"` : ''}></iframe>
  </div>
  ${extra}
</div>`;
}

/** 列表里的一行。 */
export function themeRow(t, i) {
  const pal = t.palette || {};
  return `<a class="trow" href="${t.url}">
  <div class="l">
    <div class="nm">${esc(t.name)}</div>
    <div class="ds">${esc(t.summary || `${t.author} 写的一套 ${t.categoryName} 外观。`)}</div>
  </div>
  <div class="r">
    <span class="pal"><i style="background:${pal.paper}"></i><i style="background:${pal.accent}"></i><i style="background:${pal.ink}"></i></span>
    <span>${esc(t.author)}</span>
    <span>${(t.bytes / 1024).toFixed(1)}K</span>
    <span class="go">${ICON.arrow}</span>
  </div>
</a>`;
}

export function catNav(cats, counts, total, current) {
  return `<nav class="catnav" aria-label="分类">
  <div class="cn-h">分类</div>
  <a href="/library/"${current === '' ? ' aria-current="page"' : ''}>全部<em>${total}</em></a>
  ${cats
    .map(
      (c) =>
        `<a href="/library/c/${c.id}/"${current === c.id ? ' aria-current="page"' : ''}>${esc(c.name)}<em>${counts[c.id] || 0}</em></a>`,
    )
    .join('')}
  <p>按气质分，不是按功能。同一套外观可能两边都像，归到更像的那一类。</p>
</nav>`;
}

export function crumb(items) {
  return `<div class="crumbs">${items
    .map((it, i) => (it.href ? `<a href="${it.href}">${esc(it.text)}</a>` : `<span>${esc(it.text)}</span>`) + (i < items.length - 1 ? '<span>/</span>' : ''))
    .join('')}</div>`;
}
