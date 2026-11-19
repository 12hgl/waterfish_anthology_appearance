function theme(api) {
  api.css(`
    @property --apAngle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }
    .card, .theme-card { position: relative; isolation: isolate; }
    .card::before, .theme-card::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      padding: 1px;
      background: conic-gradient(from var(--apAngle),
        transparent 0deg, var(--accent) 40deg, transparent 90deg, transparent 360deg);
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      animation: apSpin 8s linear infinite;
      pointer-events: none;
      z-index: 1;
    }
    .card:hover::before, .theme-card:hover::before { animation-duration: 2.4s; }
    @keyframes apSpin { to { --apAngle: 360deg; } }

    @media (prefers-reduced-motion: reduce) {
      .card::before, .theme-card::before { animation: none; opacity: .35; }
    }
  `);
}
