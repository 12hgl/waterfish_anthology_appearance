---
name: 呼吸
author: waterfish
category: motion
hash: 41565d7fbeec
created: 2026-11-14
summary: 选中态那圈光会以六秒一个周期慢慢明暗，像在呼吸。
mode: both
syntax: complex
---

# 呼吸

> 选中态那圈光会以六秒一个周期慢慢明暗，像在呼吸。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 动效 |
| 哈希 | `41565d7fbeec` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深浅都调过 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `api.css` | `选中态脉动` | box-shadow 在 6s 内来回，缓入缓出 |
| `api.css` | `只给选中项` | 没选中的卡片完全不闪，不抢注意力 |
| `api.css` | `减弱动效` | 开关打开时变成静态边框 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`41565d7fbeec.js`](./41565d7fbeec.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  api.css(`
    @keyframes apBreath {
      0%, 100% { box-shadow: 0 0 0 1px var(--accent-line), 0 0 14px -8px var(--accent); }
      50%      { box-shadow: 0 0 0 1px var(--accent),      0 0 26px -4px var(--accent); }
    }
    .theme-card[aria-selected="true"],
    .theme-card.is-active,
    .card.is-selected {
      animation: apBreath 6s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .theme-card[aria-selected="true"],
      .theme-card.is-active,
      .card.is-selected {
        animation: none;
        box-shadow: 0 0 0 1px var(--accent);
      }
    }
  `);
}
```

## 备注

六秒是我试出来最不催人的节奏。三秒会显得焦虑，十秒又像卡住了。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
