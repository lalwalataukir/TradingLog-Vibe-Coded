import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { buildAnalyticsSnapshot, type AnalyticsSnapshot } from '@/lib/analytics';
import { exportJsonBackup, exportTradesCsv } from '@/lib/export';
import type { AppSettings, DailyJournalEntry, Rule, TradeCloseInput, TradeDraft } from '@/lib/types';
import type { TradeRecord } from '@/db/repositories';
import {
  closeTrade,
  createTrade,
  getDaysSinceLastRuleViolation,
  getSettings,
  getTradeById,
  listJournalEntries,
  listRules,
  listTrades,
  toggleRuleActive,
  upsertJournalEntry,
  updateSettings,
} from '@/db/repositories';

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
  const sqlite = useSQLiteContext();
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [journalEntries, setJournalEntries] = useState<DailyJournalEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    currentCapital: 2_124_350,
    currency: 'INR',
    defaultMarket: 'indian_equity',
    riskPerTradeDefault: 2,
    startingCapital: 2_000_000,
    theme: 'dark',
    timezone: 'Asia/Kolkata',
  });
  const [isReady, setIsReady] = useState(false);

  const refresh = () => {
    setTrades(listTrades(sqlite));
    setRules(listRules(sqlite));
    setJournalEntries(listJournalEntries(sqlite));
    setSettings(getSettings(sqlite));
    setIsReady(true);
  };

  useEffect(() => {
    refresh();
  }, [sqlite]);

  const analytics = useMemo(
    () => buildAnalyticsSnapshot(trades, journalEntries, rules, getDaysSinceLastRuleViolation(sqlite), settings.currentCapital),
    [journalEntries, rules, settings.currentCapital, sqlite, trades]
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      analytics,
      closeTradeById: (tradeId, input) => {
        closeTrade(sqlite, tradeId, input);
        refresh();
      },
      createTradeDraft: (draft) => {
        const id = createTrade(sqlite, draft, settings);
        refresh();
        return id;
      },
      exportBackupCsv: async () => exportTradesCsv(trades),
      exportBackupJson: async () =>
        exportJsonBackup({
          exportedAt: new Date().toISOString(),
          journalEntries,
          rules,
          settings,
          trades,
        }),
      getTrade: (tradeId) => getTradeById(sqlite, tradeId),
      isReady,
      journalEntries,
      refresh,
      rules,
      saveJournal: (date, patch) => {
        upsertJournalEntry(sqlite, date, patch);
        refresh();
      },
      settings,
      toggleRule: (ruleId) => {
        toggleRuleActive(sqlite, ruleId);
        refresh();
      },
      trades,
      updateAppSettings: (patch) => {
        updateSettings(sqlite, patch);
        refresh();
      },
    }),
    [analytics, isReady, journalEntries, rules, settings, sqlite, trades]
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
