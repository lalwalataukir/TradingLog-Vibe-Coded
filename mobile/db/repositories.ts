import { and, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

import * as schema from '@/db/schema';
import {
  calculatePnl,
  calculatePnlNet,
  calculatePnlPercentage,
  calculatePositionSizePct,
  calculateRiskRewardActual,
  calculateRiskRewardPlanned,
} from '@/lib/calculations';
import type { AppSettings, DailyJournalEntry, Rule, Trade, TradeCloseInput, TradeDraft } from '@/lib/types';
import { validateSettingsPatch, validateTradeCloseInput, validateTradeDraft } from '@/lib/validation';

export type TradeRecord = Trade & {
  confluenceFactors: string[];
  mistakeTags: string[];
  planDeviationNotes: string | null;
  positionSizePct: number | null;
  riskRewardActual: number | null;
  riskRewardPlanned: number | null;
  thesis: string | null;
};

function getOrm(sqlite: SQLiteDatabase) {
  return drizzle(sqlite, { schema });
}

export function getSettings(sqlite: SQLiteDatabase): AppSettings {
  const orm = getOrm(sqlite);
  const row = orm.select().from(schema.appSettings).get();

  if (!row) {
    return {
      currentCapital: 2_124_350,
      currency: 'INR',
      defaultMarket: 'indian_equity',
      riskPerTradeDefault: 2,
      startingCapital: 2_000_000,
      theme: 'dark',
      timezone: 'Asia/Kolkata',
    };
  }

  return {
    currentCapital: row.currentCapital,
    currency: row.currency as AppSettings['currency'],
    defaultMarket: row.defaultMarket as AppSettings['defaultMarket'],
    riskPerTradeDefault: row.riskPerTradeDefault,
    startingCapital: row.startingCapital,
    theme: row.theme as AppSettings['theme'],
    timezone: row.timezone,
  };
}

export function updateSettings(sqlite: SQLiteDatabase, patch: Partial<AppSettings>) {
  const orm = getOrm(sqlite);
  const capitalValidation = validateSettingsPatch({
    currentCapital: patch.currentCapital ?? Number.POSITIVE_INFINITY,
    startingCapital: patch.startingCapital ?? Number.POSITIVE_INFINITY,
  }).filter((message) =>
    patch.currentCapital === undefined ? message !== 'Current capital must be greater than 0.' : true
  ).filter((message) =>
    patch.startingCapital === undefined ? message !== 'Starting capital must be greater than 0.' : true
  );

  if (capitalValidation.length > 0) {
    throw new Error(capitalValidation[0]);
  }

  const updates = Object.fromEntries(
    Object.entries({
      currentCapital: patch.currentCapital,
      currency: patch.currency,
      defaultMarket: patch.defaultMarket,
      riskPerTradeDefault: patch.riskPerTradeDefault,
      startingCapital: patch.startingCapital,
      theme: patch.theme,
      timezone: patch.timezone,
    }).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(updates).length === 0) {
    return;
  }

  orm.update(schema.appSettings).set(updates).where(eq(schema.appSettings.id, 'app-settings')).run();
}

export function listTrades(sqlite: SQLiteDatabase): TradeRecord[] {
  const orm = getOrm(sqlite);
  const trades = orm.select().from(schema.trades).orderBy(desc(schema.trades.entryDate)).all();
  const confluence = orm.select().from(schema.tradeConfluenceFactors).all();
  const mistakes = orm.select().from(schema.tradeMistakeTags).all();

  const confluenceMap = groupValues(confluence, 'tradeId', 'factor');
  const mistakeMap = groupValues(mistakes, 'tradeId', 'tag');

  return trades.map((trade) => ({
    convictionLevel: trade.convictionLevel,
    confluenceFactors: confluenceMap.get(trade.id) ?? [],
    createdAt: trade.createdAt,
    direction: trade.direction as Trade['direction'],
    emotionDuringTrade: (trade.emotionDuringTrade as Trade['emotionDuringTrade']) ?? null,
    emotionPostTrade: (trade.emotionPostTrade as Trade['emotionPostTrade']) ?? null,
    emotionPreTrade: trade.emotionPreTrade as Trade['emotionPreTrade'],
    entryDate: trade.entryDate,
    entryFees: trade.entryFees,
    entryPrice: trade.entryPrice,
    exitDate: trade.exitDate ?? null,
    exitFees: trade.exitFees ?? null,
    exitPrice: trade.exitPrice ?? null,
    followedPlan: trade.followedPlan ?? null,
    id: trade.id,
    instrumentType: trade.instrumentType as Trade['instrumentType'],
    lessonLearned: trade.lessonLearned ?? null,
    market: trade.market as Trade['market'],
    mistakeTags: mistakeMap.get(trade.id) ?? [],
    planDeviationNotes: trade.planDeviationNotes ?? null,
    pnl: trade.pnl ?? null,
    pnlNet: trade.pnlNet ?? null,
    pnlPercentage: trade.pnlPercentage ?? null,
    positionSizePct: trade.positionSizePct ?? null,
    quantity: trade.quantity,
    rating: trade.rating ?? null,
    riskRewardActual: trade.riskRewardActual ?? null,
    riskRewardPlanned: trade.riskRewardPlanned ?? null,
    setupType: trade.setupType as Trade['setupType'],
    status: trade.status as Trade['status'],
    stopLoss: trade.stopLoss ?? null,
    symbol: trade.symbol,
    target: trade.target ?? null,
    thesis: trade.thesis ?? null,
    timeframe: trade.timeframe as Trade['timeframe'],
    updatedAt: trade.updatedAt,
  }));
}

export function getTradeById(sqlite: SQLiteDatabase, id: string) {
  return listTrades(sqlite).find((trade) => trade.id === id) ?? null;
}

export function createTrade(sqlite: SQLiteDatabase, draft: TradeDraft, settings: AppSettings) {
  const orm = getOrm(sqlite);
  const validationErrors = validateTradeDraft(draft);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }
  const now = new Date().toISOString();
  const id = createId('trade');

  orm.insert(schema.trades).values({
    convictionLevel: draft.convictionLevel,
    createdAt: now,
    direction: draft.direction,
    emotionPreTrade: draft.emotionPreTrade,
    entryDate: now,
    entryFees: draft.entryFees,
    entryPrice: draft.entryPrice,
    id,
    instrumentType: draft.instrumentType,
    market: draft.market,
    positionSizePct: calculatePositionSizePct(draft.entryPrice, draft.quantity, settings.currentCapital),
    quantity: draft.quantity,
    riskRewardPlanned: calculateRiskRewardPlanned(draft.entryPrice, draft.stopLoss, draft.target),
    setupType: draft.setupType,
    status: 'open',
    stopLoss: draft.stopLoss,
    symbol: draft.symbol.toUpperCase(),
    target: draft.target,
    thesis: draft.thesis,
    timeframe: draft.timeframe,
    updatedAt: now,
  }).run();

  if (draft.confluenceFactors && draft.confluenceFactors.length > 0) {
    orm.insert(schema.tradeConfluenceFactors).values(
      draft.confluenceFactors.map((factor) => ({
        factor,
        tradeId: id,
      }))
    ).run();
  }

  const activeRules = orm.select().from(schema.rules).where(eq(schema.rules.isActive, true)).all();
  if (activeRules.length > 0) {
    orm.insert(schema.tradeRuleChecks).values(
      activeRules.map((rule) => ({
        checkedAt: now,
        ruleId: rule.id,
        status: 'passed',
        tradeId: id,
      }))
    ).run();
  }

  return id;
}

