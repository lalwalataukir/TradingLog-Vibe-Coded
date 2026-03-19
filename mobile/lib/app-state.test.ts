import { describe, expect, it } from 'vitest';

import { closeTradeRecord, createInitialAppState, createTradeRecordFromDraft, getDaysSinceRuleViolation } from '@/lib/app-state';
import type { TradeDraft } from '@/lib/types';

describe('app state helpers', () => {
  it('creates an empty initial app state', () => {
    const state = createInitialAppState();

    expect(state.trades).toEqual([]);
    expect(state.journalEntries).toEqual([]);
    expect(state.rules).toEqual([]);
    expect(state.settings.currentCapital).toBe(2_000_000);
  });

  it('creates an open trade from a draft', () => {
    const state = createInitialAppState();
    const draft: TradeDraft = {
      confluenceFactors: ['volume_confirmation', 'vwap'],
      convictionLevel: 5,
      direction: 'long',
      emotionPreTrade: 'confident',
      entryFees: 50,
      entryPrice: 250,
      instrumentType: 'stock',
      market: 'indian_equity',
      quantity: 20,
      setupType: 'momentum',
      stopLoss: 240,
      symbol: 'TCS',
      target: 275,
      thesis: 'Continuation after opening range break.',
      timeframe: 'intraday',
    };

    const record = createTradeRecordFromDraft(draft, state.settings);

    expect(record.status).toBe('open');
    expect(record.symbol).toBe('TCS');
    expect(record.confluenceFactors).toEqual(['volume_confirmation', 'vwap']);
    expect(record.riskRewardPlanned).toBe(2.5);
  });

  it('closes an open trade and updates derived fields', () => {
    const state = createInitialAppState();
    const trade = createTradeRecordFromDraft(
      {
        convictionLevel: 4,
        direction: 'long',
        emotionPreTrade: 'calm',
        entryFees: 10,
        entryPrice: 100,
        instrumentType: 'stock',
        market: 'indian_equity',
        quantity: 10,
        setupType: 'breakout',
        stopLoss: 95,
        symbol: 'RELIANCE',
        target: 110,
        thesis: 'Opening range breakout.',
        timeframe: 'intraday',
      },
      state.settings
    );

    const closed = closeTradeRecord(trade, {
      emotionDuringTrade: 'confident',
      emotionPostTrade: 'calm',
      exitFees: 10,
      exitPrice: 112,
      followedPlan: true,
      lessonLearned: 'Executed the plan.',
      mistakeTags: [],
      planDeviationNotes: null,
      rating: 4,
    });

    expect(closed.status).toBe('closed');
    expect(closed.pnlNet).not.toBeNull();
    expect(closed.pnlPercentage).not.toBeNull();
  });

  it('returns fallback days-since-violation for clean trade history', () => {
    expect(getDaysSinceRuleViolation([])).toBe(999);
  });
});
