# SmartBet MoneyFlow — AI / Developer Handoff

> Last updated: 2026-09-15 (HK/Taipei time)
>
> **Read this file before modifying the site.** This project is already in production. Do **not** rebuild from scratch, replace it with an older ZIP/HTML, or remove existing features while adding a new one.

---

## 1. Project identity

### Production site
- URL: `https://smartbet-moneyflow-v1.vercel.app/`
- Current production is Git-driven from GitHub `main`.
- Vercel project: `smartbet-moneyflow-v1`
- Vercel Project ID: `prj_8Ge13fOf9Lg3PLPnOAZZuIRu4Jkv`
- Vercel Team ID: `team_mJ5jju2sCGaLW32TMJkgsVC1`

### GitHub
- Repository: `kwan0907/-`
- Production branch: `main`
- Pushing to `main` triggers Vercel production deployment automatically.

### Supabase
- Project ref: `ajnunehxtiofcphdyhqn`
- Public project URL: `https://ajnunehxtiofcphdyhqn.supabase.co`

### Important security rule
Never ask the user to paste or expose:
- Supabase service-role key
- cron / collector secret
- VAPID private key
- GitHub / Vercel token
- HKJC account credentials
- any password / session cookie

If write access is required, use the connected GitHub / Vercel / Supabase tools or proper OAuth / connector authorization.

---

## 2. Non-negotiable product rules

1. **Do not delete existing features when adding a new feature.**
2. **Do not use final race results to reconstruct fake historical T-minus states.**
3. If a snapshot does not exist, show `MISSING`, `NO SAMPLE`, `FUTURE`, or another honest unavailable state.
4. T-3 / T-1 AI locks must never be rewritten using post-race outcomes.
5. Signal Receipts are intended to be immutable evidence of what the model saw at that moment.
6. Backtests must be chronological / no-look-ahead.
7. `SmartFlow` / AI score = **signal / anomaly strength**, not win probability.
8. `0+ Late Flow` = delayed / continuing market-data or pool update around/after T0. It does **not** mean betting after the race has started is possible.
9. Analysis / replay / research is allowed. Do not build credential harvesting, auto-login, auto-confirm, or fully automated wagering.
10. Never claim profit or guaranteed accuracy. Use sample size, hit rate, ROI, drawdown, baseline comparisons and uncertainty.

---

## 3. Current user-facing feature set — preserve all of these

### Main / Dashboard
- Home Dashboard
- WIN / P / Q / QP pool cards
- Money Flow Radar
- Anomaly Top 5
- Cold horse opportunity ranking
- WIN odds distribution
- Horse cross-pool heatmap
- Race selector
- Mobile bottom navigation

### SmartFlow / bar chart
- SmartFlow vertical positive / negative bars
- `-100 → +100` anomaly scale
- T-17 / T-10 / T-5 / T-3 / T-1 / LIVE
- sorting by odds / SmartFlow / horse number
- P / Q / QP cross-pool evidence
- signal explanations

### AI
- AI 4 Picks
- T-3 Confirm
- T-1 Final Lock
- AI pick reasons / score / odds / popularity
- AI must not fabricate picks if there is no valid lock

### 0+ Late Flow
- red / orange / white late-flow states
- red bubble ranking on bar chart
- `STILL FLOWING`
- single-pool anomaly
- fade state
- T0 → latest SmartFlow change
- source pools / sync pool count / duration
- home 0+ Late Flow summary

### Race Day Control Room
- collector state
- snapshot count
- last snapshot time
- T-17 / T-10 / T-5 / T-3 / T-1 / T0 / T+1 / T+2 / T+3 / T+5 coverage
- AI T-3 and T-1 lock state
- MISSING detection
- 0+ availability

### Signal layer
- true same-odds-band anomaly
- `WEAK FAVORITE` / Fake Favorite
- `COLD SURGE`
- cross-pool confirmation matrix
- Priority Top 3
- event Alert Feed:
  - `NEW`
  - `SYNC`
  - `ACCEL`
  - `FADE`
  - `WEAK FAV`
  - `COLD SURGE`

