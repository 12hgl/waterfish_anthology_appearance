---
name: 灰阶
author: waterfish
category: minimal
hash: 46edd9ea0279
created: 2026-11-14
summary: 十一级灰，没有第二种颜色，也没有阴影。
mode: both
syntax: complex
---

# 灰阶

> 十一级灰，没有第二种颜色，也没有阴影。

| | |
| --- | --- |
| 作者 | waterfish |
| 分类 | 简洁 |
| 哈希 | `46edd9ea0279` |
| 写法 | 复杂写法（function theme(api)） |
| 适配 | 深浅都调过 |

## 改了什么

| 键 / 手段 | 值 | 为什么 |

| `--ink 系列` | `三级灰文字` | 正文 #222，次要 #5A5A5A，弱化 #9A9A9A |
| `--accent` | `中灰` | 强调色用的是 #4A4A4A，选中态靠底色块区分 |
| `api.css` | `去掉阴影与过渡` | 所有 box-shadow 清零，hover 只改边框色 |

## 安装

1. 打开水鱼文集 → 设置 → 外观 → 自定义主题
2. 把 [`46edd9ea0279.js`](./46edd9ea0279.js) 下载下来（右键另存为，或者从本页下方复制）
3. 点「选择 .js 主题文件」上传，列表里出现卡片即生效

```js
function theme(api) {
  const dark = api.dark;

  api.setVar('--paper',     dark ? '#111111' : '#F7F7F7');
  api.setVar('--surface',   dark ? '#191919' : '#FFFFFF');
  api.setVar('--surface-2', dark ? '#212121' : '#F0F0F0');
  api.setVar('--surface-3', dark ? '#292929' : '#E8E8E8');
  api.setVar('--line',      dark ? '#333333' : '#E0E0E0');
  api.setVar('--line-strong', dark ? '#4A4A4A' : '#C9C9C9');

  api.setVar('--ink',   dark ? '#E8E8E8' : '#222222');
  api.setVar('--ink-2', dark ? '#A8A8A8' : '#5A5A5A');
  api.setVar('--ink-3', dark ? '#6E6E6E' : '#9A9A9A');

  api.setVar('--accent',      dark ? '#BDBDBD' : '#4A4A4A');
  api.setVar('--accent-ink',  dark ? '#E8E8E8' : '#2B2B2B');
  api.setVar('--accent-soft', dark ? '#262626' : '#EDEDED');
  api.setVar('--accent-line', dark ? '#3D3D3D' : '#D6D6D6');

  api.setVar('--r-sm', '4px');
  api.setVar('--r', '6px');
  api.setVar('--r-lg', '8px');

  api.css(`
    .card, .record, .theme-card {
      box-shadow: none !important;
      border: 1px solid var(--line);
    }
    .card, .record, .theme-card, a, button {
      transition: border-color .15s linear, color .15s linear;
    }
    .card:hover, .record:hover { transform: none !important; }
  `);
}
```

## 备注

做无障碍测试时发现纯灰的对比度其实比很多彩色主题更稳，就把阴影也一起删了。

---

<sub>本文件由 `npm run index` 校验；哈希 = 文件内容 SHA-256 的前 12 位，改动 JS 内容后哈希会变，需要重新生成目录。</sub>
