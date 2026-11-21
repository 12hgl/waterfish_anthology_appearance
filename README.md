# 水鱼文集 · 外观库

[水鱼文集](https://github.com/12hgl/waterfish_anthology) 是跑在自己 NAS 上的阅读应用，
允许上传一个 `.js` 换掉整套界面外观。这个仓库放别人写好的那些外观，外加一个把它们展示出来的静态站点。

站点：`https://appearance.waterfish.ren`（部署后生效，见文末）

- 每套外观一个目录，目录名是**内容哈希**，里面一个 `.js` 一个 `README.md`
- 投稿走 issue 表单，机器人先审（静态规则 + AI 复审），人再确认
- 站点零依赖、构建 0.1 秒，Vercel 直接托管

## 目录

```
appearance/<分类>/<12 位哈希>/
├── <哈希>.js      # 主题本体，下载回去就是这个
└── README.md      # 由 js 头部的 @ 元信息生成，别手改

categories.json    # 分类定义：order 排序，open=false 表示不收投稿
scripts/           # 校验、收录、审核、手动添加
site/              # 静态站点的构建脚本与资源
```

## 外观的两种写法

**简单**：一行一条，只写想改的。

```js
主色: #3E5C50
底色: #F7F5EE
圆角: 8
```

认得的键：`主色` `副色` `背景` `字体` `文字` `底色` `圆角`（也认 `accent` `accent2` `bg` `font` `ink` `paper` `radius`）。

**复杂**：文件里定义 `function theme(api)`，应用会执行它。

```js
function theme(api) {
  api.setVar('--paper', api.dark ? '#131513' : '#F7F5EE');
  api.setVar('--accent', '#3E5C50');
  api.css('.card:hover { transform: translateY(-2px); }');
  api.icon('book', '<path d="…"/>');
}
```

`api.setVar(变量, 值)` 改 CSS 变量，`api.css(文本)` 注入样式，`api.icon(名字, svg)` 换图标，
`api.el` 是根元素，`api.dark` 是当前是否深色。变量名沿用应用自己那套：`--paper` `--surface`
`--ink` `--accent` `--r` 等等。

主题文件头部可以写元信息，收录时会被读出来：

```js
// @name 松烟
// @author waterfish
// @category recommended
// @mode both          // light | dark | both
// @date 2026-11-15
// @summary 灰绿压住暖白，像旧纸上落了一层松烟墨。
```

## 投稿

1. 开 [投稿 issue](https://github.com/12hgl/waterfish_anthology_appearance/issues/new?template=theme-submission.yml)：
   填作者、名称、简介、希望的分类，贴 js 内容
2. 机器人回一条审核结论（拦了什么、建议怎么改）。改完直接编辑 issue，会重审
3. 维护者打 `approved` 标签**并关闭** issue，另一个工作流把文件写进 `appearance/<分类>/<哈希>/`

只关不打标签，不会收录。「推荐」不开放投稿，那三套由维护者手动放（`npm run add --force`）。

## 审核查什么

| 环节 | 查什么 | 结果 |
| --- | --- | --- |
| 静态规则 | `eval` / `new Function`、网络请求、cookie 与 localStorage、跳转、键盘监听、塞 `<script>` | 命中即拦 |
| AI 复审 | GitHub Models（`openai/gpt-4o-mini`）：这段代码是不是只改外观、有没有违规内容 | 建议通过 / 要人看 / 不建议 |
| 人 | 维护者看一眼，决定是否 `approved` | 最终决定 |

AI 说通过不等于收录；AI 说不建议也不等于判死——维护者可以打 `skip-ai` 覆盖。

## 哈希是怎么算的

`sha256(归一化后的文件内容)` 取前 12 位。归一化 = 统一 LF、去行尾空白、只留一个结尾换行。

所以：同一份内容在哪台机器上算都一样；改一个字符，目录名就得换；重复投稿不会覆盖别人。

## 本地

```bash
npm run verify     # 结构、哈希、README 是否同步
npm run build      # 生成 site/dist
npm run dev        # 起本地预览（含 markdown 协商）
npm run add -- ./my-theme.js --category reading   # 手动加一套（--force 可进「推荐」）
npm run index      # 按现有 js 重写所有 README
```

故意写坏一个文件试试：改一个字符再 `npm run verify`，它会告诉你目录名该是什么。

演练审核（不碰真实 issue）：

```bash
DRY_RUN=1 node scripts/audit.mjs --body ./issue.md
```

## 部署

1. Vercel 里 Import 这个仓库，框架选 **Other**（`vercel.json` 已经写好构建命令和输出目录）
2. 环境变量 `SITE_ORIGIN` 设成正式域名，sitemap / canonical / JSON-LD 都用它拼绝对地址
3. 绑定域名

GitHub 那边还要两步：

1. **Settings → Actions → General → Workflow permissions** 选 *Read and write*（收录工作流要 push）
2. 有分支保护的话，允许 `github-actions` 推送

## 给机器读的

站点按 [isitagentready.com](https://isitagentready.com/) 的检查项做了这些：

| 项 | 位置 |
| --- | --- |
| `robots.txt`（AI bot 规则 + Content-Signal + Sitemap） | 构建时生成 |
| `sitemap.xml` | 每个页面一条，含 lastmod / priority |
| `llms.txt` | 分类、全量清单、机器入口 |
| Markdown 协商 | `middleware.js` + 每页一份 `.md` |
| `Link` 响应头 | sitemap / llms.txt / api-catalog |
| API Catalog（RFC 9727） | `/.well-known/api-catalog` |
| Agent Skills | `/.well-known/agent-skills/index.json`，一条 `waterfish-theme`，带 sha256 |
| 结构化数据 | WebSite / CollectionPage / CreativeWork / BreadcrumbList |
| 全量 JSON | `/api/themes.json` |

没做的：DNS-AID（要往域名加 TXT 记录，仓库管不到）、MCP Server Card（本站没有可调用的 MCP 服务，不编一个假的）。

## 许可

站点代码 MIT。收录的外观也是 MIT，著作权归各自作者；投稿即视为同意以 MIT 随本仓库分发。
这个库不承诺安全审计——规则和 AI 只排除已知的危险写法。
