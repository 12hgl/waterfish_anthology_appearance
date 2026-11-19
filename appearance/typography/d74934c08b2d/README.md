---
name: 思源宋
author: waterfish
category: typography
hash: d74934c08b2d
created: 2026-11-14
summary: 从 CDN 拉一份思源宋，正文全部换成衬线。
mode: both
syntax: complex
---

# 思源宋

> 从 CDN 拉一份思源宋，正文全部换成衬线。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 字体 |
| 哈希 | `d74934c08b2d` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深浅都调过 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `api.setVar` | `--serif 指向 Noto Serif SC` | 标题和正文一起换 |
| `api.css` | `外链字体` | 只加载 400/600 两个字重，不拖慢首屏 |
| `api.css` | `字号微调` | 衬线字在小字号下发虚，正文放大到 1.02em |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`d74934c08b2d.js`](./d74934c08b2d.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  const href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&display=swap';
  if (!document.querySelector('link[data-theme-font="source-serif"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.themeFont = 'source-serif';
    document.head.appendChild(link);
  }

  api.setVar('--serif', '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif');
  api.css(`
    .page-title, .prose, .article-body, .card-title {
      font-family: var(--serif);
      letter-spacing: .01em;
    }
    .prose, .article-body { font-size: 1.02em; line-height: 1.85; }
  `);
}
```

## 备注

字体从 Google Fonts 拉，国内网络可能慢或不通；加载失败会自动回落到系统宋体，只是字重会变。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