export function closeTrade(sqlite: SQLiteDatabase, tradeId: string, input: TradeCloseInput) {
  const orm = getOrm(sqlite);
  const trade = orm.select().from(schema.trades).where(eq(schema.trades.id, tradeId)).get();

  if (!trade) {
    throw new Error('Trade not found');
  }
  const validationErrors = validateTradeCloseInput(input, {
    entryPrice: trade.entryPrice,
    status: trade.status as Trade['status'],
  });
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const exitDate = new Date().toISOString();
  const pnl = calculatePnl(trade.entryPrice, input.exitPrice, trade.quantity, trade.direction as Trade['direction']);
  const pnlNet = calculatePnlNet(
    trade.entryPrice,
    input.exitPrice,
    trade.quantity,
    trade.direction as Trade['direction'],
    trade.entryFees,
    input.exitFees
  );

  orm.update(schema.trades).set({
    emotionDuringTrade: input.emotionDuringTrade,
    emotionPostTrade: input.emotionPostTrade,
    exitDate,
    exitFees: input.exitFees,
    exitPrice: input.exitPrice,
    followedPlan: input.followedPlan,
    lessonLearned: input.lessonLearned,
    planDeviationNotes: input.followedPlan ? null : input.planDeviationNotes ?? null,
    pnl,
    pnlNet,
    pnlPercentage: calculatePnlPercentage(trade.entryPrice, trade.quantity, pnlNet),
    rating: input.rating,
    riskRewardActual: trade.stopLoss ? calculateRiskRewardActual(trade.entryPrice, trade.stopLoss, input.exitPrice) : null,
    status: 'closed',
    updatedAt: exitDate,
  }).where(eq(schema.trades.id, tradeId)).run();

  orm.delete(schema.tradeMistakeTags).where(eq(schema.tradeMistakeTags.tradeId, tradeId)).run();
  if (input.mistakeTags.length > 0) {
    orm.insert(schema.tradeMistakeTags).values(
      input.mistakeTags.map((tag) => ({
        tag,
        tradeId,
      }))
    ).run();
  }

  if (!input.followedPlan) {
    const activeRules = orm.select().from(schema.rules).where(eq(schema.rules.isActive, true)).all();
    const firstRule = activeRules[0];
    if (firstRule) {
      orm.update(schema.tradeRuleChecks).set({
        checkedAt: exitDate,
        status: 'failed',
      }).where(and(eq(schema.tradeRuleChecks.tradeId, tradeId), eq(schema.tradeRuleChecks.ruleId, firstRule.id))).run();
    }
  }
}

