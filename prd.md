# Trading Journal App — Claude Code PRD

## Project Overview

Build a full-stack trading journal web app called **TradeLog** using Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, and SQLite (via Drizzle ORM). The app runs locally and helps a retail trader (primarily Indian equities, F&O, and some US equities) log trades, track psychology, and surface analytics that reveal behavioral patterns behind wins and losses.

The core philosophy: **every field you ask the trader to fill should eventually power an insight.** No vanity fields.

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Actions)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** SQLite via better-sqlite3 + Drizzle ORM (file-based, no external DB needed)
- **Charts:** Recharts
- **Auth:** None (single-user local app)
- **Deployment:** Runs locally via `npm run dev`

---

## Database Schema

### `trades` table

| Column | Type | Description |
|---|---|---|
| id | TEXT (uuid) | Primary key |
| created_at | TIMESTAMP | Auto |
| updated_at | TIMESTAMP | Auto |
| **— Instrument Info —** | | |
| symbol | TEXT | Ticker (e.g., RELIANCE, NIFTY24MARCE22000, AAPL) |
| market | TEXT | `indian_equity` · `indian_fo` · `us_equity` · `commodity` · `crypto` |
| instrument_type | TEXT | `stock` · `futures` · `call_option` · `put_option` · `index` |
| expiry_date | DATE | Nullable — only for F&O |
| strike_price | REAL | Nullable — only for options |
| **— Trade Execution —** | | |
| direction | TEXT | `long` · `short` |
| entry_date | DATETIME | When position was opened |
| entry_price | REAL | Average entry price |
| quantity | INTEGER | Number of shares/lots |
| entry_fees | REAL | Brokerage + STT + other charges |
| exit_date | DATETIME | Nullable until trade is closed |
| exit_price | REAL | Nullable until closed |
| exit_fees | REAL | Nullable |
| status | TEXT | `open` · `closed` |
| **— Risk Management —** | | |
| stop_loss | REAL | Planned SL price at entry |
| target | REAL | Planned target price at entry |
| actual_sl_hit | BOOLEAN | Did price hit your SL? |
| sl_honored | BOOLEAN | Did you actually exit at SL or did you move it / hold? |
| risk_reward_planned | REAL | Auto-calculated: (target - entry) / (entry - SL) |
| risk_reward_actual | REAL | Auto-calculated on close |
| position_size_pct | REAL | % of total capital deployed in this trade |
| **— Setup & Thesis —** | | |
| setup_type | TEXT | Predefined + custom: `breakout` · `breakdown` · `pullback` · `reversal` · `momentum` · `range_trade` · `earnings_play` · `news_event` · `gap_fill` · `trend_following` · `mean_reversion` · `custom` |
| thesis | TEXT | Free text — "Why did I take this trade?" (1-3 sentences) |
| timeframe | TEXT | `scalp_<15min` · `intraday` · `swing_2_14d` · `positional_14d+` |
| confluence_factors | TEXT (JSON array) | Multi-select: `volume_confirmation` · `support_resistance` · `moving_average` · `rsi_divergence` · `macd_crossover` · `vwap` · `oi_buildup` · `fib_levels` · `trendline` · `sector_strength` · `fii_dii_flow` · `news_catalyst` |
| **— Psychology & Behavior —** | | |
| emotion_pre_trade | TEXT | `confident` · `anxious` · `fomo` · `revenge` · `bored` · `calm` · `greedy` · `fearful` · `neutral` |
| emotion_during_trade | TEXT | Same enum — how did you feel while holding? |
| emotion_post_trade | TEXT | Same enum — how did you feel after closing? |
| conviction_level | INTEGER | 1-5 scale at entry |
| followed_plan | BOOLEAN | Did you follow your predefined rules? |
| plan_deviation_notes | TEXT | If followed_plan = false, what did you do differently? |
| **— Outcome —** | | |
| pnl | REAL | Auto-calculated gross P&L |
| pnl_net | REAL | Auto-calculated P&L after fees |
| pnl_percentage | REAL | Auto-calculated % return on this trade |
| **— Review —** | | |
| lesson_learned | TEXT | Post-trade reflection (filled after closing) |
| mistake_tags | TEXT (JSON array) | Multi-select: `entered_too_early` · `entered_too_late` · `no_stop_loss` · `moved_stop_loss` · `exited_too_early` · `held_too_long` · `oversized` · `undersized` · `chased_entry` · `revenge_trade` · `ignored_plan` · `no_thesis` · `poor_timing` · `wrong_direction` |
| rating | INTEGER | Self-grade 1-5: was this a good *process* trade regardless of outcome? |
| screenshots | TEXT (JSON array) | File paths to chart screenshots at entry/exit |

