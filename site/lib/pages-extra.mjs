/** 关于、投稿、404，以及给 agent 读的 markdown 版本。 */
import { SITE, esc, page, ICON } from './layout.mjs';

const NEW_ISSUE = `${SITE.repo}/issues/new?template=theme-submission.yml&title=%5B%E6%8A%95%E7%A8%BF%5D%20`;

export function about(ctx) {
  const { stats, categories } = ctx;
  const body = `
<div class="wrap">
  <div class="detail-head">
    <p class="eyebrow">关于</p>
    <h1>一个外挂件</h1>
    <p class="lede" style="margin-top:16px">
      这个站是 <a href="${SITE.app}" rel="noopener">水鱼文集</a> 的外观库。它不是官方的一部分，
      是我（${esc(SITE.author)}）自己维护的一个外挂仓库，用 Vercel 挂在网上。
    </p>
  </div>

  <div class="split" style="padding-bottom:20px">
    <div class="prose">
      <h2>它是什么</h2>
      <p>
        水鱼文集允许你上传 <code>.js</code> 文件自定义外观。这个库把大家写好的那些收集起来，
        按气质分类，给每套一个固定地址，谁都能下载。
      </p>
      <p>
        现在有 <strong>${stats.total}</strong> 套，分在 ${categories.length} 个分类里，
        来自 ${stats.authors} 位作者。平均一份不到 1 KB。
      </p>

      <h2>它不是什么</h2>
      <ul>
        <li><strong>不是商店。</strong>没有账号、没有评分、没有「下载量」。</li>
        <li><strong>不是排行榜。</strong>顺序是分类 + 名称，不按热度。热门会自我强化，我不想让库变成那样。</li>
        <li><strong>不是无门槛。</strong>主题代码在页面主世界跑，投稿要过审核，见下。</li>
        <li><strong>不收集你。</strong>这个站没有任何分析脚本、没有 cookie、没有第三方字体。你要是不信，看源码。</li>
      </ul>

      <h2>审核标准</h2>
      <p>硬性（命中就拒，不改就不收）：</p>
      <ul>
        <li>出现 <code>eval</code>、<code>new Function</code>、动态 <code>import()</code>、动态插入 script</li>
        <li>任何形式的网络请求（fetch / XHR / WebSocket / sendBeacon / 加载远程脚本）</li>
        <li>读写 cookie、localStorage、sessionStorage、indexedDB</li>
        <li>修改 <code>location</code>、打开新窗口、向其它窗口 postMessage、构造或提交表单</li>
        <li>监听键盘 / 输入事件，或往页面里插 iframe</li>
        <li>包含色情、赌博、诈骗、引流广告，或硬编码联系方式</li>
      </ul>
      <p>软性（会看完再决定）：</p>
      <ul>
        <li>引用了外部域名——背景图通常可以，字体 CDN 会看是哪家，脚本一律不行</li>
        <li>很长的 base64 段、看不懂的压缩代码</li>
        <li>用 <code>!important</code> 大面积覆盖、删节点，可能弄坏应用本身</li>
        <li>只改了颜色却自称「动效」，或者反过来——不影响收录，但会让我犹豫</li>
      </ul>

      <h2>为什么用哈希当目录名</h2>
      <p>
        目录名是文件内容 SHA-256 的前 12 位，算法写在
        <a href="${SITE.repo}/blob/main/scripts/lib/shared.mjs" rel="noopener">scripts/lib/shared.mjs</a>。
        这么做有三个原因：
      </p>
      <ol>
        <li>内容一样就是同一套，重复投稿会被自动识别，不会出现两个一模一样的「湖心纸」。</li>
        <li>内容变了就是另一套，地址跟着变。你下载过的那个地址，永远指向你下载时的那份代码。</li>
        <li>不需要维护一张「ID → 文件」的表，仓库本身就是索引，删掉文件就等于下架。</li>
      </ol>
      <p>代价是名字不好看，也没法给一套外观改个文件名就完事——所以页面上显示的是中文名，哈希只出现在地址栏和文件里。</p>

      <h2>许可</h2>
      <p>
        仓库和其中的主题都是 MIT。你可以拿走、改、再发，包括商用，只要保留版权声明。
        投稿即视为同意以 MIT 分发——这条写在投稿表单里，要点勾才能提交。
      </p>

      <h2>发现问题</h2>
      <p>
        某套外观行为不对、页面打不开、或者你觉得审核太松/太严，都可以
        <a href="${SITE.repo}/issues/new" rel="noopener">开 issue</a> 说。
        涉及安全的，直接在 issue 标题里写「安全」，我会先下架再讨论。
      </p>
    </div>

    <aside>
      <dl class="spec">
        <div><dt>维护者</dt><dd>${esc(SITE.author)}</dd></div>
        <div><dt>仓库</dt><dd><a href="${SITE.repo}" rel="noopener">GitHub</a></dd></div>
        <div><dt>站点</dt><dd>Vercel 静态构建</dd></div>
        <div><dt>主题数</dt><dd>${stats.total}</dd></div>
        <div><dt>依赖</dt><dd>0</dd></div>
        <div><dt>许可</dt><dd>MIT</dd></div>
      </dl>
      <div class="side-block">
        <h4>相关</h4>
        <ul class="kv-list" style="font-size:13px">
          <li><b>怎么写</b><span><a href="${SITE.blog}" rel="noopener">主题定制说明</a></span></li>
          <li><b>投稿</b><span><a href="/submit/">投稿页</a></span></li>
          <li><b>给 agent</b><span><a href="/llms.txt">llms.txt</a></span></li>
        </ul>
      </div>
    </aside>
  </div>
</div>
`;
  return page({
    title: '关于',
    description: '水鱼文集外观库的由来、审核标准、哈希命名规则与许可说明。这个库是社区外挂件，不是官方商店。',
    path: '/about/',
    body,
    current: '/about/',
    md: '/about/index.md',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: '关于水鱼文集外观库',
        url: `${SITE.origin}/about/`,
        inLanguage: 'zh-CN',
      },
    ],
  });
}

