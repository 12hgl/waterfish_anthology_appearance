---
name: 灯下
author: waterfish
category: recommended
hash: 7ae29bcdb75d
created: 2026-11-14
summary: 像把台灯挪近了十厘米：暖黄纸面，琥珀色的字，深浅两边都调过。
mode: both
syntax: complex
---

# 灯下

> 像把台灯挪近了十厘米：暖黄纸面，琥珀色的字，深浅两边都调过。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 推荐 |
| 哈希 | `7ae29bcdb75d` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深浅都调过 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `--paper / --surface` | `暖黄纸面与浮起的卡片` | 浅色是旧书纸，深色是关灯后的木桌 |
| `--accent` | `琥珀` | 强调色偏橙，不抢正文 |
| `api.css` | `纸面细颗粒` | 一层极淡的噪点，纯色背景看起来不会像 PPT |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`7ae29bcdb75d.js`](./7ae29bcdb75d.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  const dark = api.dark;

  // 纸面：浅色是旧书纸，深色是关灯后的木桌
  api.setVar('--paper',     dark ? '#141110' : '#FBF5E8');
  api.setVar('--surface',   dark ? '#1C1917' : '#FFFCF2');
  api.setVar('--surface-2', dark ? '#241F1C' : '#F3EAD8');
  api.setVar('--surface-3', dark ? '#2C2622' : '#EADFC8');
  api.setVar('--line',      dark ? '#3A332D' : '#E2D5BB');
  api.setVar('--line-strong', dark ? '#4C433B' : '#CFBE9C');

  // 字：暖白，不用纯白
  api.setVar('--ink',   dark ? '#E9E1D2' : '#3A322A');
  api.setVar('--ink-2', dark ? '#B8AC98' : '#5C5044');
  api.setVar('--ink-3', dark ? '#847868' : '#8A7C69');

  // 强调：琥珀
  api.setVar('--accent',      dark ? '#E0A458' : '#B4700F');
  api.setVar('--accent-ink',  dark ? '#F0BE7E' : '#8A5410');
  api.setVar('--accent-soft', dark ? '#33281C' : '#F6E7CC');
  api.setVar('--accent-line', dark ? '#5A4429' : '#E3C99B');
  api.setVar('--btn-bg',      dark ? '#E0A458' : '#B4700F');
  api.setVar('--btn-ink',     dark ? '#1A1512' : '#FFFDF6');

  api.setVar('--r-sm', '8px');
  api.setVar('--r', '12px');
  api.setVar('--r-lg', '18px');

  // 一层几乎看不见的颗粒，让纸面别那么"数码"
  api.css(`
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      opacity: .035;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    .page-title { letter-spacing: .015em; }
  `);

  api.icon('book', '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 18.5V5.5" opacity=".45"/>');
}
```

## 备注

这套是我自己日常用的。写长文的时候把系统亮度调低一档，纸面会显得更暖。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