### `daily_journal` table

| Column | Type | Description |
|---|---|---|
| id | TEXT (uuid) | Primary key |
| date | DATE | Unique — one entry per day |
| pre_market_plan | TEXT | What setups are you watching today? Key levels? |
| market_bias | TEXT | `bullish` · `bearish` · `neutral` · `no_view` |
| mood_score | INTEGER | 1-5: Overall mental state before trading |
| sleep_hours | REAL | Hours of sleep last night |
| exercise_today | BOOLEAN | Did you exercise before trading? |
| screen_time_hours | REAL | How many hours spent on screens/charts |
| total_trades | INTEGER | Auto-calculated count |
| daily_pnl | REAL | Auto-calculated sum |
| post_market_notes | TEXT | End of day reflection |
| biggest_mistake | TEXT | One sentence — what was the worst decision? |
| biggest_win_reason | TEXT | What went right? |
| rule_violations | TEXT (JSON array) | Which of your rules did you break today? |

### `rules` table

| Column | Type | Description |
|---|---|---|
| id | TEXT (uuid) | Primary key |
| rule_text | TEXT | "Never risk more than 2% on a single trade" |
| category | TEXT | `risk` · `entry` · `exit` · `psychology` · `sizing` |
| is_active | BOOLEAN | Can deactivate rules without deleting |
| created_at | TIMESTAMP | |

### `tags` table (for custom categorization)

| Column | Type | Description |
|---|---|---|
| id | TEXT (uuid) | |
| name | TEXT | User-created tags |
| color | TEXT | Hex color for UI |

### `trade_tags` junction table

Standard many-to-many between trades and tags.

---

## Pages & Features

### 1. Dashboard (`/`)

The home page. Glanceable performance overview.

**Top stats row (cards):**
- Total P&L (this month / all time toggle)
- Win rate %
- Average R:R (actual)
- Profit factor (gross wins / gross losses)
- Current streak (winning/losing)
- Number of trades this month

**Charts section:**
- **Equity curve** — cumulative P&L over time (line chart). This is the most important chart.
- **Daily P&L bar chart** — green/red bars per day, last 30 days
- **Win rate by setup type** — horizontal bar chart showing which setups are profitable
- **P&L distribution** — histogram of trade returns to see if you have fat tails

**Recent trades** — last 5 trades with quick status.

### 2. Log Trade (`/trades/new`)

A clean, multi-step form. Don't overwhelm — break into sections:

**Step 1 — Instrument & Direction**
- Market selector → conditionally shows relevant fields (expiry, strike for F&O)
- Symbol with autocomplete (from past trades)
- Direction (Long/Short toggle)

**Step 2 — Execution**
- Entry date/time, price, quantity, fees
- Stop loss & target (auto-calculates planned R:R and shows it live)
- Position size % (auto-calculate if user inputs capital in settings)

**Step 3 — Setup & Thesis**
- Setup type dropdown
- Confluence factors (multi-select chips)
- Thesis textarea with placeholder: *"Why this trade, right now, at this price?"*
- Timeframe selector
- Conviction level slider (1-5)

**Step 4 — Psychology**
- Pre-trade emotion selector (emoji-based for speed)
- Screenshot upload (drag & drop)

**Save as Open Trade** button.

### 3. Close Trade (`/trades/[id]/close`)

When closing an open trade:
- Exit date/time, price, fees
- Auto-shows P&L immediately
- Emotion during and post-trade
- `followed_plan` toggle — if No, show deviation notes
- Mistake tags (multi-select)
- Lesson learned textarea with placeholder: *"What would I do differently?"*
- Process rating (1-5 stars)

