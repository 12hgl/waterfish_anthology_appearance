---
name: 纸页轻起
author: waterfish
category: motion
hash: bed748478b35
created: 2026-11-14
summary: 鼠标划过去，卡片会轻轻抬起来一点，只有两毫米。
mode: both
syntax: complex
---

# 纸页轻起

> 鼠标划过去，卡片会轻轻抬起来一点，只有两毫米。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 动效 |
| 哈希 | `bed748478b35` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深浅都调过 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `api.css` | `hover 位移` | translateY(-2px) + 阴影加深，时长 .22s 缓出 |
| `api.css` | `入场淡入` | 主题卡片依次上浮 6px，间隔 30ms |
| `api.css` | `尊重减弱动效` | 系统开启「减弱动态效果」时全部关掉 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`bed748478b35.js`](./bed748478b35.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  api.css(`
    .card, .record, .theme-card {
      transition: transform .22s cubic-bezier(.2,.7,.3,1),
                  box-shadow .22s cubic-bezier(.2,.7,.3,1);
      will-change: transform;
    }
    .card:hover, .record:hover, .theme-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 6px -2px rgba(0,0,0,.10), 0 14px 28px -18px rgba(0,0,0,.45);
    }
    .card:active, .record:active { transform: translateY(0); transition-duration: .08s; }

    .theme-card { animation: apLift .28s cubic-bezier(.2,.7,.3,1) both; }
    .theme-card:nth-child(2) { animation-delay: .03s; }
    .theme-card:nth-child(3) { animation-delay: .06s; }
    .theme-card:nth-child(4) { animation-delay: .09s; }
    .theme-card:nth-child(5) { animation-delay: .12s; }
    .theme-card:nth-child(6) { animation-delay: .15s; }
    @keyframes apLift {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .card, .record, .theme-card { transition: none !important; animation: none !important; }
      .card:hover, .record:hover, .theme-card:hover { transform: none !important; }
    }
  `);
}
```

## 备注

位移只给了 2px。试过 4px，列表滚动时会有轻微的重影感，2px 刚好能感觉到但不晕。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