export function submit(ctx) {
  const body = `
<div class="wrap">
  <div class="detail-head">
    <p class="eyebrow">投稿</p>
    <h1>把你的那套交上来</h1>
    <p class="lede" style="margin-top:16px">
      走 GitHub issue，一个表单，四个必填项。审核过了会自动进库、自动生成页面，不用你手动建目录。
    </p>
    <div class="cta-row">
      <a class="btn btn-primary" href="${NEW_ISSUE}" rel="noopener">开投稿 issue ${ICON.arrow}</a>
      <a class="btn btn-quiet" href="${SITE.repo}/blob/main/CONTRIBUTING.md" rel="noopener">先看投稿说明</a>
    </div>
  </div>

  <div class="split" style="padding-bottom:10px">
    <div class="prose">
      <h2>表单里要填什么</h2>
      <ul>
        <li><strong>作者</strong>——你的 GitHub 用户名，会署在页面和 README 上</li>
        <li><strong>名称</strong>——2 到 8 个字，别人在卡片上看到的就是它</li>
        <li><strong>简介</strong>——一句话，说清它什么感觉。可选，但强烈建议写，没简介的卡片看起来很可怜</li>
        <li><strong>希望分类</strong>——只是意向，最终归类我来定。注意「推荐」不开放</li>
        <li><strong>JS 内容</strong>——用 <code>\`\`\`js</code> 代码块包住贴进来；超过 40 KB 就贴 raw 链接</li>
      </ul>

      <h2>最小可用的一套</h2>
      <p>三行就够了，其余全部沿用内置的「纸墨」：</p>
      <div class="code-block">
        <div class="code-head"><span>三行的例子</span><span class="spacer"></span><button type="button" data-copy="#min-src">复制</button></div>
        <pre id="min-src"><code>// 暖色阅读
主色: #8C5A2B
底色: #F7F1E6
圆角: 12</code></pre>
      </div>

      <h2>想动更多？用脚本写法</h2>
      <p>文件里定义了 <code>function theme(api)</code> 就按脚本执行。能调变量、注入样式、换图标：</p>
      <div class="code-block">
        <div class="code-head"><span>脚本写法</span><span class="spacer"></span><button type="button" data-copy="#fn-src">复制</button></div>
        <pre id="fn-src"><code>function theme(api) {
  api.setVar('--accent', '#7C5CFF');
  api.setVar('--r', '14px');

  api.css(\`
    .card { transition: transform .25s ease; }
    .card:hover { transform: translateY(-2px); }
  \`);

  api.icon('book', '&lt;path d="M4 5h16v14H4z"/&gt;');
}</code></pre>
      </div>

      <h2>会被直接拒的写法</h2>
      <p>不是审美问题，是安全问题。命中任意一条，自动审核就挂了，改完再关一次 issue 会重审：</p>
      <ul>
        <li><code>eval()</code>、<code>new Function()</code> 动态执行</li>
        <li><code>fetch()</code> / <code>XMLHttpRequest</code> / <code>new Image()</code> 上报数据</li>
        <li>读写 <code>document.cookie</code>、<code>localStorage</code></li>
        <li>动态插入 <code>&lt;script&gt;</code>、iframe</li>
        <li>改 <code>location</code>、<code>window.open</code>、<code>postMessage</code></li>
        <li>监听 <code>keydown</code> / <code>input</code> 之类的输入事件</li>
        <li>从不明域名加载脚本或样式</li>
      </ul>

      <h2>审核大概多久</h2>
      <p>
        机器人几分钟内会回一条评论，列出规则命中的项和模型读完之后的意见。之后等我点——
        快的时候当天，慢的时候一周。收进库之后你会收到一条评论，里面是文件路径和页面地址。
      </p>

      <h2>想提 PR 也行</h2>
      <p>
        目录名必须是内容哈希，自己手算容易错。真要提，先本地跑
        <code>node scripts/validate-all.mjs</code>，PR 上会跑同一套校验。
        更省事的办法还是走 issue，机器人会把哈希算好、目录建好。
      </p>
    </div>

    <aside>
      <div class="side-block" style="margin-top:0">
        <h4>支持的键（简单写法）</h4>
        <dl class="spec">
          <div><dt>主色 / accent</dt><dd>强调色</dd></div>
          <div><dt>副色 / accent2</dt><dd>次级强调</dd></div>
          <div><dt>背景 / bg</dt><dd>图片地址或颜色</dd></div>
          <div><dt>字体 / font</dt><dd>serif / round / mono</dd></div>
          <div><dt>文字 / ink</dt><dd>正文色</dd></div>
          <div><dt>底色 / paper</dt><dd>纸面色</dd></div>
          <div><dt>圆角 / radius</dt><dd>0–40</dd></div>
        </dl>
      </div>
      <div class="side-block">
        <h4>限制</h4>
        <ul class="kv-list" style="font-size:13px">
          <li><b>体积</b><span>单文件 ≤ 64 KB，超出截断</span></li>
          <li><b>数量</b><span>每人最多存 20 个自定义主题</span></li>
          <li><b>命名</b><span>主题名取自文件名</span></li>
          <li><b>清理</b><span>切走主题时样式自动移除</span></li>
        </ul>
      </div>
      <p class="aside-note" style="margin-top:24px">
        投稿即视为你同意这套外观以 MIT 协议随仓库一起分发。
      </p>
    </aside>
  </div>
</div>
`;
  return page({
    title: '投稿',
    description: '向水鱼文集外观库投稿你的主题：把 .js 内容贴进 GitHub issue，通过自动审核和人工确认后收录。',
    path: '/submit/',
    body,
    current: '/submit/',
    md: '/submit/index.md',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: '投稿外观',
        url: `${SITE.origin}/submit/`,
        inLanguage: 'zh-CN',
      },
    ],
  });
}

