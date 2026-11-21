/**
 * 预览用的仿真界面。
 *
 * 这是个假的「水鱼文集」书架：结构、CSS 变量名、按钮层级都照真应用抄，
 * 但它跑在 sandbox="allow-scripts"（没有 allow-same-origin）的 iframe 里——
 * 主题代码没有源、没有 cookie、碰不到父页面，只能改它自己的变量。
 */

const CSS = `
*,*::before,*::after{box-sizing:border-box}
:root{
  --app-font:var(--sans);
  --serif:"Newsreader","Noto Serif SC","Source Han Serif SC","Songti SC",Georgia,serif;
  --sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang SC","Noto Sans SC","Microsoft YaHei",sans-serif;
  --mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;

  --paper:#FAFAF9; --surface:#FFFFFF; --surface-2:#F7F7F6; --surface-3:#F0F0EF;
  --line:#EAEAEA; --line-strong:#DEDEDD;
  --ink:#111111; --ink-2:#4A4A48; --ink-3:#8A8A86;
  --accent:#1F6C9F; --accent-ink:#1F6C9F; --accent-soft:#E1F3FE; --accent-line:#B9DEF6;
  --accent-2:#B45309;
  --btn-bg:#111111; --btn-ink:#FFFFFF;
  --r-sm:5px; --r:6px; --r-lg:8px;
  --theme-bg:none;
  color-scheme:light;
}
:root[data-theme="dark"]{
  --paper:#121211; --surface:#1A1A19; --surface-2:#201F1E; --surface-3:#262524;
  --line:#302F2D; --line-strong:#413F3C;
  --ink:#EDEBE6; --ink-2:#AEABA3; --ink-3:#7C7973;
  --accent:#6FA9CE; --accent-ink:#8FC3E2; --accent-soft:#18262F; --accent-line:#2B4354;
  --accent-2:#D08A4E;
  --btn-bg:#EDEBE6; --btn-ink:#141312;
  color-scheme:dark;
}
html,body{height:100%;margin:0}
body{
  background:var(--paper);color:var(--ink);
  background-image:var(--theme-bg);
  background-size:cover;background-position:center;
  font:400 12.5px/1.6 var(--app-font);
  -webkit-font-smoothing:antialiased;overflow:hidden;
}
.app{display:flex;height:100%;min-height:100%}

/* 侧栏 */
.side{
  width:158px;flex:none;padding:12px 9px;gap:14px;
  display:flex;flex-direction:column;
  border-right:1px solid var(--line);background:var(--surface-2);
}
.brand{display:flex;align-items:center;gap:7px;font-weight:600;font-size:12.5px;letter-spacing:.01em}
.brand i{width:13px;height:13px;border-radius:4px;background:var(--accent);flex:none}
.side nav{display:flex;flex-direction:column;gap:1px}
.side a{
  display:flex;align-items:center;gap:7px;padding:5px 7px;border-radius:var(--r-sm);
  color:var(--ink-2);font-size:12px;text-decoration:none;
}
.side a.on{background:var(--accent-soft);color:var(--accent-ink);font-weight:600}
.side a svg{width:13px;height:13px;flex:none;stroke:currentColor;fill:none;stroke-width:1.6}
.me{
  margin-top:auto;display:flex;align-items:center;gap:7px;padding:6px 7px;
  border:1px solid var(--line);border-radius:var(--r);background:var(--surface);
}
.me b{display:block;font-size:11.5px;font-weight:600;line-height:1.3}
.me span{display:block;font-size:10px;color:var(--ink-3);line-height:1.3}
.ava{
  width:20px;height:20px;border-radius:50%;flex:none;display:grid;place-items:center;
  background:var(--accent);color:#fff;font-size:10px;font-weight:600;
}

/* 主区 */
main{flex:1;min-width:0;padding:14px 16px;display:flex;flex-direction:column;gap:12px;overflow:hidden}
.head{display:flex;align-items:center;gap:10px}
.head h1{margin:0;font-size:15px;font-weight:650;letter-spacing:.01em}
.seg{margin-left:auto;display:flex;gap:2px;background:var(--surface-3);padding:2px;border-radius:var(--r)}
.seg i{padding:2px 8px;font-size:10.5px;font-style:normal;border-radius:calc(var(--r) - 2px);color:var(--ink-3)}
.seg i.on{background:var(--surface);color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.06)}

.shelf{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
.book{
  border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:var(--surface);
  display:flex;flex-direction:column;
}
.cover{
  height:62px;display:flex;align-items:flex-end;padding:6px 7px;
  font-size:10px;font-weight:600;color:#fff;line-height:1.3;
  background:linear-gradient(155deg,var(--accent),var(--accent-ink));
}
.book:nth-child(2) .cover{background:linear-gradient(155deg,var(--accent-2),var(--accent))}
.book:nth-child(3) .cover{background:linear-gradient(155deg,var(--ink-2),var(--ink))}
.book:nth-child(4) .cover{background:linear-gradient(155deg,var(--accent-line),var(--accent))}
.book .t{padding:5px 7px 2px;font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.book .a{padding:0 7px 6px;font-size:9.5px;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.recent{display:flex;flex-direction:column;gap:0;border-top:1px solid var(--line);padding-top:2px;min-height:0}
.hint{display:flex;align-items:center;justify-content:space-between;padding:2px 1px;font-size:10.5px;color:var(--ink-3)}
.rows{display:flex;flex-direction:column;overflow:hidden}
.row{
  display:flex;align-items:center;gap:8px;padding:6px 7px;border-radius:var(--r-sm);
  border-bottom:1px solid var(--line);
}
.row:hover{background:var(--surface-2)}
.row .n{font-size:11.5px;font-weight:550;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .m{font-size:9.5px;color:var(--ink-3);white-space:nowrap}
.row .bar{margin-left:auto;width:46px;height:3px;border-radius:2px;background:var(--surface-3);flex:none;position:relative}
.row .bar::after{content:"";position:absolute;inset:0 auto 0 0;width:var(--p,40%);border-radius:2px;background:var(--accent)}

.tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:10px;border-top:1px solid var(--line)}
.tags span{font-size:9.5px;color:var(--ink-3);border:1px solid var(--line);border-radius:999px;padding:2px 8px}

.err{position:absolute;left:8px;bottom:8px;font:10px/1.4 var(--mono);color:#b42318;background:#fff2f0;border:1px solid #ffccc7;padding:3px 6px;border-radius:4px}

@media (max-width:520px){
  .side{display:none}
  main{padding:12px;gap:10px}
  .shelf{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
  .cover{height:52px}
  .recent{display:none}
}
@media (prefers-reduced-motion:no-preference){
  .row,.book{transition:background-color .18s ease,transform .18s ease}
  .row:hover{transform:translateX(1px)}
}
`;

