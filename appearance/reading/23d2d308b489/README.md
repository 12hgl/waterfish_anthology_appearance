---
name: 羊皮纸
author: waterfish
category: reading
hash: 23d2d308b489
created: 2026-11-14
summary: 偏黄的纸、褪色的墨，翻页的时候像在摸一张旧纸。
mode: light
syntax: complex
---

# 羊皮纸

> 偏黄的纸、褪色的墨，翻页的时候像在摸一张旧纸。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 阅读 |
| 哈希 | `23d2d308b489` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 浅色为主 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `api.css` | `纸纹` | 两层极淡的斜向条纹叠出纤维感，不用图片 |
| `--ink` | `褪色墨` | #3B2F22，比纯黑软 |
| `--accent` | `赭石` | 很旧的那种赭红 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`23d2d308b489.js`](./23d2d308b489.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  api.setVar('--paper',     '#F2E8D5');
  api.setVar('--surface',   '#F8F1E1');
  api.setVar('--surface-2', '#EBDDC4');
  api.setVar('--surface-3', '#E2D1B4');
  api.setVar('--line',      '#DCC9A8');
  api.setVar('--line-strong', '#C9B08A');

  api.setVar('--ink',   '#3B2F22');
  api.setVar('--ink-2', '#5C4B37');
  api.setVar('--ink-3', '#8A755A');

  api.setVar('--accent',      '#9B4A28');
  api.setVar('--accent-ink',  '#7A3A1E');
  api.setVar('--accent-soft', '#EFDEC5');
  api.setVar('--accent-line', '#DCBF97');

  api.setVar('--r', '10px');

  api.css(`
    body {
      background-image:
        repeating-linear-gradient(112deg, rgba(140,110,70,.045) 0 2px, transparent 2px 7px),
        repeating-linear-gradient(22deg,  rgba(120,95,60,.035) 0 1px, transparent 1px 9px);
      background-attachment: fixed;
    }
    .card, .record { box-shadow: 0 1px 0 rgba(120,90,50,.14), 0 6px 18px -12px rgba(80,55,20,.5); }
  `);
}
```

## 备注

纸纹是纯 CSS 画的，不加载任何图片，所以不会有背景图卡一下的观感。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
