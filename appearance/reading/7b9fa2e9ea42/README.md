---
name: 宋版
author: waterfish
category: reading
hash: 7b9fa2e9ea42
created: 2026-11-14
summary: 衬线正文、字距放宽、行高拉到 1.9，像翻一本排得很松的宋版书。
mode: both
syntax: complex
---

# 宋版

> 衬线正文、字距放宽、行高拉到 1.9，像翻一本排得很松的宋版书。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 阅读 |
| 哈希 | `7b9fa2e9ea42` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深浅都调过 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `--serif` | `宋体优先的字体栈` | 系统里有思源宋就用思源宋 |
| `api.css` | `字距与行高` | 正文 letter-spacing .01em，行高 1.9，两端对齐 |
| `--paper` | `极浅的宣纸色` | 深色模式下换成墨色，不是纯黑 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`7b9fa2e9ea42.js`](./7b9fa2e9ea42.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  const dark = api.dark;

  api.setVar('--paper',     dark ? '#16151A' : '#FBFAF5');
  api.setVar('--surface',   dark ? '#1D1C22' : '#FFFFFF');
  api.setVar('--surface-2', dark ? '#24232A' : '#F4F2E9');
  api.setVar('--line',      dark ? '#33323A' : '#E5E1D3');
  api.setVar('--ink',       dark ? '#DEDAD0' : '#26241F');
  api.setVar('--ink-2',     dark ? '#A9A498' : '#4E4A40');
  api.setVar('--accent',    dark ? '#C9A227' : '#8A6D1F');
  api.setVar('--accent-ink', dark ? '#E0BE4C' : '#6E5614');
  api.setVar('--accent-soft', dark ? '#2E2A1B' : '#F3EEDC');

  api.setVar('--serif', '"Source Han Serif SC", "Noto Serif CJK SC", "Songti SC", "SimSun", serif');
  api.setVar('--r', '6px');

  api.css(`
    .prose, .article-body, .content, .page-title {
      font-family: var(--serif);
      letter-spacing: .012em;
    }
    .prose p, .article-body p {
      line-height: 1.9;
      text-align: justify;
      text-justify: inter-ideograph;
      margin-bottom: 1.1em;
    }
    .prose h2, .article-body h2 { letter-spacing: .06em; }
  `);
}
```

## 备注

两端对齐在窄屏上会出现大空格，如果你常用手机，把 text-align: justify 那行删掉更稳。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
