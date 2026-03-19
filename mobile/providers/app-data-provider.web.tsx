import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

import { closeTradeRecord, createInitialAppState, createTradeRecordFromDraft, getDaysSinceRuleViolation } from '@/lib/app-state';
import { buildAnalyticsSnapshot, type AnalyticsSnapshot } from '@/lib/analytics';
import { stringifyJsonBackup, serializeTradesCsv } from '@/lib/export-helpers';
import type { AppSettings, DailyJournalEntry, Rule, TradeCloseInput, TradeDraft } from '@/lib/types';
import type { TradeRecord } from '@/db/repositories';

interface AppDataContextValue {
  analytics: AnalyticsSnapshot;
  closeTradeById: (tradeId: string, input: TradeCloseInput) => void;
  createTradeDraft: (draft: TradeDraft) => string;
  exportBackupCsv: () => Promise<string>;
  exportBackupJson: () => Promise<string>;
  getTrade: (tradeId: string) => TradeRecord | null;
  isReady: boolean;
  journalEntries: DailyJournalEntry[];
  refresh: () => void;
  rules: Rule[];
  saveJournal: (date: string, patch: Pick<DailyJournalEntry, 'postMarketNotes' | 'preMarketPlan'>) => void;
  settings: AppSettings;
  toggleRule: (ruleId: string) => void;
  trades: TradeRecord[];
  updateAppSettings: (patch: Partial<AppSettings>) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: PropsWithChildren) {
  const initialData = useMemo(() => createInitialAppState(), []);
  const [trades, setTrades] = useState<TradeRecord[]>(initialData.trades);
  const [rules, setRules] = useState<Rule[]>(initialData.rules);
  const [journalEntries, setJournalEntries] = useState<DailyJournalEntry[]>(initialData.journalEntries);
  const [settings, setSettings] = useState<AppSettings>(initialData.settings);

  const analytics = useMemo(
    () => buildAnalyticsSnapshot(trades, journalEntries, rules, getDaysSinceRuleViolation(trades), settings.currentCapital),
    [journalEntries, rules, settings.currentCapital, trades]
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      analytics,
      closeTradeById: (tradeId, input) => {
        setTrades((current) => current.map((trade) => (trade.id === tradeId ? closeTradeRecord(trade, input) : trade)));
      },
      createTradeDraft: (draft) => {
        const record = createTradeRecordFromDraft(draft, settings);
        setTrades((current) => [record, ...current]);
        return record.id;
      },
      exportBackupCsv: async () => {
        const csv = serializeTradesCsv(trades);
        return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
      },
      exportBackupJson: async () => {
        const json = stringifyJsonBackup({
          exportedAt: new Date().toISOString(),
          journalEntries,
          rules,
          settings,
          trades,
        });
        return `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
      },
      getTrade: (tradeId) => trades.find((trade) => trade.id === tradeId) ?? null,
      isReady: true,
      journalEntries,
      refresh: () => undefined,
      rules,
      saveJournal: (date, patch) => {
        setJournalEntries((current) => {
          const existing = current.find((entry) => entry.date === date);

          if (existing) {
            return current.map((entry) =>
              entry.date === date
                ? {
                    ...entry,
                    ...patch,
                  }
                : entry
            );
          }

          const dayTrades = trades.filter((trade) => trade.entryDate.slice(0, 10) === date);

          return [
            {
              dailyPnl: dayTrades.reduce((sum, trade) => sum + (trade.pnlNet ?? 0), 0),
              date,
              exerciseToday: false,
              id: `journal-${date}`,
              marketBias: 'neutral' as const,
              moodScore: 3,
              postMarketNotes: patch.postMarketNotes,
              preMarketPlan: patch.preMarketPlan,
              sleepHours: 0,
              totalTrades: dayTrades.length,
            },
            ...current,
          ].sort((left, right) => right.date.localeCompare(left.date));
        });
      },
      settings,
      toggleRule: (ruleId) => {
        setRules((current) =>
          current.map((rule) =>
            rule.id === ruleId
              ? {
                  ...rule,
                  isActive: !rule.isActive,
                }
              : rule
          )
        );
      },
      trades,
      updateAppSettings: (patch) => {
        setSettings((current) => ({
          ...current,
          ...patch,
        }));
      },
    }),
    [analytics, journalEntries, rules, settings, trades]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }

  return context;
}
