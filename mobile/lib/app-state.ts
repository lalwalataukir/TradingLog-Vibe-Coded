import { calculatePnl, calculatePnlNet, calculatePnlPercentage, calculatePositionSizePct, calculateRiskRewardActual, calculateRiskRewardPlanned } from '@/lib/calculations';
import type { AppSettings, DailyJournalEntry, Rule, TradeCloseInput, TradeDraft } from '@/lib/types';
import type { TradeRecord } from '@/db/repositories';

interface InitialAppState {
  journalEntries: DailyJournalEntry[];
  rules: Rule[];
  settings: AppSettings;
  trades: TradeRecord[];
}

export function createInitialAppState(): InitialAppState {
  return {
    journalEntries: [],
    rules: [],
    settings: {
      currentCapital: 2_000_000,
      currency: 'INR',
      defaultMarket: 'indian_equity',
      riskPerTradeDefault: 2,
      startingCapital: 2_000_000,
      theme: 'dark',
      timezone: 'Asia/Kolkata',
    },
    trades: [],
  };
}

export function createTradeRecordFromDraft(draft: TradeDraft, settings: AppSettings): TradeRecord {
  const now = new Date().toISOString();

  return {
    convictionLevel: draft.convictionLevel,
    confluenceFactors: draft.confluenceFactors ?? [],
    createdAt: now,
    direction: draft.direction,
    emotionDuringTrade: null,
    emotionPostTrade: null,
    emotionPreTrade: draft.emotionPreTrade,
    entryDate: now,
    entryFees: draft.entryFees,
    entryPrice: draft.entryPrice,
    exitDate: null,
    exitFees: null,
    exitPrice: null,
    followedPlan: null,
    id: `web-trade-${Date.now()}`,
    instrumentType: draft.instrumentType,
    lessonLearned: null,
    market: draft.market,
    mistakeTags: [],
    planDeviationNotes: null,
    pnl: null,
    pnlNet: null,
    pnlPercentage: null,
    positionSizePct: calculatePositionSizePct(draft.entryPrice, draft.quantity, settings.currentCapital),
    quantity: draft.quantity,
    rating: null,
    riskRewardActual: null,
    riskRewardPlanned: calculateRiskRewardPlanned(draft.entryPrice, draft.stopLoss, draft.target),
    setupType: draft.setupType,
    status: 'open',
    stopLoss: draft.stopLoss,
    symbol: draft.symbol.toUpperCase(),
    target: draft.target,
    thesis: draft.thesis,
    timeframe: draft.timeframe,
    updatedAt: now,
  };
}

export function closeTradeRecord(trade: TradeRecord, input: TradeCloseInput): TradeRecord {
  const updatedAt = new Date().toISOString();
  const pnl = calculatePnl(trade.entryPrice, input.exitPrice, trade.quantity, trade.direction);
  const pnlNet = calculatePnlNet(trade.entryPrice, input.exitPrice, trade.quantity, trade.direction, trade.entryFees, input.exitFees);

  return {
    ...trade,
    emotionDuringTrade: input.emotionDuringTrade,
    emotionPostTrade: input.emotionPostTrade,
    exitDate: updatedAt,
    exitFees: input.exitFees,
    exitPrice: input.exitPrice,
    followedPlan: input.followedPlan,
    lessonLearned: input.lessonLearned,
    mistakeTags: input.mistakeTags,
    planDeviationNotes: input.followedPlan ? null : input.planDeviationNotes ?? null,
    pnl,
    pnlNet,
    pnlPercentage: calculatePnlPercentage(trade.entryPrice, trade.quantity, pnlNet),
    rating: input.rating,
    riskRewardActual: trade.stopLoss ? calculateRiskRewardActual(trade.entryPrice, trade.stopLoss, input.exitPrice) : null,
    status: 'closed',
    updatedAt,
  };
}

export function getDaysSinceRuleViolation(trades: TradeRecord[]) {
  const failedTrade = trades
    .filter((trade) => trade.followedPlan === false)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];

  if (!failedTrade) {
    return 999;
  }

  const millis = Date.now() - new Date(failedTrade.updatedAt).getTime();
  return Math.max(0, Math.floor(millis / (1000 * 60 * 60 * 24)));
}