const RUNTIME = `
var P = window.__PAYLOAD__ || {src:'', dark:false};
var root = document.documentElement;
if (P.dark) root.setAttribute('data-theme','dark');

function hexToRgb(h){
  var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(h||'').trim());
  if (!m) return null;
  var s = m[1]; if (s.length === 3) s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
  return {r:parseInt(s.slice(0,2),16), g:parseInt(s.slice(2,4),16), b:parseInt(s.slice(4,6),16)};
}
function mix(a, b, w){
  var x = hexToRgb(a), y = hexToRgb(b);
  if (!x || !y) return a;
  var f = function(p, q){ return Math.round(p + (q - p) * w); };
  var hex = function(n){ return ('0' + n.toString(16)).slice(-2); };
  return '#' + hex(f(x.r,y.r)) + hex(f(x.g,y.g)) + hex(f(x.b,y.b));
}
function vars(name){ return getComputedStyle(root).getPropertyValue(name).trim(); }

var SPEC = {
  '主色':'accent','accent':'accent','强调色':'accent',
  '副色':'accent2','accent2':'accent2','次色':'accent2',
  '背景':'bg','bg':'bg','background':'bg',
  '字体':'font','font':'font',
  '文字':'ink','ink':'ink','文字色':'ink',
  '底色':'paper','paper':'paper','纸面':'paper',
  '圆角':'radius','radius':'radius'
};
var FONTS = {
  serif: 'var(--serif)', '衬线':'var(--serif)',
  round: 'var(--sans)', '圆体':'var(--sans)',
  mono: 'var(--mono)', '等宽':'var(--mono)',
  system: 'var(--sans)', '系统':'var(--sans)'
};

function parseSimple(text){
  var out = {};
  String(text||'').split(/\\r?\\n/).forEach(function(raw){
    var line = raw.trim();
    if (!line || line.indexOf('//') === 0 || line.indexOf('#') === 0) return;
    var m = /^([^:=]+?)\\s*[:=]\\s*(.+)$/.exec(line) || /^(\\S+)\\s+(.+)$/.exec(line);
    if (!m) return;
    var key = SPEC[m[1].trim().toLowerCase()] || SPEC[m[1].trim()];
    if (!key) return;
    out[key] = m[2].trim().replace(/^["']|["';]$/g, '');
  });
  return out;
}

function applySpec(s){
  var st = document.body.style;
  if (s.accent) {
    var rgb = hexToRgb(s.accent);
    st.setProperty('--accent', s.accent);
    st.setProperty('--accent-ink', s.accent);
    if (rgb) {
      st.setProperty('--accent-soft', mix(s.accent, '#FFFFFF', .88));
      st.setProperty('--accent-line', mix(s.accent, '#FFFFFF', .66));
    }
  }
  if (s.accent2) st.setProperty('--accent-2', s.accent2);
  if (s.paper) st.setProperty('--paper', s.paper);
  if (s.ink) st.setProperty('--ink', s.ink);
  if (s.font) st.setProperty('--app-font', FONTS[s.font] || ('"' + s.font + '", var(--sans)'));
  if (s.bg) st.setProperty('--theme-bg', /^https?:/i.test(s.bg) ? 'url("' + s.bg.replace(/["\\\\]/g, '') + '")' : 'none');
  if (s.bg && !/^https?:/i.test(s.bg)) st.setProperty('--paper', s.bg);
  if (s.radius != null && s.radius !== '') {
    var n = parseInt(s.radius, 10);
    if (isFinite(n)) { st.setProperty('--r', n + 'px'); st.setProperty('--r-lg', (n + 2) + 'px'); }
  }
}

function api(){
  return {
    el: root,
    get dark(){ return root.getAttribute('data-theme') === 'dark'; },
    vars: vars,
    setVar: function(name, value){
      if (!/^--[\\w-]+$/.test(String(name))) throw new Error('变量名不合法：' + name);
      root.style.setProperty(String(name), String(value == null ? '' : value));
    },
    css: function(text){
      var node = document.getElementById('theme-style');
      if (!node) { node = document.createElement('style'); node.id = 'theme-style'; document.head.appendChild(node); }
      node.textContent = String(text || '');
    },
    icon: function(){ /* 预览里没有图标表，静默忽略 */ }
  };
}

function run(){
  var src = String(P.src || '');
  try {
    if (/function\\s+theme\\s*\\(/.test(src)) {
      var factory = new Function('"use strict";\\n' + src + '\\n;return typeof theme === "function" ? theme : null;');
      var fn = factory();
      if (typeof fn !== 'function') throw new Error('没有定义 function theme(api)');
      fn(api());
    } else {
      applySpec(parseSimple(src));
    }
  } catch (e) {
    var box = document.createElement('div');
    box.className = 'err';
    box.textContent = '主题执行出错：' + e.message;
    document.body.appendChild(box);
  }
}
run();
`;

