import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ─── trades ──────────────────────────────────────────────────────────────────
export const trades = sqliteTable('trades', {
    id: text('id').primaryKey(),
    created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
    updated_at: text('updated_at').default(sql`(datetime('now'))`).notNull(),

    // Instrument Info
    symbol: text('symbol').notNull(),
    market: text('market').notNull(),                   // indian_equity | indian_fo | us_equity | commodity | crypto
    instrument_type: text('instrument_type').notNull(), // stock | futures | call_option | put_option | index
    expiry_date: text('expiry_date'),                   // nullable — F&O only
    strike_price: real('strike_price'),                 // nullable — options only

    // Trade Execution
    direction: text('direction').notNull(),             // long | short
    entry_date: text('entry_date').notNull(),
    entry_price: real('entry_price').notNull(),
    quantity: integer('quantity').notNull(),
    entry_fees: real('entry_fees').default(0),
    exit_date: text('exit_date'),
    exit_price: real('exit_price'),
    exit_fees: real('exit_fees').default(0),
    status: text('status').default('open').notNull(),   // open | closed

    // Risk Management
    stop_loss: real('stop_loss'),
    target: real('target'),
    actual_sl_hit: integer('actual_sl_hit', { mode: 'boolean' }).default(false),
    sl_honored: integer('sl_honored', { mode: 'boolean' }),
    risk_reward_planned: real('risk_reward_planned'),
    risk_reward_actual: real('risk_reward_actual'),
    position_size_pct: real('position_size_pct'),

    // Setup & Thesis
    setup_type: text('setup_type'),
    thesis: text('thesis'),
    timeframe: text('timeframe'),
    confluence_factors: text('confluence_factors'), // JSON array string

    // Psychology & Behavior
    emotion_pre_trade: text('emotion_pre_trade'),
    emotion_during_trade: text('emotion_during_trade'),
    emotion_post_trade: text('emotion_post_trade'),
    conviction_level: integer('conviction_level'),  // 1-5
    followed_plan: integer('followed_plan', { mode: 'boolean' }),
    plan_deviation_notes: text('plan_deviation_notes'),

    // Outcome (auto-calculated)
    pnl: real('pnl'),
    pnl_net: real('pnl_net'),
    pnl_percentage: real('pnl_percentage'),

    // Review
    lesson_learned: text('lesson_learned'),
    mistake_tags: text('mistake_tags'),  // JSON array string
    rating: integer('rating'),           // 1-5 process rating
    screenshots: text('screenshots'),    // JSON array of file paths
});

// ─── daily_journal ───────────────────────────────────────────────────────────
export const dailyJournal = sqliteTable('daily_journal', {
    id: text('id').primaryKey(),
    date: text('date').notNull().unique(),
    pre_market_plan: text('pre_market_plan'),
    market_bias: text('market_bias'),
    mood_score: integer('mood_score'),   // 1-5
    sleep_hours: real('sleep_hours'),
    exercise_today: integer('exercise_today', { mode: 'boolean' }),
    screen_time_hours: real('screen_time_hours'),
    total_trades: integer('total_trades').default(0),
    daily_pnl: real('daily_pnl').default(0),
    post_market_notes: text('post_market_notes'),
    biggest_mistake: text('biggest_mistake'),
    biggest_win_reason: text('biggest_win_reason'),
    rule_violations: text('rule_violations'), // JSON array
});

// ─── rules ───────────────────────────────────────────────────────────────────
export const rules = sqliteTable('rules', {
    id: text('id').primaryKey(),
    rule_text: text('rule_text').notNull(),
    category: text('category').notNull(), // risk | entry | exit | psychology | sizing
    is_active: integer('is_active', { mode: 'boolean' }).default(true),
    created_at: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

// ─── tags ────────────────────────────────────────────────────────────────────
export const tags = sqliteTable('tags', {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(),
    color: text('color').notNull().default('#6366F1'),
});

// ─── trade_tags ──────────────────────────────────────────────────────────────
export const tradeTags = sqliteTable('trade_tags', {
    trade_id: text('trade_id').notNull().references(() => trades.id, { onDelete: 'cascade' }),
    tag_id: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
});

// ─── settings ────────────────────────────────────────────────────────────────
export const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value').notNull(),
});

// ─── types ───────────────────────────────────────────────────────────────────
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type DailyJournal = typeof dailyJournal.$inferSelect;
export type NewDailyJournal = typeof dailyJournal.$inferInsert;
export type Rule = typeof rules.$inferSelect;
export type NewRule = typeof rules.$inferInsert;
export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;
export type Setting = typeof settings.$inferSelect;