export function notFound(ctx) {
  const body = `
<div class="wrap" style="padding:90px 0 110px;text-align:center">
  <p class="eyebrow center">404</p>
  <h1>这里没有外观</h1>
  <p class="lede" style="margin:18px auto 30px">
    地址错了，或者这套外观已经下架。哈希是按内容算的，作者改了代码，
    旧地址就指向不存在的东西了。
  </p>
  <div class="cta-row" style="justify-content:center">
    <a class="btn btn-primary" href="/library/">去外观库看看</a>
    <a class="btn btn-quiet" href="/">回首页</a>
  </div>
</div>
`;
  return page({
    title: '404',
    description: '这个地址下没有外观。',
    path: '/404.html',
    body,
  });
}

/* ------------------------- markdown 版本（给 agent） ------------------------- */

export function homeMd(ctx) {
  const { themes, categories, stats } = ctx;
  return `# 水鱼文集 · 外观库

> ${SITE.origin}/ · Markdown 版本，供 AI agent 与纯文本客户端阅读。HTML 版本内容更全。

水鱼文集（Waterfish Anthology）是一个自托管的个人阅读应用。它能从设置里上传 \`.js\` 文件自定义界面外观。
这个站收集社区写好的那些主题，按分类整理，每套一个固定地址，可直接下载。

- 主题总数：${stats.total}
- 分类：${categories.map((c) => `${c.name}（${c.id}）`).length} 个
- 单文件上限：64 KB
- 许可：MIT

## 分类

${categories.map((c) => `- **${c.name}**（\`${c.id}\`）：${c.blurb}${c.acceptsSubmissions ? '' : '（仅维护者手动收录，不接受投稿）'}`).join('\n')}

## 怎么用

1. 在 \`${SITE.origin}/library/\` 挑一套
2. 下载该页面的 \`<hash>.js\`
3. 水鱼文集 → 设置 → 外观 → 自定义主题 → 选择文件

## 全部外观

${themes.map((t) => `- [${t.name}](${SITE.origin}${t.url}) — ${t.categoryName} · ${t.author} · ${t.summary}`).join('\n')}

## 机器可读入口

- 列表 JSON：\`${SITE.origin}/api/themes.json\`
- 站点地图：\`${SITE.origin}/sitemap.xml\`
- 抓取规则：\`${SITE.origin}/robots.txt\`
- 投稿：GitHub issue，模板见 \`${SITE.repo}/issues/new\`
`;
}

