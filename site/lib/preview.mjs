/**
 * 预览文档：在 sandbox iframe 里渲染一块仿真的文集界面，然后真的执行主题 JS。
 *
 * 为什么不用截图：主题是活的，动效、hover、深浅色分支都得跑起来才看得出差别。
 * 为什么用 sandbox="allow-scripts"（不给 allow-same-origin）：主题代码是不认识的投稿，
 * 这里给它一个没有源、没有 cookie、没有 localStorage、碰不到父页面的环境。
 */

const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box}
:root{
  --paper:#FBFAF7; --surface:#FFFFFF; --surface-2:#F3F1EA; --surface-3:#EAE7DE;
  --line:#E4E0D5; --line-strong:#CFC9BA;
  --ink:#22201C; --ink-2:#55514A; --ink-3:#8A857A;
  --accent:#1F6C9F; --accent-ink:#1F6C9F; --accent-soft:#E8F1F7; --accent-line:#C6DCEA;
  --btn-bg:#1F6C9F; --btn-ink:#FFFFFF;
  --r-sm:8px; --r:12px; --r-lg:18px;
  --serif:"Songti SC","Source Han Serif SC","Noto Serif CJK SC","Noto Serif SC",Georgia,serif;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei","Source Han Sans SC","Noto Sans CJK SC",sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,"Noto Sans Mono CJK SC",monospace;
  color-scheme:light;
}
:root[data-theme="dark"]{
  --paper:#16151A; --surface:#1D1C22; --surface-2:#24232A; --surface-3:#2C2B33;
  --line:#33323A; --line-strong:#45444F;
  --ink:#E6E3DA; --ink-2:#ABA69B; --ink-3:#7B766C;
  --accent:#6FB3D9; --accent-ink:#93C8E6; --accent-soft:#1A2A34; --accent-line:#2C4658;
  --btn-bg:#6FB3D9; --btn-ink:#0D1A22;
  color-scheme:dark;
}
html,body{margin:0;height:100%}
body{
  background:var(--paper);color:var(--ink);font-family:var(--sans);
  font-size:13px;line-height:1.6;-webkit-font-smoothing:antialiased;
  overflow:hidden;
}
.app{display:flex;height:100%;min-height:100%}

/* 侧栏 */
.side{
  width:150px;flex:none;border-right:1px solid var(--line);
  background:var(--surface-2);display:flex;flex-direction:column;
  padding:13px 10px;gap:14px;
}
.logo{display:flex;align-items:center;gap:7px;font-weight:600;font-size:13px;letter-spacing:.02em}
.logo i{width:14px;height:14px;border-radius:4px;background:var(--accent);display:block;opacity:.85}
.side nav{display:flex;flex-direction:column;gap:2px}
.side nav a{
  display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:var(--r-sm);
  color:var(--ink-2);text-decoration:none;font-size:12.5px;
}
.side nav a.on{background:var(--accent-soft);color:var(--accent-ink);font-weight:600}
.side nav a.on::before{
  content:"";position:absolute;left:0;width:2px;height:14px;background:var(--accent);
  border-radius:0 2px 2px 0;
}
.side nav a{position:relative}
.ico{width:14px;height:14px;display:block;flex:none;color:currentColor}
.ico svg{width:14px;height:14px;display:block}
.user{
  margin-top:auto;display:flex;align-items:center;gap:8px;padding:7px 8px;
  border-radius:var(--r-sm);background:var(--surface);border:1px solid var(--line);
}
.av{
  width:20px;height:20px;border-radius:50%;background:var(--accent);color:#fff;
  display:grid;place-items:center;font-size:10px;flex:none;
}
.uinfo{min-width:0}
.uinfo b{display:block;font-size:11.5px;line-height:1.3}
.uinfo em{font-style:normal;font-size:10px;color:var(--ink-3)}

