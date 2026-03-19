import { describe, expect, it } from 'vitest';

import { csvEscape, serializeTradesCsv, stringifyJsonBackup, type BackupPayload } from '@/lib/export-helpers';
import type { Trade } from '@/lib/types';

const trades: Trade[] = [
  {
    convictionLevel: 3,
    createdAt: '2026-03-10T09:00:00.000Z',
    direction: 'long',
    emotionPreTrade: 'calm',
    entryDate: '2026-03-10T09:00:00.000Z',
    entryFees: 10,
    entryPrice: 100,
    exitDate: '2026-03-10T10:00:00.000Z',
    exitFees: 10,
    exitPrice: 110,
    id: 'trade-1',
    instrumentType: 'stock',
    market: 'indian_equity',
    pnl: 100,
    pnlNet: 80,
    pnlPercentage: 8,
    quantity: 10,
    setupType: 'breakout',
    status: 'closed',
    stopLoss: 95,
    symbol: 'RELIANCE, EQ',
    target: 110,
    timeframe: 'intraday',
    updatedAt: '2026-03-10T10:00:00.000Z',
  },
];

describe('export helpers', () => {
  it('escapes csv fields that contain commas, quotes, or new lines', () => {
    expect(csvEscape('plain')).toBe('plain');
    expect(csvEscape('A,B')).toBe('"A,B"');
    expect(csvEscape('A "quote"')).toBe('"A ""quote"""');
    expect(csvEscape('A\nB')).toBe('"A\nB"');
  });

  it('serializes trades into a csv string with a header row', () => {
    const csv = serializeTradesCsv(trades);

    expect(csv).toContain('id,symbol,market,direction,status,entryDate,entryPrice,quantity,exitDate,exitPrice,pnlNet');
    expect(csv).toContain('"RELIANCE, EQ"');
    expect(csv).toContain('trade-1');
  });

  it('stringifies backup payloads consistently', () => {
    const payload: BackupPayload = {
      exportedAt: '2026-03-15T12:00:00.000Z',
      journalEntries: [],
      rules: [],
      settings: {
        currency: 'INR',
        currentCapital: 2100000,
        defaultMarket: 'indian_equity',
        riskPerTradeDefault: 2,
        startingCapital: 2000000,
        theme: 'dark',
        timezone: 'Asia/Kolkata',
      },
      trades,
    };

    const json = stringifyJsonBackup(payload);

    expect(JSON.parse(json)).toEqual(payload);
    expect(json).toContain('"exportedAt": "2026-03-15T12:00:00.000Z"');
  });
});
