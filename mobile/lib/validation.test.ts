import { describe, expect, it } from 'vitest';

import { validateSettingsPatch, validateTradeCloseInput, validateTradeDraft } from '@/lib/validation';
import type { TradeCloseInput, TradeDraft } from '@/lib/types';

const validDraft: TradeDraft = {
  confluenceFactors: ['volume_confirmation'],
  convictionLevel: 4,
  direction: 'long',
  emotionPreTrade: 'calm',
  entryFees: 25,
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
};

const validClose: TradeCloseInput = {
  emotionDuringTrade: 'confident',
  emotionPostTrade: 'calm',
  exitFees: 10,
  exitPrice: 110,
  followedPlan: true,
  lessonLearned: 'Stayed disciplined.',
  mistakeTags: [],
  planDeviationNotes: null,
  rating: 4,
};

describe('validation helpers', () => {
  it('accepts a valid trade draft', () => {
    expect(validateTradeDraft(validDraft)).toEqual([]);
  });

  it('rejects invalid long trade setup values', () => {
    expect(
      validateTradeDraft({
        ...validDraft,
        stopLoss: 101,
        target: 99,
      })
    ).toEqual([
      'For long trades, stop loss must be below entry price.',
      'For long trades, target must be above entry price.',
    ]);
  });

  it('rejects invalid close inputs', () => {
    expect(
      validateTradeCloseInput(
        {
          ...validClose,
          exitPrice: 100,
          followedPlan: false,
          planDeviationNotes: '',
          rating: 7,
        },
        {
          entryPrice: 100,
          status: 'closed',
        }
      )
    ).toEqual([
      'Only open trades can be closed.',
      'Process rating must be between 1 and 5.',
      'Deviation notes are required when the plan was not followed.',
      'Exit price must differ from entry price.',
    ]);
  });

  it('rejects invalid settings values', () => {
    expect(
      validateSettingsPatch({
        currentCapital: 0,
        startingCapital: Number.NaN,
      })
    ).toEqual([
      'Starting capital must be greater than 0.',
      'Current capital must be greater than 0.',
    ]);
  });
});