export function listJournalEntries(sqlite: SQLiteDatabase): DailyJournalEntry[] {
  const orm = getOrm(sqlite);
  const tradeSummaries = orm
    .select({
      entryDate: schema.trades.entryDate,
      pnlNet: schema.trades.pnlNet,
    })
    .from(schema.trades)
    .all();
  const summaryByDate = new Map<string, { dailyPnl: number; totalTrades: number }>();

  for (const trade of tradeSummaries) {
    const date = trade.entryDate.slice(0, 10);
    const current = summaryByDate.get(date) ?? { dailyPnl: 0, totalTrades: 0 };
    current.dailyPnl += trade.pnlNet ?? 0;
    current.totalTrades += 1;
    summaryByDate.set(date, current);
  }

  return orm.select().from(schema.dailyJournal).orderBy(desc(schema.dailyJournal.date)).all().map((entry) => {
    const summary = summaryByDate.get(entry.date);

    return {
      dailyPnl: summary?.dailyPnl ?? 0,
      date: entry.date,
      exerciseToday: entry.exerciseToday ?? false,
      id: entry.id,
      marketBias: (entry.marketBias ?? 'neutral') as DailyJournalEntry['marketBias'],
      moodScore: entry.moodScore ?? 3,
      postMarketNotes: entry.postMarketNotes ?? '',
      preMarketPlan: entry.preMarketPlan ?? '',
      sleepHours: entry.sleepHours ?? 0,
      totalTrades: summary?.totalTrades ?? 0,
    };
  });
}

export function upsertJournalEntry(sqlite: SQLiteDatabase, date: string, patch: Pick<DailyJournalEntry, 'postMarketNotes' | 'preMarketPlan'>) {
  const orm = getOrm(sqlite);
  const existing = orm.select().from(schema.dailyJournal).where(eq(schema.dailyJournal.date, date)).get();

  if (existing) {
    orm.update(schema.dailyJournal).set({
      postMarketNotes: patch.postMarketNotes,
      preMarketPlan: patch.preMarketPlan,
    }).where(eq(schema.dailyJournal.id, existing.id)).run();
    return existing.id;
  }

  const id = createId('journal');
  orm.insert(schema.dailyJournal).values({
    date,
    exerciseToday: false,
    id,
    marketBias: 'neutral',
    moodScore: 3,
    postMarketNotes: patch.postMarketNotes,
    preMarketPlan: patch.preMarketPlan,
    sleepHours: 0,
  }).run();

  return id;
}

export function listRules(sqlite: SQLiteDatabase): Rule[] {
  const orm = getOrm(sqlite);
  const rules = orm.select().from(schema.rules).all();
  const checks = orm.select().from(schema.tradeRuleChecks).all();
  const currentMonth = new Date().toISOString().slice(0, 7);

  return rules.map((rule) => ({
    category: rule.category as Rule['category'],
    id: rule.id,
    isActive: rule.isActive,
    ruleText: rule.ruleText,
    violationsThisMonth: checks.filter((check) => check.ruleId === rule.id && check.status === 'failed' && check.checkedAt.startsWith(currentMonth)).length,
  }));
}

export function toggleRuleActive(sqlite: SQLiteDatabase, ruleId: string) {
  const orm = getOrm(sqlite);
  const current = orm.select().from(schema.rules).where(eq(schema.rules.id, ruleId)).get();
  if (!current) return;
  orm.update(schema.rules).set({ isActive: !current.isActive }).where(eq(schema.rules.id, ruleId)).run();
}

export function getDaysSinceLastRuleViolation(sqlite: SQLiteDatabase) {
  const sqliteRow = sqlite.getFirstSync<{ checked_at: string }>(
    `SELECT checked_at FROM trade_rule_checks WHERE status = 'failed' ORDER BY checked_at DESC LIMIT 1`
  );

  if (!sqliteRow?.checked_at) {
    return 999;
  }

  const millis = Date.now() - new Date(sqliteRow.checked_at).getTime();
  return Math.max(0, Math.floor(millis / (1000 * 60 * 60 * 24)));
}

function groupValues<
  TKey extends string,
  TValue extends string,
  TRow extends Record<TKey, string> & Record<TValue, string>,
>(rows: TRow[], key: TKey, value: TValue) {
  const map = new Map<string, string[]>();

  for (const row of rows) {
    const list = map.get(row[key]) ?? [];
    list.push(row[value]);
    map.set(row[key], list);
  }

  return map;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
