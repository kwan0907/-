# SmartBet MoneyFlow — AI / Developer Handoff

> Last updated: 2026-09-16 (HK/Taipei time)
>
> **Read this file before modifying the site.** This project is already in production. Do **not** rebuild from scratch, replace it with an older ZIP/HTML, or remove existing features while adding a new one.
>
> Q Banker integration note: Production keeps the full SmartBet app as the primary shell. The Q Banker v2.1 module is integrated additively through `dashboard-v9-qbanker.js` and `/qbanker.html`. Do not replace the main app shell with the standalone Q Banker page.

---

## Core preservation rules

- Preserve the full existing SmartBet dashboard, SmartFlow, AI locks, 0+ Late Flow, Race Day Control Room, Signal Receipt archive, Data Watchdog, notifications, Replay Pro, Model Lab, Backtest Lab v2, Research and Health.
- `dashboard-v9-qbanker.js` adds a Q膽 entry and lazy-loads `/qbanker.html` inside the full SmartBet app.
- `/qbanker.html` contains the Q Banker module with WIN odds heatmap sorting, `WIN冷 / Q-QP熱` filtering, Q膽候選 scoring, Q/QP banker-leg selection, WIN/P selection, stake allocation, Betline handoff and official-result history tools.
- Q Banker APIs are `/api/racing` and `/api/history`; these are additive and must not replace the Supabase SmartBet backend.
- Never fabricate missing historical Money Flow snapshots.
- Never auto-login, auto-confirm or place bets on behalf of the user.

## Current production architecture

The primary app shell is loaded from `smartbet-app-payload` and enhanced by:

```text
dashboard-patch.js?v=0025
dashboard-v2.js?v=0038
dashboard-v3.js?v=rc1
dashboard-v4.js?v=sig1
dashboard-v8.js?v=mobile3
dashboard-v5.js?v=bt2
dashboard-v6.js?v=loop1
dashboard-v7.js?v=push1
dashboard-v9-qbanker.js?v=qb1
```

The Q Banker standalone module uses:

```text
qbanker.html
app-base.css
app-extra.css
app-core.js
app-flow.js
app-bet.js
app-bind.js
app-history.js
api/racing.js
api/history.js
```

## Mobile rules

- Page-level horizontal scrolling is not allowed.
- Internal data tables / heatmaps may scroll within their own cards.
- Keep iPhone safe-area padding.
- The Q Banker iframe must stay within viewport width and must not break the existing bottom navigation.

## Safe update workflow

1. Read this handoff file.
2. Inspect current `main` and production deployment.
3. Make the smallest additive change.
4. Preserve all existing features.
5. Verify Production after Vercel reaches READY.
6. Check the primary homepage, Q Banker tab, `/api/racing`, `/api/history`, and mobile overflow.

## Product objective

The Q Banker module is intended to surface colder horses whose WIN popularity is weak but Q/QP/P cross-pool support is unusually strong, with the practical research goal of identifying candidates more likely to finish 1st/2nd for Quinella-style banker strategies. Scores are research signals, not calibrated probabilities or guarantees.
