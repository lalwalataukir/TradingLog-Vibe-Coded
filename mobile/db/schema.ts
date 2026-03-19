import { integer, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const trades = sqliteTable('trades', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  symbol: text('symbol').notNull(),
  market: text('market').notNull(),
  instrumentType: text('instrument_type').notNull(),
  expiryDate: text('expiry_date'),
  strikePrice: real('strike_price'),
  direction: text('direction').notNull(),
  entryDate: text('entry_date').notNull(),
  entryPrice: real('entry_price').notNull(),
  quantity: integer('quantity').notNull(),
  entryFees: real('entry_fees').notNull().default(0),
  exitDate: text('exit_date'),
  exitPrice: real('exit_price'),
  exitFees: real('exit_fees'),
  status: text('status').notNull(),
  stopLoss: real('stop_loss'),
  target: real('target'),
  actualSlHit: integer('actual_sl_hit', { mode: 'boolean' }),
  slHonored: integer('sl_honored', { mode: 'boolean' }),
  riskRewardPlanned: real('risk_reward_planned'),
  riskRewardActual: real('risk_reward_actual'),
  positionSizePct: real('position_size_pct'),
  setupType: text('setup_type').notNull(),
  thesis: text('thesis'),
  timeframe: text('timeframe').notNull(),
  emotionPreTrade: text('emotion_pre_trade').notNull(),
  emotionDuringTrade: text('emotion_during_trade'),
  emotionPostTrade: text('emotion_post_trade'),
  convictionLevel: integer('conviction_level').notNull(),
  followedPlan: integer('followed_plan', { mode: 'boolean' }),
  planDeviationNotes: text('plan_deviation_notes'),
  pnl: real('pnl'),
  pnlNet: real('pnl_net'),
  pnlPercentage: real('pnl_percentage'),
  lessonLearned: text('lesson_learned'),
  rating: integer('rating'),
  screenshots: text('screenshots'),
});

export const tradeConfluenceFactors = sqliteTable(
  'trade_confluence_factors',
  {
    tradeId: text('trade_id').notNull().references(() => trades.id, { onDelete: 'cascade' }),
    factor: text('factor').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tradeId, table.factor] }),
  })
);

export const tradeMistakeTags = sqliteTable(
  'trade_mistake_tags',
  {
    tradeId: text('trade_id').notNull().references(() => trades.id, { onDelete: 'cascade' }),
    tag: text('tag').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tradeId, table.tag] }),
  })
);

export const dailyJournal = sqliteTable('daily_journal', {
  id: text('id').primaryKey(),
  date: text('date').notNull().unique(),
  preMarketPlan: text('pre_market_plan'),
  marketBias: text('market_bias'),
  moodScore: integer('mood_score'),
  sleepHours: real('sleep_hours'),
  exerciseToday: integer('exercise_today', { mode: 'boolean' }),
  screenTimeHours: real('screen_time_hours'),
  totalTrades: integer('total_trades'),
  dailyPnl: real('daily_pnl'),
  postMarketNotes: text('post_market_notes'),
  biggestMistake: text('biggest_mistake'),
  biggestWinReason: text('biggest_win_reason'),
});

export const rules = sqliteTable('rules', {
  id: text('id').primaryKey(),
  ruleText: text('rule_text').notNull(),
  category: text('category').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const tradeRuleChecks = sqliteTable(
  'trade_rule_checks',
  {
    tradeId: text('trade_id').notNull().references(() => trades.id, { onDelete: 'cascade' }),
    ruleId: text('rule_id').notNull().references(() => rules.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    checkedAt: text('checked_at').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tradeId, table.ruleId] }),
  })
);

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  color: text('color').notNull(),
});

export const tradeTags = sqliteTable(
  'trade_tags',
  {
    tradeId: text('trade_id').notNull().references(() => trades.id, { onDelete: 'cascade' }),
    tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.tradeId, table.tagId] }),
  })
);

export const appSettings = sqliteTable('app_settings', {
  id: text('id').primaryKey(),
  defaultMarket: text('default_market').notNull(),
  currency: text('currency').notNull(),
  timezone: text('timezone').notNull(),
  riskPerTradeDefault: real('risk_per_trade_default').notNull(),
  theme: text('theme').notNull(),
  startingCapital: real('starting_capital').notNull(),
  currentCapital: real('current_capital').notNull(),
});

export const capitalAdjustments = sqliteTable('capital_adjustments', {
  id: text('id').primaryKey(),
  effectiveDate: text('effective_date').notNull(),
  amountDelta: real('amount_delta').notNull(),
  note: text('note'),
});