### Research / evidence
- Signal Receipt archive
- immutable receipt protection
- Data Watchdog
- Notification Center
- browser / PWA push notifications
- Post-Race Auto Review
- Replay Pro
- Model / Threshold Lab
- Backtest Lab v2
- Research
- Health
- QuickBet link / entry

---

## 4. Current frontend architecture

The current site is not a single monolithic legacy HTML file. `index.html` loads the stable app payload, then applies versioned enhancement scripts.

Current script chain in production:

```text
dashboard-patch.js?v=0025
dashboard-v2.js?v=0038
dashboard-v3.js?v=rc1
dashboard-v4.js?v=sig1
dashboard-v8.js?v=mobile3
dashboard-v5.js?v=bt2
dashboard-v6.js?v=loop1
dashboard-v7.js?v=push1
```

### What each layer broadly does
- `dashboard-patch.js` — Dashboard + bottom navigation / core home UX
- `dashboard-v2.js` — visual refinements + 0+ home summary
- `dashboard-v3.js` — Race Day Control Room + lifecycle / timeline
- `dashboard-v4.js` — same-odds anomaly / Fake Favorite / Cold Surge signal UI
- `dashboard-v5.js` — Backtest Lab v2
- `dashboard-v6.js` — Receipt / Watchdog / notifications / Replay Pro / Model Lab UI
- `dashboard-v7.js` — background Push subscription UX
- `dashboard-v8.js` — **mobile guard + lazy heavy-module loading**

Do not blindly remove a patch because its filename looks old. First inspect what functionality it owns.

---

## 5. Mobile rules — extremely important

The user primarily tests on iPhone and has repeatedly reported layout regressions.

### Required behavior
- The page itself must **never move horizontally**.
- `html`, `body`, `.app`, `.view`, `.card` must stay within viewport width.
- iPhone safe areas must be respected.
- bottom navigation must not overlap the Home Indicator.
- Notification drawer must remain inside viewport.
- long horse names / labels must wrap or truncate safely.
- touch targets should be reasonably large.

### Intentional internal horizontal scrolling
These may scroll **inside their own card**, without widening the page:
- Heatmap
- Backtest tables
- Model Lab comparison tables
- lifecycle / timeline strips
- race selector / filter strips where necessary

### Current mobile guard
- file: `dashboard-v8.js`
- current version query: `mobile3`
- it locks page overflow while preserving internal data scrollers.
- it also lazily delays heavy API calls until Replay / Research / Health views are actually opened.

Do not undo this behavior when changing layout.

---

## 6. Performance / caching rules

Current intended cache behavior:

### `index.html`
- must be fresh / no-store
- latest production verified with `Cache-Control: no-store`

### versioned `dashboard-*.js`
- may use long immutable caching
- version query string must change when content changes if necessary

### `sw.js`
- must remain no-cache / no-store / must-revalidate
- Service Worker changes must be able to reach users without stale caching

### App startup
- app shell preconnects to Supabase
- avoid restoring the old six-part client-side payload loader pattern that previously caused slow / stuck startup
- do not make Home load every Research / Replay / Model API immediately

---

## 7. Backend architecture (Supabase)

Important Edge Functions currently used by the SmartBet ecosystem include:

- `smartbet-public-racing`
- `smartbet-app-payload`
- `smartbet-snapshot-collector`
- `smartbet-result-sync`
- `smartbet-ai-recommender`
- `smartbet-signal-engine`
- `smartbet-race-control`
- `smartbet-watchdog`
- `smartbet-postrace-review`
- `smartbet-research-feed`
- `smartbet-replay-pro`
- `smartbet-model-lab`
- `smartbet-notifications`
- `smartbet-push-subscribe`
- `smartbet-push-sender`
- Backtest v2 endpoint / logic used by the Backtest Lab

Before changing a function, retrieve its current deployed source first. Do not recreate it from memory.

---

## 8. Core database / research data

Important SmartBet data includes / has included:

