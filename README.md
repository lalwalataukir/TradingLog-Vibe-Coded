# TradeLog

TradeLog is an offline-first mobile trading journal built for retail traders who want to log trades, review behavior, and spot patterns across Indian equities, F&O, and some US equities. The primary app lives under [`mobile/`](./mobile) as an Expo + React Native project, with local-only persistence powered by SQLite on-device.

## Current Status

The mobile app is the main product in this repo and currently includes:

- Dashboard
- Trade log
- Multi-step log trade flow
- Trade close flow
- Analytics tabs
- Journal
- Rules screen
- Settings
- JSON and CSV export
- Bundled global symbol picker

Still in progress or not fully implemented:

- CSV import
- Screenshot attachments
- Full rules CRUD
- Richer native charting
- Full device, accessibility, performance, and UAT coverage

The app no longer ships with demo data. It starts like a fresh install.

## Repo Structure

- [`mobile/`](./mobile): primary Expo Router mobile app
- [`app/`](./app), [`components/`](./components), [`styles/`](./styles): older Next.js design/reference prototype
- [`prd.md`](./prd.md): product requirements
- [`code-plan.md`](./code-plan.md): mobile implementation plan
- [`qa-plan.md`](./qa-plan.md): QA plan

## Getting Started

### Prerequisites

- Node.js
- npm
- Expo-compatible simulator, emulator, or Expo Go for mobile testing

### Mobile App

The mobile app is the main project to run.

```bash
cd mobile
npm install
npm run start
```

Optional platform-specific commands:

```bash
npm run ios
npm run android
npm run web
```

### Root Prototype

The root app is an older Next.js prototype kept for design and reference purposes.

```bash
npm install
npm run dev
```

## Mobile Scripts

From [`mobile/`](./mobile):

```bash
npm run start
npm run ios
npm run android
npm run web
npm run typecheck
npm run test:unit
npm run test:web-build
npm run qa
npm run symbols:update
```

## Tech Stack

### Mobile

- Expo
- React Native
- Expo Router
- Expo SQLite
- Drizzle ORM
- TypeScript
- Vitest

### Prototype

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Symbol Data Sources

The bundled symbol universe is generated from free official NSE and Nasdaq sources and stored in the repo as a snapshot for fast local search. It can be refreshed with:

```bash
cd mobile
npm run symbols:update
```

This is symbol reference data only. The app does not currently provide live market quotes, broker connectivity, or trading execution.

## Testing

Current automated checks for the mobile app include:

- TypeScript typecheck
- Unit tests
- Web export build smoke check

Full device QA, accessibility testing, performance testing, and UAT are still pending.

## Privacy

- Single-user
- Local-first
- No auth in the current build
- No cloud sync in the current build

## Roadmap

- CSV import
- Screenshot attachments
- Full rules CRUD
- Stronger native charting
- Deeper mobile QA coverage
