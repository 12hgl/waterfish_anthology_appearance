/** 页面骨架、公共组件、内联图标。 */

export const SITE = {
  name: '水鱼文集 · 外观库',
  short: '外观库',
  tagline: '把界面调成你喜欢的样子',
  repo: 'https://github.com/12hgl/waterfish_anthology_appearance',
  app: 'https://waterfish.ren',
  blog: 'https://blog.waterfish.ren/article/4143794e-eb27-8071-91e6-fd1020829b3e',
  author: '12hgl',
};

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const FAVICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1F6C9F"/><path d="M9 9h9a3 3 0 0 1 3 3v11H12a3 3 0 0 1-3-3z" fill="#FBFAF7" opacity=".92"/><path d="M13 13h5M13 17h5" stroke="#1F6C9F" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  );

export const ICON = {
  arrow: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5"/></svg>',
  down: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v8M4.5 7.5 8 11l3.5-3.5M3 13h10"/></svg>',
  copy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V10"/></svg>',
  gh: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.4 7.4 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/></svg>',
};

const NAV_ITEMS = [
  ['/library/', '外观库'],
  ['/submit/', '投稿'],
  ['/about/', '关于'],
];

/** 完整页面。 */
export function page({ title, description, path, body, current = '', jsonLd = [], md = '', bodyAttrs = '' }) {
  const fullTitle = title ? `${title} · ${SITE.name}` : `${SITE.name}｜${SITE.tagline}`;
  const canonical = `${SITE.origin}${path}`;
  const nav = NAV_ITEMS.map(
    ([href, label]) =>
      `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`,
  ).join('');

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary">
<meta name="theme-color" content="#1F6C9F">
<link rel="icon" href="${FAVICON}">
<link rel="stylesheet" href="/assets/style.css">
${md ? `<link rel="alternate" type="text/markdown" href="${md}" title="Markdown 版本">` : ''}
${jsonLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body ${bodyAttrs}>
<a class="skip" href="#main">跳到正文</a>
<header class="topbar">
  <div class="wrap">
    <a class="brand" href="/"><span class="mark">文</span>水鱼文集<small>外观库</small></a>
    <nav class="nav">
      ${nav}
      <a class="ghost" href="${SITE.repo}" rel="noopener">GitHub</a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
${footer()}
<script src="/assets/app.js" defer></script>
</body>
</html>`;
}

export function footer() {
  return `<footer class="footer">
  <div class="wrap">
    <span>外观库是社区的外挂件，不是官方商店。</span>
    <span class="dot">·</span>
    <span><a href="${SITE.blog}" rel="noopener">主题怎么写</a></span>
    <span class="dot">·</span>
    <span><a href="${SITE.repo}/blob/main/CONTRIBUTING.md" rel="noopener">投稿说明</a></span>
    <span class="spacer"></span>
    <span>MIT · <a href="${SITE.app}" rel="noopener">水鱼之家</a> · <a href="/llms.txt">llms.txt</a></span>
  </div>
</footer>`;
}

/** 库里的一张卡：卡面用这套主题自己的颜色画几条线，不截图也能看出气质。 */
export function tcard(t) {
  const palette = t.palette || {};
  // 只改字体或只改动效的主题没有自己的主色，卡面长得一样，用一个字符点一下
  const glyph = palette.hasAccent ? '' : t.category === 'typography' ? '字' : t.category === 'motion' ? '≈' : '';
  return `<a class="tcard" href="${t.url}">
  <div class="swatch" style="background:${palette.paper || '#FBFAF7'};--sw-accent:${palette.accent || '#1F6C9F'}">
    <span class="sl t" style="background:${palette.ink || '#22201C'};opacity:.72"></span>
    <span class="sl a"></span>
    <span class="sl b" style="background:${palette.ink || '#22201C'}"></span>
    <span class="sl c" style="background:${palette.ink || '#22201C'}"></span>
    ${glyph ? `<span class="glyph">${glyph}</span>` : '<span class="chip"></span>'}
  </div>
  <div class="body">
    <h3>${esc(t.name)}</h3>
    <p class="sum">${esc(t.summary || '这位作者没写简介。')}</p>
    <div class="meta">
      <span class="tag">${esc(t.categoryName)}</span>
      <span>${esc(t.author)}</span>
      <span class="spacer"></span>
      <span>${(t.bytes / 1024).toFixed(1)}K</span>
    </div>
  </div>
</a>`;
}

export function catStrip(categories, counts, current = '') {
  const all = `<a href="/library/"${current === '' ? ' aria-current="page"' : ''}>全部 <b>${counts.total ?? ''}</b></a>`;
  const rest = categories
    .map(
      (c) =>
        `<a href="/library/c/${c.id}/"${current === c.id ? ' aria-current="page"' : ''}>${esc(c.name)} <b>${counts.byCategory[c.id] || 0}</b></a>`,
    )
    .join('');
  return `<div class="cat-strip">${all}${rest}</div>`;
}

/** 预览窗口。srcdoc 由 app.js 填，避免每页塞一整份文档。 */
export function previewShell({ id, name, hash, dark = false, frameHeight = '' }) {
  return `<div class="preview-shell">
  <div class="preview-bar">
    <span class="dots"><i></i><i></i><i></i></span>
    <span class="name">${esc(name)} ${hash ? '· ' + esc(hash.slice(0, 7)) : ''}</span>
    <span class="spacer"></span>
    <button type="button" data-mode="light" aria-pressed="${!dark}">浅色</button>
    <button type="button" data-mode="dark" aria-pressed="${dark}">深色</button>
  </div>
  <iframe class="preview-frame" id="${id}" data-preview="${id}" title="${esc(name)} 的界面预览" sandbox="allow-scripts" loading="lazy"${frameHeight ? ` style="height:${frameHeight}"` : ''}></iframe>
</div>`;
}
