function theme(api) {
  api.css(`
    @keyframes apBreath {
      0%, 100% { box-shadow: 0 0 0 1px var(--accent-line), 0 0 14px -8px var(--accent); }
      50%      { box-shadow: 0 0 0 1px var(--accent),      0 0 26px -4px var(--accent); }
    }
    .theme-card[aria-selected="true"],
    .theme-card.is-active,
    .card.is-selected {
      animation: apBreath 6s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .theme-card[aria-selected="true"],
      .theme-card.is-active,
      .card.is-selected {
        animation: none;
        box-shadow: 0 0 0 1px var(--accent);
      }
    }
  `);
}
