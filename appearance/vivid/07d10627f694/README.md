---
name: 落日
author: waterfish
category: vivid
hash: 07d10627f694
created: 2026-11-14
summary: 左上角橙、右下角粉，页面底色是一整块缓慢的晚霞。
mode: both
syntax: complex
---

# 落日

> 左上角橙、右下角粉，页面底色是一整块缓慢的晚霞。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 色彩 |
| 哈希 | `07d10627f694` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深浅都调过 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `api.css` | `双色径向渐变` | 固定在视口上，滚动的时候不跟着动 |
| `--accent` | `暖橙` | 按钮用实心橙，深色模式下换成更亮的橙 |
| `--surface` | `半透明` | 卡片透出一点底色，晚霞能透上来 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`07d10627f694.js`](./07d10627f694.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  const dark = api.dark;

  api.setVar('--paper',     dark ? '#140D14' : '#FFF6F0');
  api.setVar('--surface',   dark ? 'rgba(32,20,30,.72)' : 'rgba(255,255,255,.78)');
  api.setVar('--surface-2', dark ? '#251722' : '#FDEADF');
  api.setVar('--line',      dark ? '#3A2434' : '#F3D6C4');
  api.setVar('--ink',       dark ? '#F0E3E6' : '#33211C');
  api.setVar('--ink-2',     dark ? '#BEA3AE' : '#5C4038');
  api.setVar('--accent',    dark ? '#FF8A4C' : '#E4572E');
  api.setVar('--accent-ink', dark ? '#FFA97A' : '#C2451F');
  api.setVar('--accent-soft', dark ? '#38211C' : '#FCE3D6');
  api.setVar('--btn-bg',    dark ? '#FF8A4C' : '#E4572E');
  api.setVar('--btn-ink',   dark ? '#1C0F0A' : '#FFF7F2');

  api.setVar('--r', '16px');
  api.setVar('--r-lg', '22px');

  api.css(`
    body {
      background-image:
        radial-gradient(900px 500px at 0% 0%, ${dark ? 'rgba(255,138,76,.16)' : 'rgba(255,168,110,.34)'}, transparent 60%),
        radial-gradient(800px 520px at 100% 100%, ${dark ? 'rgba(255,61,154,.14)' : 'rgba(255,120,170,.28)'}, transparent 60%);
      background-attachment: fixed;
    }
    .card, .record, .theme-card { backdrop-filter: blur(6px); }
  `);
}
```

## 备注

卡片用半透明是为了让渐变透出来，代价是长列表滚动时性能会比纯色低一点点，移动端感知不明显。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