export function libraryMd(ctx, categoryId = null) {
  const { themes, categories, stats } = ctx;
  const cat = categoryId ? categories.find((c) => c.id === categoryId) : null;
  const list = cat ? themes.filter((t) => t.category === cat.id) : themes;
  return `# ${cat ? `${cat.name}类外观` : '外观库'}

${cat ? cat.blurb : `水鱼文集外观库全部 ${stats.total} 套主题。`}

共 ${list.length} 套。

${list
  .map(
    (t) =>
      `## ${t.name}\n\n- 地址：${SITE.origin}${t.url}\n- 文件：${SITE.origin}/library/${t.hash}/${t.hash}.js\n- 作者：${t.author}\n- 分类：${t.categoryName}\n- 哈希：\`${t.hash}\`\n- 写法：${t.syntax === 'complex' ? '\`function theme(api)\`' : '键值对'}\n- 体积：${(t.bytes / 1024).toFixed(1)} KB\n\n${t.summary}\n`,
  )
  .join('\n')}`;
}

export function themeMd(theme) {
  return `# ${theme.name}

- 地址：${SITE.origin}${theme.url}
- 作者：${theme.author}
- 分类：${theme.categoryName}
- 哈希：\`${theme.hash}\`
- 写法：${theme.syntax === 'complex' ? '\`function theme(api)\`' : '键值对'}
- 体积：${(theme.bytes / 1024).toFixed(1)} KB
- 下载：${SITE.origin}/library/${theme.hash}/${theme.hash}.js
- 许可：MIT

${theme.summary}

## 说明

${theme.readme}

## 源码

\`\`\`js
${theme.source.replace(/\n$/, '')}
\`\`\`
`;
}

export function aboutMd(ctx) {
  return `# 关于水鱼文集外观库

这个站是水鱼文集的外观库，由 ${SITE.author} 维护，是社区外挂件，不属于官方。

## 它是什么

收集社区写好的主题 \`.js\` 文件，按气质分类，每套一个固定地址。

## 它不是什么

不是商店（没有账号、评分、下载量）、不是排行榜（顺序是分类 + 名称）、不收集访问数据（没有分析脚本、没有 cookie）。

## 审核标准

硬性拒绝：\`eval\` / \`new Function\` / 动态 import、任何网络请求、读写 cookie 与 storage、
修改 location、window.open、postMessage、构造表单、监听键盘输入、动态插入 script 或 iframe。

软性判断：外部域名引用（背景图可以，脚本不行）、超长 base64、大面积 \`!important\` 覆盖。

## 哈希命名

目录名是文件内容 SHA-256 的前 12 位。内容相同即同一套（去重），内容变化即新地址（下载过的地址永不改变），
仓库本身即索引（删文件即下架）。

## 许可

仓库与全部主题为 MIT。
`;
}

export function submitMd() {
  return `# 投稿

向外观库投稿一套主题。

## 流程

1. 在 ${SITE.repo}/issues/new 选择「投稿一套外观」模板
2. 填写：作者、名称、简介（可选）、希望分类（可选）、JS 内容（\`\`\`js 代码块或 raw 链接）
3. 机器人自动审核：静态规则 + 语言模型复审，结论作为评论回帖
4. 维护者确认后打 \`approved\` 标签并关闭 issue，机器人把文件写进 \`appearance/<分类>/<哈希>/\` 并生成页面

## 简单写法

\`\`\`
主色: #8C5A2B
底色: #F7F1E6
圆角: 12
\`\`\`

支持的键：主色/accent、副色/accent2、背景/bg、字体/font、文字/ink、底色/paper、圆角/radius。

## 脚本写法

\`\`\`js
function theme(api) {
  api.setVar('--accent', '#7C5CFF');
  api.css('.card:hover { transform: translateY(-2px); }');
  api.icon('book', '<path d="M4 5h16v14H4z"/>');
}
\`\`\`

可用 API：\`api.setVar(name, value)\`、\`api.css(text)\`、\`api.icon(name, svg)\`、\`api.el\`、\`api.dark\`、\`api.vars(name)\`。

## 会被拒的写法

\`eval\`、\`new Function\`、动态 import、fetch/XHR/WebSocket、读写 cookie 与 localStorage、
修改 location、window.open、postMessage、构造表单、监听键盘输入、从不明域名加载脚本。

## 限制

单文件 ≤ 64 KB；每人最多 20 个自定义主题；主题名取自文件名。
`;
}

export function notFoundMd() {
  return `# 404

这个地址下没有外观。哈希按内容计算，作者改了代码，旧地址就失效了。

去外观库：${SITE.origin}/library/
`;
}