/* 主区 */
main{flex:1;min-width:0;padding:16px 22px 0;overflow:hidden}
.topline{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.page-title{font-family:var(--serif);font-size:19px;margin:0;letter-spacing:.01em;font-weight:600}
.tabs{margin-left:auto;display:flex;gap:6px}
.tabs span{
  font-size:11px;padding:3px 8px;border-radius:20px;border:1px solid var(--line);
  color:var(--ink-3);
}
.tabs span.on{background:var(--accent-soft);border-color:var(--accent-line);color:var(--accent-ink)}

.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:9px;margin-bottom:16px}
.card{
  border:1px solid var(--line);border-radius:var(--r);background:var(--surface);
  overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.03);
}
.cover{
  height:74px;padding:9px 10px;display:flex;align-items:flex-end;
  background:linear-gradient(155deg,var(--c1,#31586F),var(--c2,#8FAFC4));
  color:#fff;font-family:var(--serif);font-size:12px;letter-spacing:.04em;
  text-shadow:0 1px 3px rgba(0,0,0,.28);
}
.card h3{font-size:11.5px;margin:8px 10px 2px;font-weight:600;letter-spacing:0}
.card p{font-size:10px;color:var(--ink-3);margin:0 10px 9px}

.sec-t{display:flex;align-items:baseline;gap:8px;margin:0 0 8px}
.sec-t h2{font-size:12px;margin:0;font-weight:600;letter-spacing:.04em;color:var(--ink-2)}
.sec-t small{font-size:10px;color:var(--ink-3);margin-left:auto}

.record{
  display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--r-sm);
  border:1px solid var(--line);background:var(--surface);margin-bottom:6px;
}
.record .ri{width:3px;height:22px;border-radius:2px;background:var(--accent);opacity:.75;flex:none}
.record .rt{min-width:0;flex:1}
.record b{display:block;font-size:11.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.record small{font-size:10px;color:var(--ink-3)}
.record .bar{width:56px;height:3px;border-radius:2px;background:var(--surface-3);flex:none;overflow:hidden}
.record .bar i{display:block;height:100%;background:var(--accent);border-radius:2px}

.err{
  position:absolute;left:0;right:0;bottom:0;background:#3a1d1a;color:#ffd9d3;
  font-family:var(--mono);font-size:10.5px;padding:6px 10px;
  border-top:1px solid #6b2f28;
}
.err b{color:#ffb3a7}

.think{position:absolute;right:10px;bottom:8px;font-size:10px;color:var(--ink-3);opacity:.7}

@media (max-width:420px){
  .side{display:none}
  .cards{grid-template-columns:repeat(auto-fill,minmax(90px,1fr))}
  main{padding:12px 12px 0}
}
`;

const ICONS = {
  shelf: '<path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H9v16H4.5A1.5 1.5 0 0 1 3 18.5z"/><path d="M11 4h4.5A1.5 1.5 0 0 1 17 5.5v13A1.5 1.5 0 0 1 15.5 20H11z"/><path d="M19 6l2 .5-3 13-2-.5z"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h4"/>',
  tag: '<path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
};

function icon(name) {
  const p = ICONS[name] || '';
  return `<span class="ico" data-icon="${name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${p}</svg></span>`;
}

const BOOKS = [
  ['山月记', '中岛敦', '#2E5A7A', '#8FB3C9'],
  ['夜航西飞', '柏瑞尔·马卡姆', '#5A3E2B', '#C2A184'],
  ['一个人的村庄', '刘亮程', '#3C5240', '#A8BE9E'],
  ['程序设计实践', 'Kernighan', '#33334A', '#9A9AB8'],
];

const RECORDS = [
  ['夜航西飞', '读到 42% · 昨天', 42],
  ['山月记', '读到 88% · 三天前', 88],
  ['无用的知识', '刚开始 · 上周', 6],
];

export function renderPreviewDocument({ source = '', dark = false, name = '', placeholder = false } = {}) {
  const payload = placeholder
    ? '__APPEARANCE_PAYLOAD__'
    : JSON.stringify({ src: source })
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
  const mode = placeholder ? '__APPEARANCE_MODE__' : dark ? 'dark' : 'light';

  return `<!doctype html>
<html lang="zh-CN" data-theme="${mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(name || '外观预览')}</title>
<style>${BASE_CSS}</style>
</head>
<body>
<div class="app">
  <aside class="side">
    <div class="logo"><i></i>水鱼文集</div>
    <nav>
      <a href="#" onclick="return false" class="on">${icon('shelf')}书架</a>
      <a href="#" onclick="return false">${icon('doc')}文章</a>
      <a href="#" onclick="return false">${icon('tag')}标签</a>
      <a href="#" onclick="return false">${icon('trash')}回收站</a>
    </nav>
    <div class="user">
      <span class="av">湖</span>
      <div class="uinfo"><b>hgl</b><em>NAS · 已同步</em></div>
    </div>
  </aside>
  <main>
    <div class="topline">
      <h1 class="page-title">书架</h1>
      <div class="tabs"><span class="on">全部</span><span>在读</span><span>想读</span></div>
    </div>
    <div class="cards">
      ${BOOKS.map(
        ([t, a, c1, c2]) => `<article class="card">
        <div class="cover" style="--c1:${c1};--c2:${c2}">${t}</div>
        <h3>${t}</h3><p>${a}</p>
      </article>`,
      ).join('\n')}
    </div>
    <div class="sec-t"><h2>最近阅读</h2><small>3 条</small></div>
    ${RECORDS.map(
      ([t, m, p]) => `<div class="record">
      <span class="ri"></span>
      <div class="rt"><b>${t}</b><small>${m}</small></div>
      <span class="bar"><i style="width:${p}%"></i></span>
    </div>`,
    ).join('\n')}
  </main>
</div>
<script id="theme-src" type="application/json">${payload}</script>
<script>
(function(){
  var html = document.documentElement;
  var raw = '';
  try { raw = JSON.parse(document.getElementById('theme-src').textContent).src || ''; } catch (e) {}

  var injected = [];
  var varBackup = new Map();
  var iconBackup = new Map();
  var bodyBackup = { done: false, image: '', size: '', position: '' };

  function rememberVar(name){
    if (!varBackup.has(name)) varBackup.set(name, html.style.getPropertyValue(name));
  }

  function reset(){
    injected.forEach(function(el){ el.remove(); });
    injected = [];
    varBackup.forEach(function(old, name){
      if (old) html.style.setProperty(name, old);
      else html.style.removeProperty(name);
    });
    varBackup.clear();
    iconBackup.forEach(function(htmlStr, el){ el.innerHTML = htmlStr; });
    iconBackup.clear();
    if (bodyBackup.done){
      document.body.style.backgroundImage = bodyBackup.image;
      document.body.style.backgroundSize = bodyBackup.size;
      document.body.style.backgroundPosition = bodyBackup.position;
      bodyBackup = { done: false, image: '', size: '', position: '' };
    }
    var err = document.querySelector('.err');
    if (err) err.remove();
  }

  function setIcon(name, svg){
    var nodes = document.querySelectorAll('[data-icon="' + name + '"]');
    for (var i = 0; i < nodes.length; i++){
      var el = nodes[i];
      if (!iconBackup.has(el)) iconBackup.set(el, el.innerHTML);
      var body = String(svg || '').trim();
      el.innerHTML = /^<svg/i.test(body)
        ? body
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
    }
  }

  function fail(err){
    reset();
    var box = document.createElement('div');
    box.className = 'err';
    box.innerHTML = '<b>主题执行出错，已回退到内置外观：</b> ' + String(err && err.message || err).slice(0, 160);
    document.body.appendChild(box);
  }

  var KEYMAP = {
    '主色':'accent','副色':'accent2','背景':'bg','字体':'font','文字':'ink','底色':'paper','圆角':'radius',
    'accent':'accent','accent2':'accent2','bg':'bg','font':'font','ink':'ink','paper':'paper','radius':'radius'
  };

  function mix(color, pct, toward){
    return 'color-mix(in srgb, ' + color + ' ' + pct + '%, ' + toward + ')';
  }

  function applySimple(src){
    var dark = html.dataset.theme === 'dark';
    function sv(name, val){
      rememberVar(name);
      html.style.setProperty(name, String(val));
    }
    var lines = src.split('\\n');
    for (var i = 0; i < lines.length; i++){
      var t = lines[i].trim();
      if (!t || /^(\\/\\/|#)/.test(t)) continue;
      var m = t.match(/^([^\\s:=]+)\\s*[:=]?\\s*(.+)$/);
      if (!m) continue;
      var k = KEYMAP[m[1].trim()];
      var v = m[2].trim();
      if (!k || !v) continue;
      if (k === 'accent'){
        sv('--accent', v);
        sv('--accent-ink', v);
        sv('--btn-bg', v);
      } else if (k === 'accent2'){
        sv('--accent-soft', mix(v, 14, dark ? '#141414' : '#ffffff'));
        sv('--accent-line', mix(v, 34, dark ? '#141414' : '#ffffff'));
      } else if (k === 'bg'){
        if (/^(https?:)?\\/\\//.test(v) || /^url\\(/.test(v)){
          if (!bodyBackup.done){
            bodyBackup.image = document.body.style.backgroundImage;
            bodyBackup.size = document.body.style.backgroundSize;
            bodyBackup.position = document.body.style.backgroundPosition;
            bodyBackup.done = true;
          }
          document.body.style.backgroundImage = /^url\\(/.test(v) ? v : 'url("' + v + '")';
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center';
        } else {
          sv('--paper', v);
        }
      } else if (k === 'paper'){
        sv('--paper', v);
      } else if (k === 'ink'){
        sv('--ink', v);
      } else if (k === 'radius'){
        var r = parseInt(v, 10);
        if (!isNaN(r)){
          sv('--r-sm', Math.round(r * 0.6) + 'px');
          sv('--r', r + 'px');
          sv('--r-lg', Math.round(r * 1.5) + 'px');
        }
      } else if (k === 'font'){
        if (v === 'serif') sv('--sans', '"Songti SC","Source Han Serif SC","Noto Serif SC",Georgia,serif');
        else if (v === 'mono') sv('--sans', 'ui-monospace,"SF Mono",Menlo,Consolas,monospace');
        else if (v === 'round') sv('--sans', '"Yuanti SC","Hiragino Sans GB","PingFang SC",sans-serif');
        else if (v === 'system') sv('--sans', '-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif');
        else sv('--sans', '"' + v + '",' + '-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif');
      }
    }
  }

  function apply(){
    reset();
    if (!raw.trim()) return;
    try {
      if (/function\\s+theme\\s*\\(/.test(raw)) {
        var api = {
          setVar: function(name, value){
            if (typeof name !== 'string' || name.indexOf('--') !== 0) return;
            rememberVar(name);
            html.style.setProperty(name, String(value));
          },
          css: function(text){
            var s = document.createElement('style');
            s.setAttribute('data-theme-style', '1');
            s.textContent = String(text || '');
            document.head.appendChild(s);
            injected.push(s);
          },
          icon: setIcon,
          el: html,
          vars: function(name){ return getComputedStyle(html).getPropertyValue(name).trim(); }
        };
        Object.defineProperty(api, 'dark', { get: function(){ return html.dataset.theme === 'dark'; } });
        new Function('api', raw)(api);
      } else {
        applySimple(raw);
      }
    } catch (e) {
      fail(e);
    }
  }

  window.addEventListener('message', function(e){
    var d = e.data;
    if (!d || d.type !== 'appearance:theme') return;
    html.dataset.theme = d.dark ? 'dark' : 'light';
    apply();
  });

  apply();
})();
</script>
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