- `smartbet_snapshots`
- `smartbet_results`
- `smartbet_ai_recommendations`
- Signal Receipt storage
- Watchdog event storage
- Notification outbox / delivery data
- Post-race review data
- Model version / threshold configuration
- Push subscriptions / deliveries

There are also research / coverage views and helper functions.

### Signal Receipt protection
A database trigger exists to enforce immutability of frozen Signal Receipts. Do not casually remove this trigger.

---

## 9. Scheduled jobs / live data flow

Known important cron jobs include:

```text
smartbet-result-sync-every-10-min    */10 * * * *
smartbet-watchdog-every-minute       * * * * *
smartbet-push-sender-every-minute    * * * * *
```

Snapshot collection also runs automatically around the race window.

### Snapshot collection intent
- starts around T-45
- retains data through approximately T+5
- stores genuine market snapshots
- if the market is not open / no valid odds exist, do not save fake zero-state signal data

### AI locking
- T-3 and T-1 are separate stages
- locked recommendations must be based only on information available at lock time

### Post-race flow
1. official result sync
2. result stored
3. post-race review joins outcome to previously frozen receipts / AI decisions
4. research / backtest metrics update from genuine evidence

---

## 10. Current model philosophy

### SmartFlow
SmartFlow is a heuristic anomaly / support index, approximately `-100 → +100`.

It is built from relative cross-pool support such as P / Q / QP versus the WIN baseline using robust normalization.

It must **not** be presented as a calibrated probability.

### Same-odds-band anomaly
A horse should be compared to genuinely similar WIN-odds neighbors, not merely the full-field average.

If there are not enough comparable neighbors, do not manufacture a band signal.

### Fake Favorite
A popular horse can be marked weak when WIN popularity is not confirmed by other pools.

### Cold Surge
A colder horse can be marked when strong, persistent, cross-pool confirmation exists.

### 0+ Late Flow
Use T0 and post-T0 snapshots to detect continued / delayed flow behavior.
It is for live/post-event analysis and must never contaminate a pre-race T-3 or T-1 AI decision.

---

## 11. Model / Threshold Lab

The current research workflow keeps a formal Active Model and Candidate models.

Known intent:
- `v1.0` = active / frozen baseline thresholds
- `v1.1-candidate` = stricter candidate for research comparison

A What-if run must never silently replace the Active Model.

The user should be able to compare candidates using genuine historical samples before promotion.

When sample size is zero or insufficient, display `NO SAMPLE`, null metrics, or an equivalent honest state.

---

## 12. Replay / backtesting rules

### Replay Pro
Replay must reconstruct the dashboard from stored snapshots at that time:
- pools
- Top 3
- SmartFlow bars
- P / Q / QP heatmap
- signal events

Final results should remain hidden until deliberately revealed in replay mode.

### Backtest Lab
Compare stages separately:
- T-17
- T-10
- T-5
- T-3
- T-1

Useful metrics include:
- sample size
- winner hit rate
- pick Top3 rate
- Top3 coverage
- theoretical WIN / PLACE ROI where data supports it
- max drawdown
- confidence interval
- comparison with favorite / market baseline

Do not optimize and evaluate on the same sample without clearly labeling it. Prefer chronological holdout / walk-forward when enough data exists.

---

## 13. Notifications / Push

### Site notification center
Stores important events such as:
- signal triggered
- AI locked
- Watchdog warning / critical
- 0+ Late Flow
- post-race review completed

### Background Web Push
- Service Worker: `sw.js`
- public VAPID key may be delivered to the browser
- private VAPID key must never be exposed to the frontend
- push sender runs server-side

### iPhone
For true background Web Push on iPhone, the site normally needs to be added to the Home Screen / used as a PWA and the user must grant notification permission themselves.

No AI can grant browser / OS notification permission on the user's behalf.

---

## 14. Safe update workflow for future AI / developer

When the user asks for a website change, follow this exact workflow:

