# TradeLog Mobile Execution Plan

## Summary
- Source of truth: the product requirements in `prd.md`, the coded mobile wireframes in `components/screens.tsx`, and the dark-first theme tokens in `app/globals.css`.
- Build a new Expo/React Native app for iOS and Android while keeping the current Next.js repo as a design/reference prototype. Do not try to reuse web UI components directly.
- Preserve the current mobile IA and visual language: 5-tab bottom nav, 4-step trade wizard, segmented analytics tabs, dark-first fintech palette, compact cards/chips, and profit/loss color semantics. Adapt interactions to native patterns instead of pixel-matching web-only behaviors.

## Implementation Changes
- Foundation: create a new Expo app with Expo Router, TypeScript, strict linting, EAS config, a root stack, and a `(tabs)` group for `Home`, `Trades`, `Log`, `Analytics`, and `Journal`.
- Route structure: keep tab screens at `/(tabs)` and stack screens for `trades/[id]`, `trades/[id]/close`, `rules`, and `settings`. Implement `Log` as one full-screen wizard route with internal step state, not four separate routes.
- UI system: build reusable native primitives for `Screen`, `Card`, `StatCard`, `Chip`, `SegmentedControl`, `ListRow`, `StickyCtaBar`, `BottomSheetPicker`, `EmptyState`, and `ChartShell`. Port the existing theme tokens into a typed RN theme module.
- Data layer: use `expo-sqlite` with Drizzle ORM and bundled migrations. Keep the app fully offline with local persistence only.
- Schema: implement `trades`, `daily_journal`, `rules`, `tags`, and `trade_tags` from the PRD, plus `app_settings` and `capital_adjustments`. Normalize analytics-heavy multi-select fields into join tables: `trade_confluence_factors`, `trade_mistake_tags`, and `trade_rule_checks`.
- Files: store screenshot/image attachments as copied app-local files under a trade-scoped directory and persist their URIs on the associated trade record.
- Domain code: centralize enums, Zod schemas, calculations, formatting helpers, CSV parsing/export, and analytics detectors in pure TypeScript modules separate from screen code.
- Time and currency: store timestamps as ISO strings, default rendering to `Asia/Kolkata`, and format currency by selected app setting and market context.
- Seed data: bundle deterministic seed generation for 40-50 trades, 30 journal entries, starter rules, and tags. Run it on first launch and expose reset/clear-demo-data from settings.
- Trade logging: implement a 4-step wizard matching the current wireframes with shared `react-hook-form` state, live R:R and position sizing, symbol autocomplete from existing trades, screenshot upload, and pre-trade rule checks.
- Trade closing: implement exit capture, instant net P&L preview, emotion capture, followed-plan toggle, mistake tags, lesson learned, and process rating. Closing a trade must immediately update all dependent views.
- Trade log: implement search, filter chips, date range, market/type/direction/status/P&L filters, summary cards, detail screen navigation, and quick close/open actions where relevant.
- Dashboard: implement month/all-time summary toggle, KPI cards, equity curve, daily P&L chart, setup win-rate chart, P&L distribution, and recent trades list.
- Analytics: build one analytics service that returns `performance`, `behavior`, `setups`, and `risk` DTOs from shared filters. Use SQLite aggregates where straightforward and JS derivation for revenge-trade detection, overtrading, time buckets, sleep/mood correlation, and similar pattern logic.
- Journal: implement calendar heatmap, per-day journal editor, auto-derived `daily_pnl` and `total_trades`, and same-day trade list.
- Rules: implement CRUD, category filters, active/inactive state, and violation-streak calculations from failed `trade_rule_checks`.
- Settings: implement capital setup, capital adjustments, default market, currency, timezone, risk-per-trade default, theme toggle, CSV import with preview+validation, CSV export, JSON backup export, and reset utilities.
- Native adaptations: replace hover states with press states, haptics, bottom sheets, safe-area-aware layouts, keyboard avoidance, native date/time pickers, and sticky bottom CTAs.
- Charting: implement chart wrappers on top of `react-native-svg` for line/area, bar, horizontal bar, histogram, scatter, and heatmap views to keep styling consistent across analytics screens.
- Delivery order:
1. Expo scaffold, routing, theme, and reusable UI primitives.
2. SQLite schema, migrations, repositories, calculations, and seed data.
3. Log trade wizard and close trade flow.
4. Trade log list and trade detail.
5. Dashboard.
6. Analytics performance, then behavior, setups, and risk.
7. Journal.
8. Rules.
9. Settings, import/export, and reset/backup flows.
10. Accessibility, performance tuning, QA, and release prep.

## Public Interfaces / Types
- Core types: `Trade`, `TradeDraft`, `TradeCloseInput`, `DailyJournalEntry`, `Rule`, `Tag`, `AppSettings`, `CapitalAdjustment`.
- Normalized records: `TradeConfluenceFactor`, `TradeMistakeTag`, `TradeRuleCheck`.
- View/query DTOs: `TradeFilters`, `AnalyticsFilters`, `DashboardSummary`, `AnalyticsBundle`, `ImportPreviewResult`, `ExportPayload`.
- Service boundaries: `tradeRepo`, `journalRepo`, `rulesRepo`, `settingsRepo`, `analyticsService`, and `seedService`, all returning typed DTOs rather than raw SQLite rows.

## Test Plan
- Unit tests: P&L and R:R formulas, position sizing, expectancy/profit factor, timezone formatting, validation schemas, revenge-trade detection, overtrading detection, and CSV import/export parsing.
- Integration tests: migrations, first-run seed bootstrap, create/edit/close trade flows, journal auto-rollups, rule-check persistence, and import preview versus final commit.
- Router/UI tests: tab navigation, stack navigation to detail/close/settings/rules, empty states, segmented analytics switching, and persisted filter behavior.
- E2E tests on both iOS and Android: first launch with seeded data, log an open trade, close it, confirm dashboard/analytics refresh, update a journal entry, and export a backup.
- Performance checks: cold start and dashboard load on seeded data, analytics tab-switch latency on 1k trades, trade list scroll performance, and attachment handling under offline conditions.

## Assumptions
- Target both iOS and Android in v1.
- Keep the current Next.js prototype as design/reference material only.
- Preserve the existing screen structure and visual system, but use native interaction patterns where the web prototype is not mobile-native.
- Support only TradeLog-defined CSV headers in v1 import; no arbitrary column-mapping UI.
- Exclude auth, cloud sync, broker integrations, notifications, and app lock from v1.
- Stack choices were validated against current official docs: [Expo Router](https://docs.expo.dev/router/introduction/), [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/), [Drizzle Expo SQLite](https://orm.drizzle.team/docs/connect-expo-sqlite), [Expo unit testing](https://docs.expo.dev/develop/unit-testing/), [Expo Router testing](https://docs.expo.dev/router/reference/testing), [Maestro on EAS](https://docs.expo.dev/eas/workflows/examples/e2e-tests/), [Document Picker](https://docs.expo.dev/versions/latest/sdk/document-picker/), [Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/), [File System](https://docs.expo.dev/versions/latest/sdk/filesystem/), and [Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/).
