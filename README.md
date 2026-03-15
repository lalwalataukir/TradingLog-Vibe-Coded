# TradeLog

A trading journal application built with React Native (Expo) to help retail traders log trades, track psychology, and surface analytics that reveal behavioral patterns behind wins and losses.

The core philosophy: **every field you ask the trader to fill should eventually power an insight.** No vanity fields.

## Tech Stack

- **Framework:** Expo (React Native & React Native Web)
- **Routing:** Expo Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS / NativeWind (or standard React Native stylesheets)
- **Database:** SQLite (expo-sqlite) + Drizzle ORM (fully offline, file-based)
- **State Management:** Zustand
- **Charts:** React Native Gifted Charts (or Recharts for Web)

## Features

- **Dashboard:** Glanceable performance overview including Total P&L, Win Rate, and Equity Curve.
- **Log Trades:** A clean, multi-step flow supporting entry/exit info, setup type, confluence factors, and pre/post-trade emotions.
- **Trade Log:** A filtering and sorting interface for checking all historical trades.
- **Analytics:** Data-driven insights including behavioral analytics (Emotion vs P&L heatmap), process rating analysis, time of day/week analysis, and setup-based reports.
- **Fully Offline:** Trades and data reside entirely locally on your device in a SQLite database with zero external API calls needed.

## Database Schema Highlights

The application functions around a strict but comprehensive schema:
- **`trades`:** Holds instrument info, execution data, risk management points (SL/Target), setup & thesis details, psychological states (emotions before/during/after), lesson evaluations, and final P&L logic.
- **`daily_journal`:** Tracking daily meta-statistics like mood score, sleep hours, screen time, biggest mistake, and market bias.
- **`rules`:** A customizable set of personal trading rules (e.g., "Never risk more than 2% on a single trade") to verify against daily actions.
- **`tags` & `trade_tags`:** Extendable categorizations for trades.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn or pnpm
- Expo CLI or Expo Go app on your mobile device

### Installation

1. Clone or clone the repository to your local machine.
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* Regenerate Database models/migrations with Drizzle Kit if schema changes are made:
   ```bash
   npm run generate
   ```

### Running the App

Start the development server:

```bash
npm start
```

Press `a` to open on Android, `i` to open on iOS, or `w` to open on the Web. The app can also be previewed directly via the Expo Go app.

## Development Status

This app is based on a structured PRD transitioning from a Next.js conceptual app to a full-fledged Expo Mobile/Web application. The codebase handles the local SQLite implementation, routing patterns, and data visualizations completely on the client side without needing external backend infrastructure.