### 4. Trade Log (`/trades`)

Filterable, sortable table of all trades.

**Filters:**
- Date range
- Market / instrument type
- Direction
- Setup type
- Status (open/closed)
- P&L (winners/losers/all)
- Tags
- Emotion filters

**Columns:** Date, Symbol, Direction, Entry, Exit, P&L, P&L%, Setup, Rating, Status

**Clicking a row** opens a detail view showing the full trade with screenshots, thesis, lessons.

### 5. Analytics (`/analytics`)

This is the core value. Every chart should answer: *"What pattern is costing/making me money?"*

#### 5a. Performance Metrics

- **Win rate** overall and segmented by: market, setup type, direction, timeframe, day of week
- **Average winner vs average loser** — are your winners bigger than your losers?
- **Expectancy per trade** = (win% × avg win) - (loss% × avg loss)
- **Profit factor** = gross profits / gross losses (>1.5 is good)
- **Max drawdown** — largest peak-to-trough decline in equity curve
- **Max consecutive losses** — stress-tests psychological resilience
- **Sharpe ratio** (if enough data) — risk-adjusted return
- **Recovery factor** — net profit / max drawdown

#### 5b. Behavioral Analytics (This is what makes the app unique)

- **Emotion vs P&L heatmap** — grid of pre-trade emotions × outcome. Shows: "When I trade feeling FOMO, I lose ₹X on average. When I'm calm, I make ₹Y."
- **Conviction vs outcome scatter** — do high-conviction trades perform better?
- **Plan adherence impact** — two bars: avg P&L when followed plan vs didn't follow plan
- **Mistake frequency chart** — bar chart of mistake tags sorted by $ cost. Shows: "Moving my SL has cost me ₹47,000 across 12 trades."
- **Process rating vs outcome** — do well-rated-process trades actually make money?
- **Time of day analysis** — are you more profitable in the morning or afternoon?
- **Day of week analysis** — which weekdays are your best/worst?
- **Overtrading detector** — plot # of trades per day vs daily P&L. If more trades = worse returns, flag it.
- **Revenge trading detector** — flag sequences where a loss is immediately followed by a larger position size trade within 30 minutes.
- **Sleep & mood correlation** — scatter/line of mood_score and sleep_hours vs daily P&L from the daily journal.

#### 5c. Setup Analysis

- **Setup type report card** — table with: setup name, # trades, win rate, avg P&L, total P&L, avg R:R, expectancy. Sort by total P&L to see which setups to keep/drop.
- **Confluence factor effectiveness** — which technical indicators, when present in your confluence, lead to better outcomes?
- **Best setups by market** — does breakout work better in Indian equities vs F&O?

#### 5d. Risk Analytics

- **R:R planned vs actual** — are you cutting winners short? Scatter plot.
- **SL discipline rate** — % of trades where SL was honored vs moved/ignored
- **P&L when SL honored vs not** — quantify the cost of not following your stops
- **Position sizing analysis** — scatter of position_size_pct vs P&L%. Are you sizing up on bad trades?
- **Capital at risk over time** — line chart of total exposure to flag over-leveraging periods

### 6. Daily Journal (`/journal`)

- Calendar view — days colored by P&L (green/red/gray for no trading)
- Click a day → daily journal entry form and review
- Auto-populates total_trades and daily_pnl from trades
- Shows all trades for that day below the journal entry

### 7. Rules (`/rules`)

- CRUD for personal trading rules
- Categorized (risk, entry, exit, psychology, sizing)
- Shown as a checklist before each trade (optional pre-trade modal)
- Dashboard widget showing "days since last rule violation"

### 8. Settings (`/settings`)

- **Starting capital** — used for position size calculations and equity curve
- **Monthly capital update** — if you add/withdraw funds
- **Default market** — pre-select your most traded market
- **Currency** — ₹ or $
- **Risk per trade default** — e.g., 2%
- **Import/Export** — CSV import for historical trades, CSV/JSON export for backup
- **Theme** — light/dark mode

---

## UI/UX Guidelines

