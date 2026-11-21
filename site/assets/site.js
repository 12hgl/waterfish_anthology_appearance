/* 页面运行时：把主题塞进预览 iframe、切深浅色、复制下载地址。
   主题代码只在 iframe 里跑，父页面一行都不执行。 */

(function () {
  var node = document.getElementById('wf-frames');
  var data = node ? JSON.parse(node.textContent) : {};
  var frames = data.frames || {};

  var tplPromise = null;
  function template() {
    if (!tplPromise) {
      tplPromise = fetch('/assets/frame.html')
        .then(function (r) { return r.ok ? r.text() : ''; })
        .catch(function () { return ''; });
    }
    return tplPromise;
  }

  function payload(src, dark) {
    return JSON.stringify({ src: src, dark: !!dark })
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
  }

  function paint(frame, src, dark) {
    return template().then(function (doc) {
      if (!doc) return;
      frame.srcdoc = doc.replace('window.__PAYLOAD__', '(' + payload(src, dark) + ')');
    });
  }

  /* ---------- 预览窗 ---------- */

  var shells = [].slice.call(document.querySelectorAll('[data-shell]'));

  shells.forEach(function (shell) {
    var frame = shell.querySelector('iframe[data-frame]');
    if (!frame) return;
    var key = frame.getAttribute('data-frame');
    var item = frames[key];
    if (!item) return;

    var state = { src: item.src, dark: !!item.dark };
    frame.__state = state;
    paint(frame, state.src, state.dark);

    shell.querySelectorAll('[data-mode]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String((btn.getAttribute('data-mode') === 'dark') === state.dark));
      btn.addEventListener('click', function () {
        state.dark = btn.getAttribute('data-mode') === 'dark';
        shell.querySelectorAll('[data-mode]').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        paint(frame, state.src, state.dark);
      });
    });

    var label = shell.querySelector('.shot-bar .name');
    var sw = shell.querySelector('.switch');
    if (!sw) return;

    sw.querySelectorAll('[data-key]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = frames[btn.getAttribute('data-key')];
        if (!next) return;
        sw.querySelectorAll('[data-key]').forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });
        state.src = next.src;
        state.dark = !!next.dark;
        if (label) label.textContent = btn.getAttribute('data-label') || '';
        shell.querySelectorAll('[data-mode]').forEach(function (b) {
          b.setAttribute('aria-pressed', String((b.getAttribute('data-mode') === 'dark') === state.dark));
        });
        paint(frame, state.src, state.dark);
      });
    });
  });

  /* ---------- 复制下载地址 ---------- */

  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = new URL(btn.getAttribute('data-copy'), location.origin).href;
      var done = function () {
        var old = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(function () { btn.textContent = old; }, 1400);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });
})();
