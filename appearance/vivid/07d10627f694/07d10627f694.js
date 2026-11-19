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
