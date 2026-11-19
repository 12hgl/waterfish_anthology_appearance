function theme(api) {
  api.css(`
    .card, .record, .theme-card {
      transition: transform .22s cubic-bezier(.2,.7,.3,1),
                  box-shadow .22s cubic-bezier(.2,.7,.3,1);
      will-change: transform;
    }
    .card:hover, .record:hover, .theme-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 6px -2px rgba(0,0,0,.10), 0 14px 28px -18px rgba(0,0,0,.45);
    }
    .card:active, .record:active { transform: translateY(0); transition-duration: .08s; }

    .theme-card { animation: apLift .28s cubic-bezier(.2,.7,.3,1) both; }
    .theme-card:nth-child(2) { animation-delay: .03s; }
    .theme-card:nth-child(3) { animation-delay: .06s; }
    .theme-card:nth-child(4) { animation-delay: .09s; }
    .theme-card:nth-child(5) { animation-delay: .12s; }
    .theme-card:nth-child(6) { animation-delay: .15s; }
    @keyframes apLift {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
      .card, .record, .theme-card { transition: none !important; animation: none !important; }
      .card:hover, .record:hover, .theme-card:hover { transform: none !important; }
    }
  `);
}
