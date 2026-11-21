# 水鱼文集 · 外观库

> 给 [水鱼文集](https://waterfish.ren) 用的社区外观库。每套外观是一个 `.js` 文件，下载、上传、生效。
>
> 站点：`https://appearance.waterfish.ren`（Vercel 静态构建）

这个仓库同时是三样东西：

| | |
| --- | --- |
| **一个库** | `appearance/<分类>/<哈希>/` 下放着所有外观的 `.js` 和 `README.md` |
| **一条流水线** | GitHub issue 投稿 → 自动审核 → 人工确认 → Action 写入仓库 |
| **一个站点** | 零依赖 Node 脚本把库渲染成 HTML，Vercel 直接托管 |

---

## 目录

```
appearance/                    外观本体，一个目录一套
  recommended/                 推荐（只接受维护者手动收录）
    0131d5208589/
      0131d5208589.js          主题文件，文件名 = 目录名 = 内容哈希
      README.md                带 front matter 的说明，站点从这里读元数据
  minimal/ reading/ dark/ vivid/ motion/ typography/

categories.json                分类定义（名称、顺序、是否开放投稿）
data/themes.json               构建产物（扫描结果，不入库）

scripts/
  lib/shared.mjs               哈希、front matter、目录扫描
  lib/rules.mjs                静态安全规则（CI / 审核 / 本地共用）
  lib/issue.mjs                解析 issue 表单
  lib/readme.mjs               生成收录后的 README
  lib/ai.mjs                   GitHub Models 复审
  lib/github.mjs               GitHub REST 封装
  build-index.mjs              扫描 → data/themes.json
  validate-all.mjs             结构 + 安全校验
  review-issue.mjs             投稿自动审核
  accept-issue.mjs             issue 关闭后写入仓库
  curate.mjs                   维护者手动收录
  ensure-labels.mjs            创建工作流用到的标签

site/
  build.mjs                    静态站点构建
  serve.mjs                    本地预览
  lib/                         页面、布局、预览运行时、markdown 渲染
  assets/                      样式与前端脚本
  dist/                        构建产物（不入库）

.github/
  ISSUE_TEMPLATE/theme-submission.yml
  workflows/review.yml         新投稿 → 自动审核
  workflows/accept.yml         issue 关闭 + approved → 写入仓库
  workflows/validate.yml       PR / push 校验

vercel.json                    构建命令、响应头、缓存
middleware.js                  Markdown 内容协商（可删）
```

## 哈希为什么是目录名

`sha256(归一化后的文件内容)` 取前 12 位。三个后果，都是想要的：

1. **相同内容 = 同一套**，重复投稿被自动识别；
2. **内容变了 = 新地址**，你下载过的 URL 永远指向当时那份代码；
3. **仓库即索引**，删目录就是下架，不需要维护一张映射表。

归一化规则在 `scripts/lib/shared.mjs`：统一 LF、去掉行尾空白、去掉首尾空行、结尾补一个换行。
改了 `.js` 就必须重新生成目录名，`npm run validate` 会告诉你新哈希是多少。

## 外观的两种写法

**简单写法**——一行一条，只写想改的，其余沿用内置「纸墨」：

```js
// 暖色阅读
主色: #8C5A2B
副色: #B45309
底色: #F7F1E6
圆角: 12
```

键：`主色/accent`、`副色/accent2`、`背景/bg`、`字体/font`、`文字/ink`、`底色/paper`、`圆角/radius`。
分隔符 `:` `=` 空格都认，`//` 与 `#` 开头是注释。

**脚本写法**——文件里定义 `function theme(api)`：

```js
function theme(api) {
  api.setVar('--accent', '#7C5CFF');
  api.setVar('--r', '14px');
  api.css(`
    .card { transition: transform .25s ease; }
    .card:hover { transform: translateY(-2px); }
  `);
  api.icon('book', '<path d="M4 5h16v14H4z"/>');
}
```

| API | 作用 |
| --- | --- |
| `api.setVar(name, value)` | 设置根元素 CSS 变量（必须以 `--` 开头） |
| `api.css(text)` | 注入一段 `<style>`，切主题时自动移除 |
| `api.icon(name, svg)` | 覆盖内置图标，`svg` 传内部图形或完整 `<svg>` |
| `api.el` | 根元素，可自行查询任意节点 |
| `api.dark` | 当前是否深色（实时读取） |
| `api.vars(name)` | 读取某个 CSS 变量的当前值 |

每次应用主题都会先清理再执行，所以复杂主题不会叠加，也不会残留。
单个文件上限 64 KB，最多 20 个自定义主题，主题名取自文件名。

## 投稿 → 收录

```
用户开 issue（表单）
      │
      ▼
review.yml ── 静态规则 + GitHub Models 复审 ──► 回一条评论，打标签
      │                                          ai-approved / needs-human-review / ai-rejected
      ▼
维护者看一眼，打 approved，关 issue
      │
      ▼
accept.yml ── 解析 issue → 算哈希 → 写 appearance/<分类>/<哈希>/ → push
      │
      ▼
Vercel 自动重建，1–2 分钟后页面可访问
```

- **只关 issue 不打标签 = 不收录**，避免误关。
- 分类优先级：`category:xxx` 标签 > issue 里选的 > 兜底 `minimal`。
- `recommended` 不开放投稿，`accept-issue.mjs` 会直接拒绝。
- 收录后会自动回一条评论，包含文件路径和页面地址。

## 自动审核都查什么

规则表在 `scripts/lib/rules.mjs`，分 `block` / `warn` 两级。

直接拒（`block`）：`eval`、`new Function`、动态 `import()`、任何网络请求（fetch / XHR / WebSocket / sendBeacon）、
读写 cookie 与 storage、改 `location`、`window.open`、`postMessage`、构造或提交表单、监听键盘输入、
动态插入 script / iframe、长 base64、sourceMap 指向。

提示（`warn`）：非白名单外部域名、`http://` 资源、`setInterval`、`innerHTML`、删节点、接近 64 KB。

模型复审（`scripts/lib/ai.mjs`）走 GitHub Models，用的就是 Actions 自带的 `GITHUB_TOKEN` +
`models: read` 权限，**不需要额外 Secret**：

```yaml
permissions:
  issues: write
  models: read
```

想换模型只改 workflow 里的 `REVIEW_MODEL`（默认 `openai/gpt-4o-mini`）。
模型调用失败会自动降级为纯规则审核，不会把流程卡死。

## 本地开发

不需要 `npm install`，仓库没有依赖。

```bash
npm run index      # 扫描 appearance/ → data/themes.json
npm run validate   # 目录结构 + 静态安全规则
npm run build      # 完整构建 → site/dist
npm run dev        # 构建后起本地预览 http://localhost:4173
```

手动收录一套（推荐分类必须用这个）：

```bash
node scripts/curate.mjs --file ./my-theme.js \
  --name 湖心纸 --category recommended \
  --author waterfish --summary "湖蓝配米白，看一天不累"
```

演练审核流程（不碰真实 issue）：

```bash
DRY_RUN=1 node scripts/review-issue.mjs --body-file ./issue.md
DRY_RUN=1 node scripts/accept-issue.mjs --body-file ./issue.md --author someone
```

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/12hgl/waterfish_anthology_appearance)

