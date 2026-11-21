# 投稿说明

想给外观库添一套，看完这页就够了。

## 先想清楚一件事

主题是 `.js`，会在**别人的浏览器里执行**，跑在页面主世界，能碰到 `document`。
所以我们看代码，不只看截图。约定只有一句：**只碰外观，别碰数据。**

## 怎么写

### 简单写法

一行一条，只写想改的，其余全部沿用内置外观。

```js
主色: #3E5C50
底色: #F7F5EE
圆角: 8
```

三种写法都认：`主色: #3E5C50`、`主色 = #3E5C50`、`主色 #3E5C50`。
`//` 和 `#` 开头的行是注释。

| 键 | 作用 | 取值 |
| --- | --- | --- |
| `主色` / `accent` | 强调色：图标、链接、选中态 | 颜色 |
| `副色` / `accent2` | 次级强调，也会给纸面上一点淡彩 | 颜色 |
| `背景` / `bg` | 页面背景图；填颜色就当纸面色 | `https://…` 或颜色 |
| `字体` / `font` | 正文字体 | `serif` `round` `mono` `system`，或字体名 |
| `文字` / `ink` | 正文颜色 | 颜色 |
| `底色` / `paper` | 纸面底色 | 颜色 |
| `圆角` / `radius` | 卡片与控件圆角 | `0`–`40` |

简单写法只有一套颜色：深色模式下应用会把它压回浅色，所以投稿时分类别选「夜间」。

### 复杂写法

文件里定义 `function theme(api)`，应用检测到这个函数就按脚本执行。

```js
function theme(api) {
  const dark = api.dark;

  api.setVar('--paper', dark ? '#131313' : '#F7F5EE');
  api.setVar('--ink', dark ? '#E6E4DD' : '#24241F');
  api.setVar('--accent', dark ? '#8FBBA6' : '#3E5C50');

  api.css(`
    .card:hover { transform: translateY(-2px); }
    @media (prefers-reduced-motion: reduce) { .card:hover { transform: none; } }
  `);

  api.icon('book', '<path d="M4 3h9a2 2 0 0 1 2 2v11H4z"/>');
}
```

可用的 API：

| 调用 | 说明 |
| --- | --- |
| `api.setVar(name, value)` | 设置根元素 CSS 变量，名字必须以 `--` 开头 |
| `api.css(text)` | 注入一段 `<style>`，切主题时自动移除 |
| `api.icon(name, svg)` | 覆盖内置图标，颜色跟随 `currentColor` |
| `api.el` | 根元素，能自己查询节点 |
| `api.dark` | 当前是否深色 |
| `api.vars(name)` | 读某个变量的当前值 |

常用变量：`--paper` `--surface` `--surface-2` `--surface-3` `--line` `--line-strong`
`--ink` `--ink-2` `--ink-3` `--accent` `--accent-ink` `--accent-soft` `--accent-line`
`--btn-bg` `--btn-ink` `--r` `--r-lg` `--app-font`。

### 头部注释

在文件开头写几行 `// @…`，收录时会被读出来（简单写法的文件里也可以写，应用会跳过注释行）：

```js
// @name 松烟
// @author waterfish
// @category recommended
// @mode both
// @date 2026-11-15
// @summary 灰绿压住暖白，像旧纸上落了一层松烟墨。
// @note 深色不是把浅色翻过来，是另配的一套。
```

`@category` 要和最终分类一致，`@mode` 取 `light` / `dark` / `both`。

## 会被拦下来的

投稿一开，机器人先跑静态规则，下面这些命中就拦：

- `eval(` / `new Function(` —— 动态执行代码
- `fetch(` / `XMLHttpRequest` / `sendBeacon` / `WebSocket` —— 网络请求
- `document.cookie` / `localStorage` / `sessionStorage` / `indexedDB` —— 碰登录态和本地数据
- `location.href =` / `window.open(` —— 跳转
- `addEventListener('key…` / `onkeydown` —— 监听输入
- 往页面里塞 `<script>`

还有几项会被「留意」但通常不拦：引用外部域名（字体、背景图通常没问题，脚本不行）、
`api.el` 直接改 DOM、CSS `@import`、`url(...)` 指向外链。能省就省。

## 分类怎么选

| 分类 | 适合 |
| --- | --- |
| 素净 | 去装饰、去颜色，只剩字和纸 |
| 阅读 | 米色纸、衬线字、行距松，给长文 |
| 夜间 | 深色为主，或者只为深色设计 |
| 撞色 | 高饱和，主色很抢眼 |
| 动效 | 悬停、入场、翻页这类，记得做 `prefers-reduced-motion` 降级 |
| 字体 | 只动字体、字距、行高，颜色不碰 |
| 推荐 | **不开放投稿**。维护者自己在用的那几套 |

拿不准就随便选一个，维护者收录时会调整。

## 审核与打回

1. 机器人评论一条结论：拦了什么、哪一行、建议怎么改
2. 打回不用重新开 issue，**直接编辑 issue 正文**，机器人会重审
3. 通过了，维护者打 `approved` 并关闭，文件写进 `appearance/`，CI 过了就上线

## 几条硬规则

- 文件 ≤ **64 KB**
- 名称 2–8 个字，不能和库里已有的重名（重名会打回，因为应用里主题名就是文件名）
- 内容必须是有效的主题：要么全是「键: 值」，要么定义了 `function theme(api)`
- 不能改别人的主题再投——地址是按内容哈希算的，改了就是另一套，署别人名字算抄袭
- 投稿即同意以 MIT 协议随本仓库分发
