/** 首页、外观库、分类页、详情页。 */
import { SITE, esc, page, tcard, catStrip, previewShell, ICON } from './layout.mjs';
import { renderMarkdown } from './md.mjs';

const n = (x) => String(x);

/* ------------------------------- 首页 ------------------------------- */

export function home(ctx) {
  const { themes, categories, stats } = ctx;
  const heroTheme = themes.find((t) => t.category === 'recommended') || themes[0];
  const switchSet = [
    heroTheme,
    ...themes.filter((t) => t.category === 'recommended' && t !== heroTheme).slice(0, 1),
    themes.find((t) => t.category === 'dark'),
    themes.find((t) => t.category === 'vivid'),
  ].filter(Boolean);

  const previews = {};
  switchSet.forEach((t, i) => {
    previews[`p${i}`] = { source: t.source, mode: t.mode, dark: t.mode === 'dark' };
  });

  const swButtons = switchSet
    .map(
      (t, i) => `<button type="button" data-key="p${i}" data-label="${esc(t.name)} · ${esc(t.author)}" data-dark="${t.mode === 'dark' ? '1' : '0'}" aria-pressed="${i === 0}">
      <span class="sw" style="--sw:${t.palette.accent}"></span>${esc(t.name)}
    </button>`,
    )
    .join('');

  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">水鱼文集 · 外观库</p>
      <h1>把界面，<br><span class="em">调成你喜欢的样子</span>。</h1>
      <p class="lede">
        水鱼文集是一个跑在自己 NAS 上的文集应用：书架、文章、标签、阅读进度，全在你自己手里。
        它允许你上传一个 <code>.js</code> 换掉整套界面——内置五套，剩下的 ${n(stats.total)} 套在这里，
        都是别人写好的。下载、上传、生效，没有插件市场，不用登录。
      </p>
      <div class="cta-row">
        <a class="btn btn-primary" href="/library/">逛逛外观库 ${ICON.arrow}</a>
        <a class="btn btn-quiet" href="/submit/">我也写了一套</a>
      </div>
      <div class="hero-stat">
        <div><b>${n(stats.total)}</b><span>套外观</span></div>
        <div><b>${n(categories.length)}</b><span>个分类</span></div>
        <div><b>64 KB</b><span>单文件上限</span></div>
        <div><b>0</b><span>依赖与跟踪</span></div>
      </div>
    </div>
    <div>
      ${previewShell({ id: 'p0', name: `${heroTheme.name} · ${heroTheme.author}`, hash: heroTheme.hash })}
      <div class="theme-switch" data-switcher>${swButtons}</div>
      <p class="preview-caption">
        <span>这个窗口是真的在跑这套主题，不是截图。书架是假的，CSS 变量是真的。</span>
      </p>
    </div>
  </div>
</section>

<section>
  <div class="wrap split">
    <div>
      <div class="sec-head">
        <span class="num">01</span>
        <h2>先说清楚它是什么</h2>
      </div>
      <div class="prose">
        <p>
          水鱼文集（Waterfish Anthology）是一个自托管的个人文集应用，跑在你自己的 NAS 上。
          你把书和文章放进去，它给你一个安静的书架：封面、作者、读到哪儿了，一屏看完。
        </p>
        <p>
          它不联网同步、不做推荐、不统计你读了几分钟。数据就在自己机器的目录里，
          备份就是拷一个文件夹，换机器就是搬过去。界面用什么字体、纸是什么颜色，
          也由你决定——内置五套，不够就自己写一套。
        </p>
        <p>
          主页在 <a href="${SITE.app}" rel="noopener">waterfish.ren</a>，
          外观系统怎么写，作者在
          <a href="${SITE.blog}" rel="noopener">这篇说明</a> 里讲得很细。
        </p>
      </div>
    </div>
    <div>
      <ul class="kv-list">
        <li><b>书架</b><span>卡片式陈列，封面、作者、进度一眼看到</span></li>
        <li><b>阅读</b><span>正文排版，衬线或圆体、字号大小都能调</span></li>
        <li><b>标签</b><span>按标签翻，不用记文件名</span></li>
        <li><b>深浅色</b><span>跟随系统或手动切，每套外观自带两套配色</span></li>
        <li><b>外观</b><span>五套内置加自定义 <code>.js</code>，就是下面这些</span></li>
        <li><b>数据</b><span>存在自己的 NAS 上，一个账号一份配置</span></li>
      </ul>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="num">02</span>
      <h2>库里都有些什么</h2>
      <p>按气质分，不按热度排。</p>
    </div>
    <div class="grid grid-cats">
      ${categories
        .map((c) => {
          const list = themes.filter((t) => t.category === c.id);
          const dots = list
            .slice(0, 4)
            .map((t) => `<span style="background:${t.palette.accent}"></span>`)
            .join('');
          return `<a class="catcard" href="/library/c/${c.id}/">
        <div class="catcard-top">
          <h3>${esc(c.name)}</h3>
          <span class="cnt">${list.length}</span>
        </div>
        <p>${esc(c.blurb)}</p>
        <div class="catcard-foot">
          <span class="swatches">${dots}</span>
          ${c.acceptsSubmissions ? '' : '<span class="lock">仅手动收录</span>'}
        </div>
      </a>`;
        })
        .join('')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="num">03</span>
      <h2>三步，二十秒</h2>
      <p>不需要命令行，不需要改配置文件。</p>
    </div>
    <div class="cols-3">
      <div class="step-card">
        <span class="n">STEP 1</span>
        <h3>挑一套</h3>
        <p>每套都有独立页面，能当场切浅色深色、看它在卡片和列表上的样子。别看缩略图，看真的。</p>
      </div>
      <div class="step-card">
        <span class="n">STEP 2</span>
        <h3>下载 .js</h3>
        <p>点「下载」，或者把代码复制走自己存成文件。<strong>文件名就是主题名</strong>，所以叫 <code>湖心纸.js</code> 比叫 <code>theme1.js</code> 好。</p>
      </div>
      <div class="step-card">
        <span class="n">STEP 3</span>
        <h3>上传</h3>
        <p>设置 → 外观 → 自定义主题 → 选择文件。卡片出现就生效了，立即保存，不用确认。最多存 20 个。</p>
      </div>
    </div>
    <p class="aside-note" style="margin-top:34px">
      想换回来？在抽屉里点「纸墨」就是内置外观。不想要了就悬停卡片，点右下角的 ✕，它带来的样式和图标会一起清干净。
    </p>
  </div>
</section>

<section>
  <div class="wrap split">
    <div>
      <div class="sec-head">
        <span class="num">04</span>
        <h2>它为什么不是一个配色表</h2>
      </div>
      <div class="prose">
        <p>
          一开始我也想只让人填几个颜色。但很快就不够了：有人希望卡片悬浮时抬起来一点，
          有人想把图标换成自己画的那套，有人觉得标题字距太挤、正文行高太松。这些都不是「颜色」，
          是样式和动效，用 JSON 填不出来。
        </p>
        <p>
          所以主题就是一个 JS 文件。你可以只写三行键值对（<code>主色: #1F6C9F</code>），
          也可以写一个 <code>function theme(api)</code>，拿到 <code>api</code> 之后调 CSS 变量、注入样式、换图标。
          两种写法在同一个文件里，客户端自己判断。
        </p>
        <p>
          每次应用主题前，客户端会先把上一次的东西全部清掉——变量回退、样式移除、图标还原。
          所以复杂主题每次都是从干净状态开始跑，不会越叠越乱；写错了也只是控制台报个错，界面退回内置外观，不会白屏。
        </p>
      </div>
    </div>
    <div>
      <p class="aside-note" style="margin-bottom:22px">
        主题只在你自己的浏览器里运行，跟着外观配置存在你的账号下。这点很重要，
        下一页会说我们怎么保证没人借这个入口干别的。
      </p>
      <ul class="kv-list">
        <li><b>api.setVar()</b><span>改根元素上的 CSS 变量，比如 <code>--accent</code>、<code>--r</code></span></li>
        <li><b>api.css()</b><span>注入一段 style，动效、字距、阴影都写在这里</span></li>
        <li><b>api.icon()</b><span>用 SVG path 覆盖内置图标，颜色跟随 <code>currentColor</code></span></li>
        <li><b>api.dark</b><span>当前是不是深色，可以写两套配色</span></li>
        <li><b>api.el</b><span>根节点，想查哪个元素都行——也是风险所在</span></li>
      </ul>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="num">05</span>
      <h2>怎么防止有人动手脚</h2>
      <p>说难听点：主题代码在你浏览器里的权限，和页面本身一样大。</p>
    </div>
    <div class="split">
      <div class="prose">
        <p>
          它跑在页面主世界（main world），能读 DOM、能发请求。所以这个库不能「谁都能直接 push」。
          投稿走 GitHub issue，收进来之前过三道：
        </p>
        <ol>
          <li>
            <strong>静态规则。</strong>一段代码里出现 <code>eval</code>、<code>new Function</code>、
            网络请求、读写 cookie 或 localStorage、动态插 script、改 location、监听键盘——
            任意一条，直接拒，不看别的。
          </li>
          <li>
            <strong>模型读一遍。</strong>规则只看关键词，看不出「把正文里的链接批量改掉」这种事。
            所以再让一个语言模型把代码读一遍，判断它到底想干什么。模型也会看错，所以它只给建议。
          </li>
          <li>
            <strong>我自己点。</strong>最后一步是人。我点「approved」再关 issue，
            机器人这时才会把文件写进仓库、生成页面。
          </li>
        </ol>
        <p>
          已经收录的也可能变坏——比如它引用了别人域名下的一张图，哪天那张图换成了别的东西。
          发现了就下架，不会因为「已经收了」就留着。
        </p>
      </div>
      <div>
        <ul class="kv-list">
          <li><b>会拒</b><span>eval / new Function / 动态 import / 任何网络请求</span></li>
          <li><b>会拒</b><span>读写 cookie、localStorage、sessionStorage</span></li>
          <li><b>会拒</b><span>改 location、开新窗口、postMessage、伪造表单</span></li>
          <li><b>会拒</b><span>外链脚本、长期轮询、键盘监听</span></li>
          <li><b>会看</b><span>非字体 CDN 的远程资源、超长 base64、不认识的键</span></li>
        </ul>
        <p style="font-size:13px;color:var(--ink-3);margin-top:14px">
          完整规则在仓库的 <a href="${SITE.repo}/blob/main/scripts/lib/rules.mjs" rel="noopener">scripts/lib/rules.mjs</a>，
          改了什么都能看到。
        </p>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="num">06</span>
      <h2>常被问到的</h2>
    </div>
    <div style="max-width:70ch">
      <details class="faq"><summary>会不会拖慢打开速度？</summary>
        <p>一个主题最多 64 KB，绝大多数只有几十行 CSS 变量。真正让页面变慢的是背景图——如果你挂了一张 2 MB 的图，慢的是那张图，不是主题。</p>
      </details>
      <details class="faq"><summary>能改布局吗？</summary>
        <p>技术上能。<code>api.el</code> 给你根节点，你可以在里面查任何元素、加类名。但类名会随版本变，写得越深越容易坏。库里大部分主题只动变量和表面样式，就是为了少坏。</p>
      </details>
      <details class="faq"><summary>主题存在哪？换设备还在吗？</summary>
        <p>存在你账号下的外观配置里，跟着账号走，换设备登录还在。卸载应用会一起清掉，所以删之前记得把 <code>.js</code> 留一份。</p>
      </details>
      <details class="faq"><summary>为什么「推荐」不能投稿？</summary>
        <p>那几套是我自己天天在用的，颜色改了几十遍才定下来。开放投稿它就会变成投票榜，我不想那样。看到合适的，我会主动去要。</p>
      </details>
      <details class="faq"><summary>收录之后还能撤吗？</summary>
        <p>能。你开个 issue 说一声，或者我发现行为不对，直接下架。下架不会删历史——文件还在 git 里，只是不再出现在列表。</p>
      </details>
      <details class="faq"><summary>我能直接提 PR 吗？</summary>
        <p>可以，但目录名必须是内容哈希，手算容易错。建议还是走 issue，机器人会算好。PR 走的校验和 issue 是同一套。</p>
      </details>
    </div>
  </div>
</section>

<section>
  <div class="wrap" style="text-align:center;padding:20px 0 10px">
    <h2 style="margin-bottom:12px">手上正好有一套管用的配色？</h2>
    <p class="lede" style="margin:0 auto 26px">交上来，写清楚它叫什么、你想要什么分类。审核完就是别人的一个下午。</p>
    <a class="btn btn-primary" href="/submit/">去投稿 ${ICON.arrow}</a>
  </div>
</section>

<script type="application/json" id="appearance-data">${jsonFor({ previews })}</script>
`;

  return page({
    title: '',
    description: `水鱼文集的外观库：${stats.total} 套社区投稿的主题，都是一个 .js 文件。挑一套，下载，上传，界面就变了。`,
    path: '/',
    body,
    current: '',
    md: '/index.md',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE.name,
        url: SITE.origin + '/',
        description: '水鱼文集的社区外观库，收录可上传的 .js 主题文件。',
        inLanguage: 'zh-CN',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE.origin}/library/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: '外观库',
        url: `${SITE.origin}/library/`,
        isPartOf: { '@type': 'WebSite', url: SITE.origin + '/' },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: stats.total,
          itemListElement: themes.slice(0, 20).map((t, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: t.name,
            url: SITE.origin + t.url,
          })),
        },
      },
    ],
  });
}

/* ------------------------------ 外观库 ------------------------------ */

export function library(ctx, { categoryId = null } = {}) {
  const { themes, categories, stats } = ctx;
  const cat = categoryId ? categories.find((c) => c.id === categoryId) : null;
  const list = cat ? themes.filter((t) => t.category === cat.id) : themes;

  const grouped = categories
    .map((c) => ({ c, items: list.filter((t) => t.category === c.id) }))
    .filter((g) => g.items.length);

  const body = `
<div class="wrap">
  <div class="detail-head">
    <p class="eyebrow">${cat ? '分类' : '全部外观'}</p>
    <h1>${cat ? esc(cat.name) : '外观库'}</h1>
    <p class="lede" style="margin-top:14px">
      ${
        cat
          ? esc(cat.blurb)
          : `${stats.total} 套，${stats.authors} 位作者。每套都是一个独立的 <code>.js</code> 文件，用完可以直接删。`
      }
    </p>
  </div>

  ${catStrip(categories, { total: stats.total, byCategory: stats.byCategory }, cat ? cat.id : '')}

  ${
    cat && !cat.acceptsSubmissions
      ? `<div class="cat-intro">
      <div>
        <h2>这个分类只接受手动收录</h2>
        <p>「${esc(cat.name)}」里的每一套都是维护者自己长期在用、反复调过的，不接受投稿。看到合适的会主动去要。</p>
      </div>
      <span class="locked">不接受投稿</span>
    </div>`
      : ''
  }

  ${
    grouped.length === 0
      ? '<p class="lede">这一类现在还是空的。要不要做第一个？</p>'
      : cat
        ? `<div class="grid">${list.map(tcard).join('')}</div>`
        : grouped
            .map(
              (g) => `<div style="margin-bottom:46px">
      <div class="sec-head" style="margin-bottom:18px">
        <h2 style="font-size:22px"><a href="/library/c/${g.c.id}/" style="text-decoration:none;color:inherit">${esc(g.c.name)}</a></h2>
        <p>${esc(g.c.blurb)}</p>
      </div>
      <div class="grid">${g.items.map(tcard).join('')}</div>
    </div>`,
            )
            .join('')
  }

  <div class="prev-next" style="border-top:1px solid var(--line);margin-top:10px">
    <span style="color:var(--ink-3);font-size:13px">
      一共 ${list.length} 套。想看某个分类的全部，点上面的分类条。
    </span>
    <a href="/submit/"><small>没有你想要的？</small>自己写一套 →</a>
  </div>
</div>
`;

  return page({
    title: cat ? `${cat.name}类外观` : '外观库',
    description: cat
      ? `水鱼文集外观库的「${cat.name}」分类，共 ${list.length} 套可下载的 .js 主题。${cat.blurb}`
      : `水鱼文集外观库全部 ${stats.total} 套主题，按 ${categories.length} 个分类整理，每套都能直接下载 .js 上传使用。`,
    path: cat ? `/library/c/${cat.id}/` : '/library/',
    body,
    current: '/library/',
    md: cat ? `/library/c/${cat.id}/index.md` : '/library/index.md',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: cat ? `${cat.name}类外观` : '外观库',
        url: `${SITE.origin}${cat ? `/library/c/${cat.id}/` : '/library/'}`,
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
  });
}

/* ------------------------------ 详情页 ------------------------------ */

export function themePage(ctx, theme, prev, next) {
  const { themes, categories } = ctx;
  const cat = categories.find((c) => c.id === theme.category);
  const body = `
<div class="wrap">
  <div class="crumb">
    <a href="/library/">外观库</a><span>/</span>
    <a href="/library/c/${theme.category}/">${esc(cat.name)}</a><span>/</span>
    <span style="opacity:.75">${esc(theme.name)}</span>
  </div>

  <div class="detail-head">
    <div class="detail-title">
      <div>
        <h1>${esc(theme.name)}</h1>
        <p class="by" style="margin:12px 0 0">
          ${esc(theme.author)} · ${esc(cat.name)} · ${theme.bytes ? (theme.bytes / 1024).toFixed(1) + ' KB' : ''}
          ${theme.created ? ` · ${esc(theme.created)}` : ''}
        </p>
      </div>
      <a class="btn btn-quiet" href="/library/${theme.hash}/${theme.hash}.js" download="${esc(theme.name)}.js">
        ${ICON.down} 下载 .js
      </a>
    </div>
    ${theme.summary ? `<p class="lede" style="margin-top:18px">${esc(theme.summary)}</p>` : ''}
  </div>

  <div class="detail-grid">
    <div>
      ${previewShell({ id: 'p-theme', name: `${theme.name} · ${theme.author}`, hash: theme.hash, dark: theme.mode === 'dark' })}
      <p class="preview-caption">
        <span>点右上角切浅色/深色。窗口里是仿真的书架，类名和 CSS 变量跟应用里一致。</span>
      </p>

      <div class="prose" style="margin-top:38px">
        ${renderSections(theme)}
      </div>
    </div>

    <aside>
      <dl class="spec">
        <div><dt>作者</dt><dd><a href="https://github.com/${esc(theme.author)}" rel="noopener">@${esc(theme.author)}</a></dd></div>
        <div><dt>分类</dt><dd>${esc(cat.name)}</dd></div>
        <div><dt>哈希</dt><dd>${esc(theme.hash)}</dd></div>
        <div><dt>写法</dt><dd>${theme.syntax === 'complex' ? 'function theme(api)' : '键值对'}</dd></div>
        <div><dt>体积</dt><dd>${(theme.bytes / 1024).toFixed(1)} KB</dd></div>
        <div><dt>适配</dt><dd>${theme.mode === 'dark' ? '深色为主' : theme.mode === 'light' ? '浅色为主' : '深浅都有'}</dd></div>
      </dl>

      <div class="side-block">
        <h4>怎么装上</h4>
        <ol class="steps">
          <li>下载右边的 <code>.js</code> 文件</li>
          <li>打开水鱼文集 → 设置 → 外观</li>
          <li>自定义主题 → 选择文件</li>
          <li>列表里出现「${esc(theme.name)}」就生效了</li>
        </ol>
      </div>

      <div class="side-block">
        <h4>源码</h4>
        <div class="code-block">
          <div class="code-head">
            <span>${theme.hash}.js</span>
            <span class="spacer"></span>
            <button type="button" data-copy="#src-${theme.hash}">复制</button>
          </div>
          <pre id="src-${theme.hash}" style="max-height:340px"><code>${esc(theme.source)}</code></pre>
        </div>
      </div>

      <div class="side-block">
        <p style="font-size:12.5px;color:var(--ink-3);line-height:1.7">
          目录名就是文件内容的 SHA-256 前 12 位。改一个字符，哈希就变，
          所以这里的东西不会被悄悄替换——你下载过的永远是那一份。
        </p>
        <p style="font-size:12.5px;color:var(--ink-3);line-height:1.7;margin-top:10px">
          <a href="${SITE.repo}/tree/main/${theme.path}" rel="noopener">在 GitHub 上看这个目录</a>
        </p>
      </div>
    </aside>
  </div>

  <div class="prev-next">
    ${prev ? `<a href="${prev.url}"><small>上一个</small>← ${esc(prev.name)}</a>` : '<span></span>'}
    ${
      next
        ? `<a href="${next.url}" style="text-align:right"><small>下一个</small>${esc(next.name)} →</a>`
        : '<span></span>'
    }
  </div>
</div>

<script type="application/json" id="appearance-data">${jsonFor({
    previews: { 'p-theme': { source: theme.source, mode: theme.mode, dark: theme.mode === 'dark' } },
  })}</script>
`;

  return page({
    title: `${theme.name} · ${cat.name}`,
    description: `${theme.name}，${theme.author} 投稿的水鱼文集外观。${theme.summary} 哈希 ${theme.hash}，${(theme.bytes / 1024).toFixed(1)} KB，可直接下载 .js 上传使用。`,
    path: theme.url,
    body,
    current: '/library/',
    md: `/library/${theme.hash}/index.md`,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: theme.name,
        description: theme.summary,
        url: SITE.origin + theme.url,
        identifier: theme.hash,
        genre: cat.name,
        author: { '@type': 'Person', name: theme.author, url: `https://github.com/${theme.author}` },
        license: 'https://opensource.org/licenses/MIT',
        encodingFormat: 'text/javascript',
        isPartOf: { '@type': 'CollectionPage', name: '水鱼文集外观库', url: `${SITE.origin}/library/` },
        dateCreated: theme.created || undefined,
        keywords: [cat.name, '水鱼文集', '外观', '主题', theme.syntax === 'complex' ? 'JS 主题脚本' : 'CSS 变量'],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '外观库', item: `${SITE.origin}/library/` },
          { '@type': 'ListItem', position: 2, name: cat.name, item: `${SITE.origin}/library/c/${cat.id}/` },
          { '@type': 'ListItem', position: 3, name: theme.name, item: SITE.origin + theme.url },
        ],
      },
    ],
  });
}

/** 从 README 里挑出「改了什么」和「备注」两段，别把安装步骤和整段源码重复贴一遍。 */
function renderSections(theme) {
  const md = theme.readme || '';
  const blocks = md.split(/^##\s+/m);
  const pick = (name) => {
    const hit = blocks.find((b) => b.trim().startsWith(name));
    return hit ? hit.replace(new RegExp('^' + name + '\\s*\\n'), '').trim() : '';
  };
  const changed = pick('改了什么');
  const note = pick('备注');
  const parts = [];
  if (changed) parts.push('<h2>改了什么</h2>' + renderMarkdown(changed));
  if (note) parts.push('<h2>作者的话</h2>' + renderMarkdown(note));
  if (!parts.length) parts.push('<p>这套外观没写说明。</p>');
  return parts.join('\n');
}

function jsonFor(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}
