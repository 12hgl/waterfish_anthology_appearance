---
name: 深林
author: waterfish
category: dark
hash: 90b5e1d09375
created: 2026-11-14
summary: 墨绿的暗部，苔藓色的强调，看久了像待在树林里。
mode: both
syntax: complex
---

# 深林

> 墨绿的暗部，苔藓色的强调，看久了像待在树林里。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 深色 |
| 哈希 | `90b5e1d09375` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深浅都调过 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `--paper` | `墨绿 #0D1512` | 比纯黑柔和，绿得几乎看不见 |
| `--accent` | `苔藓绿` | 浅色模式下改成林荫深绿，保证对比度 |
| `--ink` | `带绿的灰白` | 文字不是中性色，会跟底色呼应 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`90b5e1d09375.js`](./90b5e1d09375.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  const dark = api.dark;

  api.setVar('--paper',     dark ? '#0D1512' : '#F3F6F1');
  api.setVar('--surface',   dark ? '#13201B' : '#FBFDF9');
  api.setVar('--surface-2', dark ? '#182822' : '#E9EFE5');
  api.setVar('--surface-3', dark ? '#1F312A' : '#DFE7D9');
  api.setVar('--line',      dark ? '#27392F' : '#DCE5D5');
  api.setVar('--line-strong', dark ? '#354B3E' : '#C4D2BB');

  api.setVar('--ink',   dark ? '#DDE7DC' : '#22301F');
  api.setVar('--ink-2', dark ? '#A2B4A1' : '#465843');
  api.setVar('--ink-3', dark ? '#6F8370' : '#77876F');

  api.setVar('--accent',      dark ? '#7FB069' : '#3F6B34');
  api.setVar('--accent-ink',  dark ? '#9CC98A' : '#2F5527');
  api.setVar('--accent-soft', dark ? '#1B2E1F' : '#E3EEDC');
  api.setVar('--accent-line', dark ? '#2F4A33' : '#C6DABB');
  api.setVar('--btn-bg',      dark ? '#7FB069' : '#3F6B34');
  api.setVar('--btn-ink',     dark ? '#0B1410' : '#F5FBF2');

  api.setVar('--r', '12px');
  api.css(`.page-title { letter-spacing: .01em; }`);
}
```

## 备注

绿色系主题最容易做得发脏，这套把饱和度压在 30% 上下，暗部才干净。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
