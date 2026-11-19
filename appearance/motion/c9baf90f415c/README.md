---
name: 光边
author: waterfish
category: motion
hash: c9baf90f415c
created: 2026-11-14
summary: 一条细光沿着卡片边缘跑一圈，走过的地方亮，走过去就暗。
mode: both
syntax: complex
---

# 光边

> 一条细光沿着卡片边缘跑一圈，走过的地方亮，走过去就暗。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 动效 |
| 哈希 | `c9baf90f415c` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深浅都调过 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `api.css` | `conic-gradient 扫光` | 用旋转的锥形渐变做出沿边跑动的光 |
| `api.css` | `低频` | 8 秒一圈，肉眼不会跟着转 |
| `api.css` | `悬停加速` | 鼠标放上去缩短到 2.4 秒 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`c9baf90f415c.js`](./c9baf90f415c.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  api.css(`
    @property --apAngle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    .card, .theme-card { position: relative; isolation: isolate; }
    .card::before, .theme-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      padding: 1px;
      background: conic-gradient(from var(--apAngle),
        transparent 0deg, var(--accent) 40deg, transparent 90deg, transparent 360deg);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: apSpin 8s linear infinite;
      pointer-events: none;
      z-index: 1;
    }
    .card:hover::before, .theme-card:hover::before { animation-duration: 2.4s; }
    @keyframes apSpin { to { --apAngle: 360deg; } }

    @media (prefers-reduced-motion: reduce) {
      .card::before, .theme-card::before { animation: none; opacity: .35; }
    }
  `);
}
```

## 备注

这特效只加在卡片上，没往按钮上加——按钮上跳舞的光会让人不敢点。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
