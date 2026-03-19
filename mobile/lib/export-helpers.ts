import type { AppSettings, DailyJournalEntry, Rule, Trade } from '@/lib/types';

export interface BackupPayload {
  exportedAt: string;
  journalEntries: DailyJournalEntry[];
  rules: Rule[];
  settings: AppSettings;
  trades: Trade[];
}

export function stringifyJsonBackup(payload: BackupPayload) {
  return JSON.stringify(payload, null, 2);
}

export function serializeTradesCsv(trades: Trade[]) {
  const rows = [
    ['id', 'symbol', 'market', 'direction', 'status', 'entryDate', 'entryPrice', 'quantity', 'exitDate', 'exitPrice', 'pnlNet'],
    ...trades.map((trade) => [
      trade.id,
      trade.symbol,
      trade.market,
      trade.direction,
      trade.status,
      trade.entryDate,
      String(trade.entryPrice),
      String(trade.quantity),
      trade.exitDate ?? '',
      trade.exitPrice === null ? '' : String(trade.exitPrice),
      trade.pnlNet === null ? '' : String(trade.pnlNet),
    ]),
  ];

  return rows.map((row) => row.map(csvEscape).join(',')).join('\n');
}

export function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}
