import { sql } from 'drizzle-orm';
import db from './index';

export async function initializeDatabase() {
    // Create tables
    db.run(sql`
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')) NOT NULL,
      symbol TEXT NOT NULL,
      market TEXT NOT NULL,
      instrument_type TEXT NOT NULL,
      expiry_date TEXT,
      strike_price REAL,
      direction TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      entry_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      entry_fees REAL DEFAULT 0,
      exit_date TEXT,
      exit_price REAL,
      exit_fees REAL DEFAULT 0,
      status TEXT DEFAULT 'open' NOT NULL,
      stop_loss REAL,
      target REAL,
      actual_sl_hit INTEGER DEFAULT 0,
      sl_honored INTEGER,
      risk_reward_planned REAL,
      risk_reward_actual REAL,
      position_size_pct REAL,
      setup_type TEXT,
      thesis TEXT,
      timeframe TEXT,
      confluence_factors TEXT,
      emotion_pre_trade TEXT,
      emotion_during_trade TEXT,
      emotion_post_trade TEXT,
      conviction_level INTEGER,
      followed_plan INTEGER,
      plan_deviation_notes TEXT,
      pnl REAL,
      pnl_net REAL,
      pnl_percentage REAL,
      lesson_learned TEXT,
      mistake_tags TEXT,
      rating INTEGER,
      screenshots TEXT
    )
  `);

    db.run(sql`
    CREATE TABLE IF NOT EXISTS daily_journal (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      pre_market_plan TEXT,
      market_bias TEXT,
      mood_score INTEGER,
      sleep_hours REAL,
      exercise_today INTEGER,
      screen_time_hours REAL,
      total_trades INTEGER DEFAULT 0,
      daily_pnl REAL DEFAULT 0,
      post_market_notes TEXT,
      biggest_mistake TEXT,
      biggest_win_reason TEXT,
      rule_violations TEXT
    )
  `);

    db.run(sql`
    CREATE TABLE IF NOT EXISTS rules (
      id TEXT PRIMARY KEY,
      rule_text TEXT NOT NULL,
      category TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')) NOT NULL
    )
  `);

    db.run(sql`
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#6366F1'
    )
  `);

    db.run(sql`
    CREATE TABLE IF NOT EXISTS trade_tags (
      trade_id TEXT NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (trade_id, tag_id)
    )
  `);

    db.run(sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}
