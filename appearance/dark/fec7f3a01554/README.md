---
name: 夜航
author: waterfish
category: dark
hash: fec7f3a01554
created: 2026-11-14
summary: 深海蓝的底，青色的灯，关灯之后屏幕像舷窗。
mode: dark
syntax: complex
---

# 夜航

> 深海蓝的底，青色的灯，关灯之后屏幕像舷窗。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 深色 |
| 哈希 | `fec7f3a01554` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深色为主 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `--paper` | `深海蓝 #0B1220` | 不是纯黑，暗部有层次 |
| `--accent` | `冷青` | 图标和链接在深底上够亮，但不刺 |
| `api.css` | `微弱的光晕` | 强调色元素带一层很淡的外发光 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`fec7f3a01554.js`](./fec7f3a01554.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  api.setVar('--paper',     '#0B1220');
  api.setVar('--surface',   '#111A2B');
  api.setVar('--surface-2', '#162033');
  api.setVar('--surface-3', '#1C283D');
  api.setVar('--line',      '#22304A');
  api.setVar('--line-strong', '#2E3F5E');

  api.setVar('--ink',   '#DCE6F5');
  api.setVar('--ink-2', '#9BAECC');
  api.setVar('--ink-3', '#6C7E9B');

  api.setVar('--accent',      '#4FD1C5');
  api.setVar('--accent-ink',  '#7EE7DC');
  api.setVar('--accent-soft', '#10302F');
  api.setVar('--accent-line', '#1D4B49');
  api.setVar('--btn-bg',      '#4FD1C5');
  api.setVar('--btn-ink',     '#06201E');

  api.setVar('--r-sm', '8px');
  api.setVar('--r', '12px');
  api.setVar('--r-lg', '16px');

  api.css(`
    body {
      background-image:
        radial-gradient(1100px 520px at 82% -12%, rgba(79,209,197,.10), transparent 62%),
        radial-gradient(760px 420px at 6% 8%, rgba(59,130,246,.09), transparent 60%);
      background-attachment: fixed;
    }
    .theme-card[aria-selected="true"], .card:hover, .record:hover {
      box-shadow: 0 0 0 1px var(--accent-line), 0 0 22px -6px rgba(79,209,197,.45);
    }
  `);
}
```

## 备注

这套默认就按深色调，浅色模式下会退化成一套偏冷的灰蓝，不算难看但没专门做。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
