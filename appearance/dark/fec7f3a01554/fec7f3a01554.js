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