- **Dark mode by default** — traders stare at screens all day, be kind to their eyes.
- **Speed matters** — logging a trade should take < 60 seconds. Use smart defaults, autocomplete from past trades, and keyboard shortcuts.
- **Mobile responsive** — traders log from their phones during market hours.
- **Color language** — green for profit/positive, red for loss/negative. Use consistently.
- **Progressive disclosure** — show essential fields first, advanced fields in collapsible sections.
- **Toast notifications** — "Trade logged!" with a quick undo option.
- **Empty states** — when no data, show encouraging messages and link to log first trade.
- **Charts should be interactive** — hover for details, click to filter, zoom on equity curve.

---

## Calculated Fields & Business Logic

Implement these as utility functions and/or DB triggers:

```
pnl = (exit_price - entry_price) × quantity × direction_multiplier
  where direction_multiplier = 1 for long, -1 for short

pnl_net = pnl - entry_fees - exit_fees

pnl_percentage = pnl_net / (entry_price × quantity) × 100

risk_reward_planned = |target - entry_price| / |entry_price - stop_loss|

risk_reward_actual = |exit_price - entry_price| / |entry_price - stop_loss|

profit_factor = sum(pnl where pnl > 0) / abs(sum(pnl where pnl < 0))

expectancy = (win_rate × avg_win) - (loss_rate × avg_loss)

position_size_pct = (entry_price × quantity) / total_capital × 100
```

---

## Seed Data

Generate 40-50 realistic sample trades spanning 3 months with a mix of:
- Indian equities (RELIANCE, TCS, INFY, HDFC, TATAMOTORS)
- Nifty/BankNifty options (use realistic strikes and expiries)
- US equities (NVDA, META, AAPL, GOOGL)
- Mix of winners (55%) and losers (45%)
- Various setup types, emotions, and mistake tags
- Some trades where plan was not followed
- A few revenge trade sequences
- Varying conviction levels

Also generate 30 days of daily journal entries with realistic mood scores, sleep data, and reflections.

This seed data is critical — the analytics page should look populated and useful on first run.

---

## File Structure

```
tradeLog/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Dashboard
│   │   ├── trades/
│   │   │   ├── page.tsx             # Trade log table
│   │   │   ├── new/page.tsx         # Log new trade
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # Trade detail view
│   │   │       └── close/page.tsx   # Close trade form
│   │   ├── analytics/page.tsx       # Analytics dashboard
│   │   ├── journal/page.tsx         # Daily journal
│   │   ├── rules/page.tsx           # Trading rules
│   │   └── settings/page.tsx        # Settings
│   ├── components/
│   │   ├── ui/                      # shadcn components
│   │   ├── charts/                  # Recharts wrappers
│   │   ├── trade-form/              # Multi-step form components
│   │   └── layout/                  # Sidebar, header
│   ├── db/
│   │   ├── schema.ts                # Drizzle schema
│   │   ├── index.ts                 # DB connection
│   │   └── seed.ts                  # Seed data script
│   ├── lib/
│   │   ├── calculations.ts          # P&L, R:R, expectancy formulas
│   │   ├── analytics.ts             # Query builders for analytics
│   │   └── utils.ts                 # Shared utilities
│   └── actions/                     # Server actions for CRUD
├── drizzle.config.ts
├── package.json
└── tailwind.config.ts
```

---

## Implementation Priority

Build in this order:

1. **DB schema + seed data** — get the foundation right
2. **Trade log form (new + close)** — core input loop
3. **Trade log table** — view and filter trades
4. **Dashboard** — basic stats + equity curve
5. **Analytics — Performance metrics** — win rate, profit factor, expectancy
6. **Analytics — Behavioral** — emotion heatmap, plan adherence, mistake costs
7. **Analytics — Setup & Risk** — setup report card, SL discipline
8. **Daily Journal** — calendar + form
9. **Rules** — CRUD + pre-trade checklist
10. **Settings + Import/Export**

---

## Non-Functional Requirements

- All dates should support IST (Indian Standard Time) as default timezone
- Format currency as ₹ for Indian markets and $ for US markets
- App should load in < 2 seconds locally
- SQLite DB file stored in project root as `tradeLog.db`
- No external API calls — fully offline capable
- All analytics queries should be efficient even with 1000+ trades