1. Read this `SMARTBET_HANDOFF.md`.
2. Read current GitHub `main` files relevant to the requested feature.
3. Inspect current Vercel Production deployment.
4. Inspect current Supabase Edge Function / schema before changing backend logic.
5. Identify which existing feature owns the affected area.
6. Make the smallest compatible change.
7. Preserve all existing user-facing functionality unless the user explicitly asks to remove something.
8. Push the change to GitHub `main`.
9. Wait for Vercel Production to become `READY`.
10. Verify the actual production URL, not just the Git commit.
11. Check for runtime errors.
12. For mobile changes, verify no page-level horizontal overflow and preserve internal scrollers.
13. Report exactly what changed and what was verified.

---

## 15. Do not repeat previous failures

### Failure pattern: simplified emergency version removed features
Previously, an emergency/mobile fix temporarily removed AI, the detailed bar chart and menu functionality.

**Lesson:** never solve one bug by replacing Production with a minimal page unless the user explicitly approves losing features.

### Failure pattern: broad global `window.error` handler
A generic iOS / injected `Script error.` was once misclassified as an app crash and replaced valid UI with a red error screen.

**Lesson:** do not use destructive global error handlers for generic cross-origin / opaque `Script error.` events.

### Failure pattern: Vercel route returned HTML instead of JSON
Frontend JSON parsing once received `<!DOCTYPE ...>` from a missing route.

**Lesson:** API clients should check response text/content type and give a controlled error rather than crash.

### Failure pattern: multi-part loader stuck on Loading
A previous multi-part client payload loader could hang indefinitely.

**Lesson:** keep startup dependency count small; use timeout + explicit retry/error UI.

### Failure pattern: `</script>` inside loader string
An embedded `</script>` string once caused the browser HTML parser to terminate the outer script early.

**Lesson:** escape embedded closing script tags as `<\/script>` when building script markup inside HTML script content.

### Failure pattern: mobile page widened by internal tables
Heatmap / Backtest / Model Lab min-width elements once widened the entire page.

**Lesson:** page width must remain locked; wide data belongs in an internal horizontal scroller only.

---

## 16. Quick production smoke test

After every meaningful update, verify at least:

### Frontend
- Production homepage returns HTTP 200
- Home loads instead of remaining on `Loading app…`
- Home + SmartFlow / bar chart are directly accessible
- bottom navigation fits mobile viewport
- page does not move horizontally on iPhone width
- internal Heatmap / Backtest / Timeline scrollers still work

### Core data
- current race / meeting can be resolved
- unopened market does not create fake anomaly data
- Signal Engine returns a controlled `market-not-ready` state when appropriate

### Research
- Research Feed responds
- Replay Pro responds
- Model Lab responds
- Backtest responds
- no sample → null / NO SAMPLE, never fabricated metrics

### Automation
- Watchdog cron succeeds
- result sync cron succeeds
- push sender cron succeeds

### Vercel
- latest GitHub main commit deploys to `production`
- deployment state = `READY`
- no new runtime errors

---

## 17. How the user should start a future AI chat

The user can simply say:

> 請先讀 GitHub `kwan0907/-` main branch 的 `SMARTBET_HANDOFF.md`，再接手 SmartBet。不要由零重建，不要刪現有功能。先檢查現在 Production / GitHub / Supabase，再按我的新要求修改，完成後直接 push main、等 Vercel production READY，並驗證正式網址。
>
> 我的新要求是：＿＿＿＿＿＿＿＿。

If the AI cannot access GitHub / Supabase / Vercel, it should say exactly which connector needs authorization rather than asking the user to paste secrets.

---

## 18. Current priority

The system already has a large feature set. The next priority is **race-day evidence quality and validation**, not adding random visual widgets.

After genuine race-day samples accumulate, focus on:
- snapshot completeness
- signal false-positive rate
- SmartFlow vs favorite baseline
- Cold Surge performance
- Same-Odds Band performance
- Weak Favorite avoidance value
- T-3 vs T-1 comparison
- 0+ descriptive value (kept separate from pre-race decision logic)
- v1.0 vs candidate models
- drawdown and sample-size discipline

Only promote a model threshold change after enough genuine data exists.
