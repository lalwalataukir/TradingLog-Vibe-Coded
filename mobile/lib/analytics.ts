import { isSameDay, parseISO } from 'date-fns';

import { calculateProfitFactor, calculateRiskRewardActual, calculateRiskRewardPlanned } from '@/lib/calculations';
import type { DailyJournalEntry, Rule } from '@/lib/types';
import type { TradeRecord } from '@/db/repositories';

export interface SetupPerformance {
  averagePnl: number;
  totalPnl: number;
  trades: number;
  setupType: string;
  winRate: number;
}

export interface EmotionPerformance {
  emotion: string;
  averagePnl: number;
}

export interface AnalyticsSnapshot {
  averageRiskReward: number;
  currentStreakLabel: string;
  dailyPnlSeries: number[];
  daysSinceRuleViolation: number;
  emotionPerformance: EmotionPerformance[];
  profitFactor: number;
  recentTrades: TradeRecord[];
  setupPerformance: SetupPerformance[];
  todayTrades: TradeRecord[];
  totalPnl: number;
  totalPnlPercent: number;
  tradesThisMonth: number;
  winRate: number;
}

export function buildAnalyticsSnapshot(
  trades: TradeRecord[],
  journalEntries: DailyJournalEntry[],
  rules: Rule[],
  daysSinceRuleViolation: number,
  totalCapital = 2_000_000
): AnalyticsSnapshot {
  const closedTrades = trades.filter((trade) => trade.status === 'closed' && trade.pnlNet !== null);
  const winningTrades = closedTrades.filter((trade) => (trade.pnlNet ?? 0) > 0);
  const totalPnl = closedTrades.reduce((sum, trade) => sum + (trade.pnlNet ?? 0), 0);
  const averageRiskReward = closedTrades.length
    ? closedTrades.reduce(
        (sum, trade) =>
          sum + (trade.riskRewardActual ?? calculateRiskRewardActual(trade.entryPrice, trade.stopLoss ?? trade.entryPrice, trade.exitPrice ?? trade.entryPrice)),
        0
      ) / closedTrades.length
    : 0;

  const monthlyTrades = trades.filter((trade) => trade.entryDate.slice(0, 7) === new Date().toISOString().slice(0, 7));
  const totalPnlPercent = totalCapital === 0 ? 0 : (totalPnl / totalCapital) * 100;
  const streak = getCurrentStreak(closedTrades);
  const setupPerformance = buildSetupPerformance(closedTrades);
  const emotionPerformance = buildEmotionPerformance(closedTrades);
  const today = journalEntries[0] ? parseISO(journalEntries[0].date) : new Date();
  const todayTrades = trades.filter((trade) => isSameDay(parseISO(trade.entryDate), today));

  return {
    averageRiskReward,
    currentStreakLabel: streak,
    dailyPnlSeries: journalEntries.slice(0, 15).map((entry) => entry.dailyPnl).reverse(),
    daysSinceRuleViolation: Number.isFinite(daysSinceRuleViolation) ? daysSinceRuleViolation : rules.length > 0 ? 0 : 999,
    emotionPerformance,
    profitFactor: calculateProfitFactor(closedTrades.map((trade) => trade.pnlNet ?? 0)),
    recentTrades: trades.slice(0, 5),
    setupPerformance,
    todayTrades,
    totalPnl,
    totalPnlPercent,
    tradesThisMonth: monthlyTrades.length,
    winRate: closedTrades.length ? (winningTrades.length / closedTrades.length) * 100 : 0,
  };
}

function buildSetupPerformance(trades: TradeRecord[]): SetupPerformance[] {
  const groups = new Map<string, TradeRecord[]>();

  for (const trade of trades) {
    const list = groups.get(trade.setupType) ?? [];
    list.push(trade);
    groups.set(trade.setupType, list);
  }

  return Array.from(groups.entries())
    .map(([setupType, group]) => {
      const totalPnl = group.reduce((sum, trade) => sum + (trade.pnlNet ?? 0), 0);
      const winners = group.filter((trade) => (trade.pnlNet ?? 0) > 0).length;
      return {
        averagePnl: group.length ? totalPnl / group.length : 0,
        setupType,
        totalPnl,
        trades: group.length,
        winRate: group.length ? (winners / group.length) * 100 : 0,
      };
    })
    .sort((left, right) => right.totalPnl - left.totalPnl);
}

function buildEmotionPerformance(trades: TradeRecord[]): EmotionPerformance[] {
  const groups = new Map<string, TradeRecord[]>();

  for (const trade of trades) {
    const list = groups.get(trade.emotionPreTrade) ?? [];
    list.push(trade);
    groups.set(trade.emotionPreTrade, list);
  }

  return Array.from(groups.entries()).map(([emotion, group]) => ({
    averagePnl: group.length ? group.reduce((sum, trade) => sum + (trade.pnlNet ?? 0), 0) / group.length : 0,
    emotion,
  }));
}

function getCurrentStreak(trades: TradeRecord[]) {
  if (trades.length === 0) return '0';

  let streak = 0;
  let currentSign: 'L' | 'W' | null = null;
  const sorted = [...trades].sort((left, right) => right.entryDate.localeCompare(left.entryDate));

  for (const trade of sorted) {
    const sign: 'L' | 'W' = (trade.pnlNet ?? 0) >= 0 ? 'W' : 'L';
    if (currentSign === null) {
      currentSign = sign;
      streak = 1;
      continue;
    }

    if (currentSign !== sign) {
      break;
    }

    streak += 1;
  }

  return `${streak}${currentSign ?? ''}`;
}
