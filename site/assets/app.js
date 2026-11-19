/* 站点前端脚本：填充预览 iframe、切换深浅色、复制代码。没有框架，也没有依赖。 */
(function () {
  'use strict';

  const dataEl = document.getElementById('appearance-data');
  const DATA = dataEl ? JSON.parse(dataEl.textContent) : { previews: {} };

  let tplPromise = null;
  function template() {
    if (!tplPromise) {
      tplPromise = fetch('/assets/preview.html')
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error('预览模板加载失败'))))
        .catch((err) => {
          console.warn(err);
          return '';
        });
    }
    return tplPromise;
  }

  function safeJson(obj) {
    return JSON.stringify(obj)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
  }

  async function render(frame, source, dark) {
    const tpl = await template();
    if (!tpl) return;
    const doc = tpl
      .replace('__APPEARANCE_PAYLOAD__', () => safeJson({ src: source }))
      .replace(/__APPEARANCE_MODE__/g, () => (dark ? 'dark' : 'light'));
    frame.srcdoc = doc;
  }

  /* 预览跟着站点深浅走：主题本身只支持浅色就别硬切 */
  const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  function initialDark(item) {
    if (item.mode === 'light') return false;
    if (item.mode === 'dark') return true;
    return preferDark;
  }

  /* 首页/详情页的预览挂载 */
  const frames = [].slice.call(document.querySelectorAll('iframe[data-preview]'));
  frames.forEach((frame) => {
    const key = frame.dataset.preview;
    const item = DATA.previews[key];
    if (!item) return;
    const dark = initialDark(item);
    frame._appearance = { source: item.source, dark };
    const shell = frame.closest('.preview-shell');
    if (shell) {
      shell.querySelectorAll('[data-mode]').forEach((b) => {
        b.setAttribute('aria-pressed', String((b.dataset.mode === 'dark') === dark));
      });
    }
    render(frame, item.source, dark);
  });

  /* 深浅色切换 */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-mode]');
    if (!btn) return;
    const shell = btn.closest('.preview-shell');
    if (!shell) return;
    const frame = shell.querySelector('iframe[data-preview]');
    if (!frame) return;
    const dark = btn.dataset.mode === 'dark';
    shell.querySelectorAll('[data-mode]').forEach((b) => {
      b.setAttribute('aria-pressed', String((b.dataset.mode === 'dark') === dark));
    });
    if (frame._appearance) frame._appearance.dark = dark;
    if (frame.contentWindow) {
      frame.contentWindow.postMessage({ type: 'appearance:theme', dark: dark }, '*');
    }
  });

  /* 首页主题切换条 */
  const switcher = document.querySelector('[data-switcher]');
  if (switcher) {
    switcher.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-key]');
      if (!btn) return;
      const item = DATA.previews[btn.dataset.key];
      if (!item) return;
      switcher.querySelectorAll('button[data-key]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      const shell = document.querySelector('.preview-shell');
      const frame = shell && shell.querySelector('iframe');
      const label = shell && shell.querySelector('.preview-bar .name');
      if (label) label.textContent = btn.dataset.label || '';
      if (frame) {
        const dark = initialDark(item);
        const shellEl = frame.closest('.preview-shell');
        if (shellEl) {
          shellEl.querySelectorAll('[data-mode]').forEach((b) => {
            b.setAttribute('aria-pressed', String((b.dataset.mode === 'dark') === dark));
          });
        }
        render(frame, item.source, dark);
      }
    });
  }

  /* 复制代码 */
  document.addEventListener('click', async function (e) {
    const btn = e.target.closest('[data-copy]');
    if (!btn) return;
    const target = document.querySelector(btn.dataset.copy);
    if (!target) return;
    const text = target.textContent;
    try {
      await navigator.clipboard.writeText(text);
      const old = btn.textContent;
      btn.textContent = '已复制';
      setTimeout(() => (btn.textContent = old), 1400);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(target);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      btn.textContent = '已选中，按 ⌘C';
    }
  });

  /* 首屏上浮交给 CSS（见 style.css 的 .hero 动画），这里只管交互 */
})();