export function frameDocument() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>外观预览</title>
<style>${CSS}</style>
</head>
<body>
<div class="app">
  <aside class="side">
    <div class="brand"><i></i>水鱼文集</div>
    <nav>
      <a class="on"><svg viewBox="0 0 16 16"><path d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8v12H4a1.5 1.5 0 0 0-1.5 1.5z"/></svg>书架</a>
      <a><svg viewBox="0 0 16 16"><path d="M3 2.5h10v11H3z"/><path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3"/></svg>文章</a>
      <a><svg viewBox="0 0 16 16"><rect x="2.5" y="3" width="11" height="10" rx="1.5"/><path d="m3 11 3-3 2.5 2.5L11 7l2 2"/></svg>图片库</a>
      <a><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5.5"/><path d="M8 5v3l2 1.5"/></svg>网页检测</a>
      <a><svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2"/></svg>设置</a>
    </nav>
    <div class="me"><span class="ava">h</span><div><b>hg1</b><span>NAS · 已同步</span></div></div>
  </aside>
  <main>
    <div class="head">
      <h1>书架</h1>
      <div class="seg"><i class="on">全部</i><i>在读</i><i>想读</i></div>
    </div>
    <div class="shelf">
      <div class="book"><div class="cover">山月记</div><div class="t">山月记</div><div class="a">中岛敦</div></div>
      <div class="book"><div class="cover">夜航西飞</div><div class="t">夜航西飞</div><div class="a">柏瑞尔·马卡姆</div></div>
      <div class="book"><div class="cover">一个人的村庄</div><div class="t">一个人的村庄</div><div class="a">刘亮程</div></div>
      <div class="book"><div class="cover">程序设计实践</div><div class="t">程序设计实践</div><div class="a">Kernighan</div></div>
    </div>
    <div class="recent">
      <div class="hint"><span>最近阅读</span><span>3 篇</span></div>
      <div class="rows">
        <div class="row"><span class="n">夜航西飞</span><span class="m">读到 42% · 昨天</span><span class="bar" style="--p:42%"></span></div>
        <div class="row"><span class="n">山月记</span><span class="m">读到 88% · 三天前</span><span class="bar" style="--p:88%"></span></div>
        <div class="row"><span class="n">无用的知识</span><span class="m">刚开始 · 上周</span><span class="bar" style="--p:6%"></span></div>
        <div class="row"><span class="n">城与不确定的墙</span><span class="m">读到 17% · 上周</span><span class="bar" style="--p:17%"></span></div>
        <div class="row"><span class="n">读库 2203</span><span class="m">读完 · 上个月</span><span class="bar" style="--p:100%"></span></div>
      </div>
    </div>
    <div class="tags"><span>阅读</span><span>随笔</span><span>译文</span><span>笔记</span><span>长文</span></div>
  </main>
</div>
<script>${RUNTIME}</script>
</body>
</html>`;
}

/** 把主题源码塞进模板；<> 和 </script 都转义掉，免得提前闭合。 */
export function frameWith(source, dark) {
  const payload = JSON.stringify({ src: source, dark: !!dark })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  return frameDocument().replace('window.__PAYLOAD__ || {src:\'\', dark:false}', `(${payload})`);
}
