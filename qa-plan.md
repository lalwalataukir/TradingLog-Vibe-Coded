# TradeLog Mobile QA Plan

## Summary
- Source of truth for QA: [prd.md](/Users/taukirlalwala/Desktop/TradingLog-Vibe-Coded/prd.md), [code-plan.md](/Users/taukirlalwala/Desktop/TradingLog-Vibe-Coded/code-plan.md), the current app data flow in [app-data-provider.tsx](/Users/taukirlalwala/Desktop/TradingLog-Vibe-Coded/mobile/providers/app-data-provider.tsx), and the persistence layer in [repositories.ts](/Users/taukirlalwala/Desktop/TradingLog-Vibe-Coded/mobile/db/repositories.ts).
- Objective: certify the Expo mobile app for iOS and Android across functional correctness, data integrity, offline behavior, native UX, accessibility, performance, exports, and release readiness.
- Current repo baseline: only static verification exists via `typecheck` in [package.json](/Users/taukirlalwala/Desktop/TradingLog-Vibe-Coded/mobile/package.json); no unit, integration, UI, E2E, accessibility, or performance harness is configured yet.
- QA runs in two tracks:
  - `Current-build QA` for features already implemented in the mobile app.
  - `Release QA` for planned but incomplete features: CSV import, screenshot attachments, full rules CRUD, and full chart implementations.

## QA Coverage
- Static/dev QA: gate every mobile change on `typecheck`, linting, route integrity, and CI pass/fail status.
- Unit QA: validate calculations, formatting, analytics derivations, CSV serialization, defaults, and date/timezone helpers.
- Integration QA: validate DB migrations, first-run bootstrap, seeding, repository CRUD, rule-check persistence, journal updates, settings persistence, and export file generation.
- UI/component QA: validate route rendering, loading states, empty states, error states, chips, segmented tabs, keyboard behavior, safe-area layout, and tab/stack navigation.
- E2E QA: validate first launch, seeded data visibility, open-trade creation, close-trade completion, dashboard refresh, analytics refresh, journal save, rule toggle, settings save, JSON export, CSV export, and persistence after restart.
- Design QA: validate hierarchy, spacing, typography, color semantics, dark-theme consistency, chart readability, small-screen behavior, and touch-target sizing against the PRD and design references.
- UAT QA: validate realistic trader workflows end to end, including logging a trade, reviewing it, journaling the day, and using analytics to interpret behavior.
- Regression QA: maintain a small smoke pack for every PR and a full regression pack for beta and release candidate builds.
- Exploratory QA: target state-heavy flows where navigation, calculations, and persistence interact, especially log-trade, close-trade, analytics, and exports.
- Compatibility QA: validate iOS and Android parity for navigation, storage, keyboard types, file sharing, and long-list behavior.
- Offline/reliability QA: validate full core usage in airplane mode, app restart, background/foreground transitions, and interrupted export scenarios.
- Accessibility QA: validate screen-reader labels, focus order, dynamic text, contrast, touch targets, reduced-motion tolerance, and form error clarity.
- Performance QA: validate cold start, dashboard load, analytics tab switching, trade list scrolling, close-trade save latency, and export latency on seeded and large datasets.
- Security/privacy QA: validate local-only data expectations, export payload contents, absence of sensitive leakage in errors, and safe app-local file handling once attachments exist.

## Feature Test Matrix
- App bootstrap and persistence: migration idempotency, seed-once behavior, reinstall behavior, reopen persistence, and no duplicate seed rows.
- Dashboard: KPI correctness, recent-trade ordering, P&L color semantics, route links to rules/settings/detail, and chart behavior with sparse and full data.
- Trade log: filters, counts, ordering, open vs closed labeling, list-to-detail navigation, and correct refresh after create/close actions.
- Log trade wizard: all four steps, back/continue state retention, numeric inputs, planned R:R, position sizing, default market usage, required-field behavior, symbol normalization, and save-as-open-trade persistence.
- Trade detail: open vs closed rendering, thesis/review fallbacks, metric correctness, and close-trade CTA visibility.
- Close trade: live P&L preview, percentage math, followed-plan behavior, mistake-tag persistence, rating bounds, idempotent close handling, and downstream refresh on dashboard, analytics, trade log, and journal.
- Analytics: every displayed metric against known fixtures, tab switching, chart-shell rendering with empty/sparse/large data, streak logic, emotion aggregation, setup aggregation, and days-since-rule-violation logic.
- Journal: latest-entry binding, text persistence, auto-derived daily P&L/trade count, same-day trade list, and stale-state prevention after saves or trade changes.
- Rules: active/paused toggle persistence, violation counts, days-since-last-violation logic, and deferred CRUD coverage once create/edit/delete UI exists.
- Settings and backup: capital save flow, persistence after restart, JSON payload completeness, CSV header/escaping correctness, share-sheet invocation, and repeat export behavior.
- Planned-but-not-yet-built features: keep placeholder cases for CSV import, screenshot attachments, full rules CRUD, and full chart visualizations, but do not mark them passed until code exists.

## Test Data, Environments, and Gates
- Test data sets:
  - `Seeded baseline` from [seed.ts](/Users/taukirlalwala/Desktop/TradingLog-Vibe-Coded/mobile/db/seed.ts) for happy-path verification.
  - `Edge pack` with zero trades, only open trades, all-loss streaks, extreme prices/quantities, long text, duplicate-like symbols, invalid closes, and negative capital drift.
  - `Scale pack` with 1,000+ trades and 365 journal entries for performance and aggregation checks.
- Device matrix:
  - Smoke: one current iPhone simulator and one current Pixel emulator.
  - Full regression: one physical iPhone and one physical Android mid-tier device.
  - Layout/accessibility spot checks: one small-screen phone class and one large-screen phone class.
- Entry criteria: feature implemented, acceptance criteria traceable to PRD, stable seed data, no blocker crashes on launch, and installable dev builds on both platforms.
- Exit criteria for release candidate: all smoke, functional, regression, accessibility, export, and offline suites pass; no open P0/P1 defects; P2 defects waived explicitly if any; displayed financial metrics match approved oracle values; UAT sign-off completed.

## QA Interfaces and Assumptions
- No production API changes are required for QA; QA-specific interfaces to add during execution are test scripts in [package.json](/Users/taukirlalwala/Desktop/TradingLog-Vibe-Coded/mobile/package.json) such as `test:unit`, `test:integration`, `test:e2e`, `test:accessibility`, and `test:perf`, plus deterministic fixture and seed-reset hooks.
- Defect reporting must capture severity, reproducibility, platform, build number, affected route, data preconditions, and defect class: calculation, persistence, UI, analytics, export, accessibility, performance, or platform-specific.
- Release cadence defaults:
  - Per PR: static checks, unit/integration coverage, and smoke UI verification.
  - Pre-beta: full functional regression on simulators/emulators.
  - Pre-release candidate: full physical-device pass, UAT pass, accessibility pass, offline pass, and performance benchmark pass.
- Assumptions:
  - v1 remains offline-first and single-user.
  - Design QA validates intent and native quality, not pixel-identical parity with the web prototype.
  - QA certifies the current mobile implementation first, then expands to the remaining `code-plan.md` items as they land.
  - Auth, sync, broker integrations, notifications, and cloud backup are out of scope for v1 QA.
