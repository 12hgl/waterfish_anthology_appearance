---
name: 霓虹雨
author: waterfish
category: vivid
hash: 43aac02909d8
created: 2026-11-14
summary: 青紫双色描边，hover 的时候整张卡片像通上了电。
mode: dark
syntax: complex
---

# 霓虹雨

> 青紫双色描边，hover 的时候整张卡片像通上了电。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 色彩 |
| 哈希 | `43aac02909d8` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深色为主 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `api.css` | `渐变描边` | 用 mask 抠出边框，卡片一圈是青到紫的渐变 |
| `--accent` | `电光青` | 文字和图标用青色，紫色只做辅助 |
| `api.css` | `hover 通电` | 悬浮时描边变亮、外发光扩一圈 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`43aac02909d8.js`](./43aac02909d8.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  api.setVar('--paper',     '#0A0A12');
  api.setVar('--surface',   '#10101C');
  api.setVar('--surface-2', '#161628');
  api.setVar('--surface-3', '#1C1C33');
  api.setVar('--line',      '#262645');
  api.setVar('--line-strong', '#3A3A66');

  api.setVar('--ink',   '#E6E6F5');
  api.setVar('--ink-2', '#A3A3C4');
  api.setVar('--ink-3', '#6E6E92');

  api.setVar('--accent',      '#38E1FF');
  api.setVar('--accent-ink',  '#7BEDFF');
  api.setVar('--accent-soft', '#0E2C3A');
  api.setVar('--accent-line', '#2A5C77');
  api.setVar('--btn-bg',      '#38E1FF');
  api.setVar('--btn-ink',     '#04141B');

  api.setVar('--r', '14px');
  api.setVar('--r-lg', '20px');

  api.css(`
    .card, .theme-card {
      position: relative;
      background-clip: padding-box;
      border: 1px solid transparent !important;
    }
    .card::after, .theme-card::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(135deg, #38E1FF, #A855F7 55%, #FF3D9A);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: .55;
      pointer-events: none;
      transition: opacity .2s ease;
    }
    .card:hover::after, .theme-card:hover::after { opacity: 1; }
    .card:hover, .theme-card:hover {
      box-shadow: 0 0 24px -6px rgba(56,225,255,.4), 0 0 40px -20px rgba(168,85,247,.6);
    }
  `);
}
```

## 备注

渐变描边在 Safari 上偶尔会有半像素的缝，介意的话把 mask 那两行去掉，改成 border-color。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
