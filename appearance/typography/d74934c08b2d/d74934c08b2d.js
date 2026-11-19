function theme(api) {
  const href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600&display=swap';
  if (!document.querySelector('link[data-theme-font="source-serif"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.themeFont = 'source-serif';
    document.head.appendChild(link);
  }

  api.setVar('--serif', '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif');
  api.css(`
    .page-title, .prose, .article-body, .card-title {
      font-family: var(--serif);
      letter-spacing: .01em;
    }
    .prose, .article-body { font-size: 1.02em; line-height: 1.85; }
  `);
}