1. 在 Vercel 里 Import 这个仓库，框架选 **Other**；
2. Build Command：`node site/build.mjs`（`vercel.json` 里已写好，一般不用手动填）；
3. Output Directory：`site/dist`；
4. 环境变量 `SITE_ORIGIN` = 你的正式域名（例如 `https://appearance.waterfish.ren`），
   它决定 sitemap、canonical、JSON-LD 里的绝对地址；
5. 绑定域名，完成。

> `SITE_ORIGIN` 一定要设。不设的话构建会退回默认值，sitemap 里的域名就不是你的。

GitHub Actions 那边还需要两步：

1. **Settings → Actions → General → Workflow permissions** 选 *Read and write permissions*
   （`accept.yml` 要 push 提交）；
2. 如果用分支保护，记得允许 `github-actions` 推送，或者接受它开 PR。

标签由 `scripts/ensure-labels.mjs` 自动创建，第一次跑审核工作流时就有了。

## 站点为什么是手写 Node 而不是框架

站点要读 `appearance/` 目录、生成 21 个详情页、三个站点地图文件、Markdown 版本和 JSON 接口。
这些用 `fs` + 模板字符串 300 行就写完了，构建 0.1 秒，且没有任何依赖需要维护。
引入框架当然也行，但这里收益不大，成本是每次升级都得跟着动。

## 给 AI agent 的准备情况

站点按 [isitagentready.com](https://isitagentready.com/) 的检查项做了这些：

| 项目 | 状态 |
| --- | --- |
| `robots.txt`（含 AI bot 规则 + Content-Signal） | ✅ 构建时生成 |
| `sitemap.xml`（每个页面都有条目，含 lastmod / priority） | ✅ 构建时生成 |
| `llms.txt`（分类、全量清单、机器可读入口） | ✅ 构建时生成 |
| Markdown 内容协商（`Accept: text/markdown`） | ✅ `middleware.js` + 每页 `.md` |
| Link 响应头（sitemap / llms.txt / api-catalog） | ✅ `vercel.json` |
| API Catalog（RFC 9727） | ✅ `/.well-known/api-catalog` |
| 结构化数据 | ✅ WebSite / CollectionPage / CreativeWork / BreadcrumbList |
| 机器可读列表 | ✅ `/api/themes.json` |
| Agent Skills（`/.well-known/agent-skills/index.json`） | ✅ 一条 `waterfish-appearance`，带 sha256 摘要 |
| DNS-AID | ❌ 需要你在域名里加 DNS 记录，仓库管不到 |
| MCP Server Card | ❌ 本站没有可调用的 MCP 服务，不伪造 |

最后两项要做的话，DNS-AID 需要在 `appearance.waterfish.ren` 下加 TXT 记录；
MCP 得先把 `/api/themes.json` 包成一个真的 MCP server。都不难，但都得先有真实功能，不宜先写声明。

Skill 的内容放在 `site/skills/waterfish-appearance/SKILL.md`，构建时把 `{{ORIGIN}}` 换成站点域名、
算一遍 sha256 写进索引。改这个文件后重新构建即可，摘要会跟着变，不用手动维护。

## 许可

代码与全部外观均为 MIT。投稿即视为同意以 MIT 随本仓库分发。
外观的著作权归各自作者，本站只做收录与展示。
