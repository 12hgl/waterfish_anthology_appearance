# 投稿说明

写给想放一套外观进来的人。

## 先说清楚风险

主题是一个 `.js` 文件，会在**别人的浏览器里、页面主世界**执行。它和页面本身权限一样大：
能读 DOM、能发请求、能改页面上的任何东西。

这意味着两件事：

- 我不会乱收。每套都要过静态规则和模型复审，最后我自己再看一眼。
- 你别写奇怪的东西。不是怕被拒，是这种东西本来就不该出现在「换个颜色」的场景里。

## 它能改什么

一句话：**改样子，不改内容**。

能改：颜色、字体、字号、圆角、间距、阴影、背景、动效、图标、深浅两套配色。
不该改：页面上的文字、链接指向、用户数据、任何会发出去的东西。

## 两种写法

### 简单写法：只改几个键

一行一条，只写想改的，其余全部沿用内置的「纸墨」：

```js
// 护眼米色
主色: #8C5A2B
副色: #B45309
底色: #F7F1E6
圆角: 12
```

| 键 | 作用 | 取值 |
| --- | --- | --- |
| `主色` / `accent` | 强调色：图标、链接、选中态、按钮 | 颜色 |
| `副色` / `accent2` | 次级强调 + 页面淡彩 | 颜色 |
| `背景` / `bg` | 背景图，或直接当纸面色 | 图片地址或颜色 |
| `字体` / `font` | 正文字体 | `serif` / `round` / `mono` / `system`，或字体名 |
| `文字` / `ink` | 正文文字色 | 颜色 |
| `底色` / `paper` | 纸面底色 | 颜色 |
| `圆角` / `radius` | 卡片与控件圆角 | `0`–`40` |

三种写法都认：`主色: #1F6C9F`、`主色 = #1F6C9F`、`主色 #1F6C9F`。
`//` 或 `#` 开头的行是注释。

写错的键会被跳过（不会整份失效），但审核时会提醒你哪一行不认识。

### 脚本写法：需要动样式和动效时

文件里定义 `function theme(api)`，客户端检测到就按脚本执行：

```js
function theme(api) {
  const dark = api.dark;

  api.setVar('--paper', dark ? '#141110' : '#FBF5E8');
  api.setVar('--accent', dark ? '#E0A458' : '#B4700F');

  api.css(`
    .card { transition: transform .22s ease; }
    .card:hover { transform: translateY(-2px); }
  `);

  api.icon('book', '<path d="M4 5.5A2 2 0 0 1 6 3.5h13v17H6A2 2 0 0 0 4 22.5z"/>');
}
```

| API | 作用 |
| --- | --- |
| `api.setVar(name, value)` | 设置根元素 CSS 变量，`name` 必须以 `--` 开头 |
| `api.css(text)` | 注入一段 `<style>`，切主题时自动移除 |
| `api.icon(name, svg)` | 覆盖内置图标，颜色跟随 `currentColor` |
| `api.el` | 根元素，可以查任何节点——**也是风险所在** |
| `api.dark` | 当前是否深色，可写两套配色 |
| `api.vars(name)` | 读某个 CSS 变量的当前值 |

常用的 CSS 变量：`--paper`、`--surface` / `--surface-2` / `--surface-3`、`--line`、`--ink` / `--ink-2` / `--ink-3`、
`--accent` / `--accent-ink` / `--accent-soft` / `--accent-line`、`--btn-bg` / `--btn-ink`、`--r-sm` / `--r` / `--r-lg`、
`--serif` / `--sans` / `--mono`。

### 加动效时注意

- 位移别超过 3px，列表滚动时会晕；
- 一定要写 `@media (prefers-reduced-motion: reduce)` 的降级；
- 别给按钮加循环动画，会让人不敢点。

## 怎么交

1. 打开 [投稿 issue](https://github.com/12hgl/waterfish_anthology_appearance/issues/new?template=theme-submission.yml)；
2. 填：作者、名称、简介（建议写）、希望分类（可选）、JS 内容；
3. JS 内容用 ` ```js ` 代码块包住。超过 40 KB 就贴 raw 链接（`raw.githubusercontent.com` 或 gist 直链）。

名称 2–8 个字，尽量别和库里已有的重名——重名不会报错，但别人搜起来会混乱。

## 会被直接拒的

不是审美问题，是安全问题。命中任意一条，自动审核就挂：

- `eval()`、`new Function()`、动态 `import()`
- 任何网络请求：`fetch` / `XMLHttpRequest` / `WebSocket` / `sendBeacon` / `new Image()` 上报
- 读写 `document.cookie`、`localStorage`、`sessionStorage`、`indexedDB`
- 动态插入 `<script>`、`iframe`、`<object>`
- 改 `location`、`window.open`、`postMessage`
- 构造或提交表单
- 监听 `keydown` / `input` 之类的输入事件
- 从不明域名加载脚本或样式
- 内容里有色情、赌博、诈骗、引流广告、硬编码联系方式

## 会被犹豫的

不直接拒，但我会看完再决定：

- 引用了外部域名。背景图通常没问题；字体 CDN 会看是哪家；脚本一律不行。
- 很长的 base64 段，看不出意图。
- 大面积 `!important` 覆盖、删节点——可能弄坏应用本身。
- 明显是从别处打包压缩过来的代码。

## 审核流程

```
你提交
  → 几分钟内：机器人回评论（规则命中项 + 模型意见 + 得分）
  → 我点 approved 并关闭 issue
  → Action 把文件写进 appearance/<分类>/<哈希>/，回评论告诉你页面地址
  → Vercel 1–2 分钟后构建完，页面可访问
```

快的时候当天，慢的时候一周。没通过的话，评论里会写清楚卡在哪一条，
**改完直接编辑 issue 正文**，机器人会重审，不用重开。

## 收录之后

- 署名用你填的 GitHub 用户名，页面和 README 上都会链到你的主页；
- 以 MIT 协议随仓库分发，别人可以改、可以再用；
- 你想改内容？不要改文件名或目录名——哈希按内容算，改了内容就是另一套。
  正确做法是重新走一次投稿，或者提个 issue 让我替换；
- 想撤掉？开个 issue 说一声就行。下架不会删 git 历史，只是从列表里移走。

## 本地想先试试

```bash
git clone https://github.com/12hgl/waterfish_anthology_appearance
cd waterfish_anthology_appearance
node scripts/curate.mjs --file ./your-theme.js --name 测试 --category minimal
node scripts/validate-all.mjs
node site/build.mjs && node site/serve.mjs
```

打开 `http://localhost:4173/library/` 就能看到你那套的效果预览——预览是真的在跑你的代码，
不是截图。确认没问题再把文件删掉，别提交。
