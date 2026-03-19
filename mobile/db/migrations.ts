import type { SQLiteDatabase } from 'expo-sqlite';

export const LATEST_DB_VERSION = 1;

const schemaSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS trades (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  symbol TEXT NOT NULL,
  market TEXT NOT NULL,
  instrument_type TEXT NOT NULL,
  expiry_date TEXT,
  strike_price REAL,
  direction TEXT NOT NULL,
  entry_date TEXT NOT NULL,
  entry_price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  entry_fees REAL NOT NULL DEFAULT 0,
  exit_date TEXT,
  exit_price REAL,
  exit_fees REAL,
  status TEXT NOT NULL,
  stop_loss REAL,
  target REAL,
  actual_sl_hit INTEGER,
  sl_honored INTEGER,
  risk_reward_planned REAL,
  risk_reward_actual REAL,
  position_size_pct REAL,
  setup_type TEXT NOT NULL,
  thesis TEXT,
  timeframe TEXT NOT NULL,
  emotion_pre_trade TEXT NOT NULL,
  emotion_during_trade TEXT,
  emotion_post_trade TEXT,
  conviction_level INTEGER NOT NULL,
  followed_plan INTEGER,
  plan_deviation_notes TEXT,
  pnl REAL,
  pnl_net REAL,
  pnl_percentage REAL,
  lesson_learned TEXT,
  rating INTEGER,
  screenshots TEXT
);

CREATE TABLE IF NOT EXISTS trade_confluence_factors (
  trade_id TEXT NOT NULL,
  factor TEXT NOT NULL,
  PRIMARY KEY (trade_id, factor),
  FOREIGN KEY (trade_id) REFERENCES trades (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trade_mistake_tags (
  trade_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (trade_id, tag),
  FOREIGN KEY (trade_id) REFERENCES trades (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_journal (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL UNIQUE,
  pre_market_plan TEXT,
  market_bias TEXT,
  mood_score INTEGER,
  sleep_hours REAL,
  exercise_today INTEGER,
  screen_time_hours REAL,
  total_trades INTEGER,
  daily_pnl REAL,
  post_market_notes TEXT,
  biggest_mistake TEXT,
  biggest_win_reason TEXT
);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY NOT NULL,
  rule_text TEXT NOT NULL,
  category TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trade_rule_checks (
  trade_id TEXT NOT NULL,
  rule_id TEXT NOT NULL,
  status TEXT NOT NULL,
  checked_at TEXT NOT NULL,
  PRIMARY KEY (trade_id, rule_id),
  FOREIGN KEY (trade_id) REFERENCES trades (id) ON DELETE CASCADE,
  FOREIGN KEY (rule_id) REFERENCES rules (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trade_tags (
  trade_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (trade_id, tag_id),
  FOREIGN KEY (trade_id) REFERENCES trades (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY NOT NULL,
  default_market TEXT NOT NULL,
  currency TEXT NOT NULL,
  timezone TEXT NOT NULL,
  risk_per_trade_default REAL NOT NULL,
  theme TEXT NOT NULL,
  starting_capital REAL NOT NULL,
  current_capital REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS capital_adjustments (
  id TEXT PRIMARY KEY NOT NULL,
  effective_date TEXT NOT NULL,
  amount_delta REAL NOT NULL,
  note TEXT
);

CREATE INDEX IF NOT EXISTS trades_entry_date_idx ON trades (entry_date DESC);
CREATE INDEX IF NOT EXISTS trades_status_idx ON trades (status);
CREATE INDEX IF NOT EXISTS trades_setup_idx ON trades (setup_type);
CREATE INDEX IF NOT EXISTS trades_emotion_idx ON trades (emotion_pre_trade);
CREATE INDEX IF NOT EXISTS journal_date_idx ON daily_journal (date DESC);
`;

export function runMigrationsSync(sqlite: SQLiteDatabase) {
  sqlite.execSync(schemaSql);
  sqlite.execSync(`PRAGMA user_version = ${LATEST_DB_VERSION}`);
}
