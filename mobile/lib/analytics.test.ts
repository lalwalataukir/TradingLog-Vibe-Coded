import { describe, expect, it } from 'vitest';

import { buildAnalyticsSnapshot } from '@/lib/analytics';
import type { DailyJournalEntry, Rule } from '@/lib/types';
import type { TradeRecord } from '@/db/repositories';

const baseTrade: TradeRecord = {
  convictionLevel: 4,
  confluenceFactors: ['volume_confirmation'],
  createdAt: '2026-03-10T09:00:00.000Z',
  direction: 'long',
  emotionDuringTrade: 'confident',
  emotionPostTrade: 'calm',
  emotionPreTrade: 'calm',
  entryDate: '2026-03-10T09:00:00.000Z',
  entryFees: 20,
  entryPrice: 100,
  exitDate: '2026-03-10T10:00:00.000Z',
  exitFees: 20,
  exitPrice: 112,
  followedPlan: true,
  id: 'trade-1',
  instrumentType: 'stock',
  lessonLearned: 'Good execution.',
  market: 'indian_equity',
  mistakeTags: [],
  planDeviationNotes: null,
  pnl: 120,
  pnlNet: 80,
  pnlPercentage: 8,
  positionSizePct: 5,
  quantity: 10,
  rating: 4,
  riskRewardActual: 2.4,
  riskRewardPlanned: 2,
  setupType: 'breakout',
  status: 'closed',
  stopLoss: 95,
  symbol: 'RELIANCE',
  target: 110,
  thesis: 'Breakout with volume.',
  timeframe: 'intraday',
  updatedAt: '2026-03-10T10:00:00.000Z',
};

const rules: Rule[] = [
  {
    category: 'risk',
    id: 'rule-1',
    isActive: true,
    ruleText: 'Always define stop loss before entry',
    violationsThisMonth: 0,
  },
];

const journalEntries: DailyJournalEntry[] = [
  {
    dailyPnl: 50,
    date: '2026-03-10',
    exerciseToday: true,
    id: 'journal-1',
    marketBias: 'bullish',
    moodScore: 4,
    postMarketNotes: 'Stayed patient.',
    preMarketPlan: 'Wait for opening range break.',
    sleepHours: 7,
    totalTrades: 2,
  },
  {
    dailyPnl: -25,
    date: '2026-03-09',
    exerciseToday: false,
    id: 'journal-2',
    marketBias: 'neutral',
    moodScore: 3,
    postMarketNotes: 'Too reactive.',
    preMarketPlan: 'Keep size small.',
    sleepHours: 6,
    totalTrades: 1,
  },
];

describe('buildAnalyticsSnapshot', () => {
  it('returns safe defaults for empty datasets', () => {
    const snapshot = buildAnalyticsSnapshot([], [], [], Number.NaN, 0);

    expect(snapshot.totalPnl).toBe(0);
    expect(snapshot.totalPnlPercent).toBe(0);
    expect(snapshot.winRate).toBe(0);
    expect(snapshot.averageRiskReward).toBe(0);
    expect(snapshot.profitFactor).toBe(0);
    expect(snapshot.currentStreakLabel).toBe('0');
    expect(snapshot.daysSinceRuleViolation).toBe(999);
    expect(snapshot.recentTrades).toEqual([]);
    expect(snapshot.todayTrades).toEqual([]);
    expect(snapshot.setupPerformance).toEqual([]);
    expect(snapshot.emotionPerformance).toEqual([]);
  });

  it('derives the main dashboard metrics from trades and journal entries', () => {
    const snapshot = buildAnalyticsSnapshot([baseTrade], journalEntries, rules, 12, 400);

    expect(snapshot.totalPnl).toBe(80);
    expect(snapshot.winRate).toBe(100);
    expect(snapshot.averageRiskReward).toBe(2.4);
    expect(snapshot.profitFactor).toBe(0);
    expect(snapshot.currentStreakLabel).toBe('1W');
    expect(snapshot.daysSinceRuleViolation).toBe(12);
    expect(snapshot.dailyPnlSeries).toEqual([-25, 50]);
    expect(snapshot.totalPnlPercent).toBe(20);
    expect(snapshot.setupPerformance).toEqual([
      {
        averagePnl: 80,
        setupType: 'breakout',
        totalPnl: 80,
        trades: 1,
        winRate: 100,
      },
    ]);
  });

  it('uses fallback actual risk reward math and includes open trades in today list', () => {
    const openTrade: TradeRecord = {
      ...baseTrade,
      exitDate: null,
      exitFees: null,
      exitPrice: null,
      id: 'trade-2',
      pnl: null,
      pnlNet: null,
      pnlPercentage: null,
      riskRewardActual: null,
      status: 'open',
      symbol: 'TCS',
      updatedAt: '2026-03-10T09:10:00.000Z',
    };
    const closedWithoutActual: TradeRecord = {
      ...baseTrade,
      id: 'trade-3',
      pnlNet: -40,
      riskRewardActual: null,
      setupType: 'pullback',
      symbol: 'INFY',
    };

    const snapshot = buildAnalyticsSnapshot([baseTrade, closedWithoutActual, openTrade], journalEntries, rules, Number.NaN, 2_000_000);

    expect(snapshot.averageRiskReward).toBeCloseTo((2.4 + 2.4) / 2);
    expect(snapshot.todayTrades.map((trade) => trade.id)).toEqual(['trade-1', 'trade-3', 'trade-2']);
    expect(snapshot.emotionPerformance).toEqual([{ averagePnl: 20, emotion: 'calm' }]);
    expect(snapshot.daysSinceRuleViolation).toBe(0);
    expect(snapshot.profitFactor).toBe(2);
  });

  it('reports losing streaks from the most recent closed trades', () => {
    const latestLoss: TradeRecord = {
      ...baseTrade,
      entryDate: '2026-03-11T09:00:00.000Z',
      id: 'trade-4',
      pnlNet: -20,
      symbol: 'SBIN',
      updatedAt: '2026-03-11T10:00:00.000Z',
    };
    const olderLoss: TradeRecord = {
      ...baseTrade,
      entryDate: '2026-03-10T08:00:00.000Z',
      id: 'trade-5',
      pnlNet: -10,
      symbol: 'ICICIBANK',
      updatedAt: '2026-03-10T09:00:00.000Z',
    };
    const olderWin: TradeRecord = {
      ...baseTrade,
      entryDate: '2026-03-09T08:00:00.000Z',
      id: 'trade-6',
      pnlNet: 30,
      symbol: 'AXISBANK',
      updatedAt: '2026-03-09T09:00:00.000Z',
    };

    const snapshot = buildAnalyticsSnapshot([olderWin, olderLoss, latestLoss], journalEntries, rules, 2, 1_000);

    expect(snapshot.currentStreakLabel).toBe('2L');
  });
});
