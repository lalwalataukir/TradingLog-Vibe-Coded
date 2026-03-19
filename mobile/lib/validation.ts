import type { AppSettings, Trade, TradeCloseInput, TradeDraft } from '@/lib/types';

export function validateTradeDraft(draft: TradeDraft) {
  const errors: string[] = [];

  if (!draft.symbol.trim()) {
    errors.push('Symbol is required.');
  }
  if (draft.entryPrice <= 0) {
    errors.push('Entry price must be greater than 0.');
  }
  if (draft.quantity <= 0) {
    errors.push('Quantity must be greater than 0.');
  }
  if (draft.entryFees < 0) {
    errors.push('Entry fees cannot be negative.');
  }
  if (draft.stopLoss <= 0) {
    errors.push('Stop loss must be greater than 0.');
  }
  if (draft.target <= 0) {
    errors.push('Target must be greater than 0.');
  }
  if (!draft.thesis.trim()) {
    errors.push('Thesis is required.');
  }

  if (draft.direction === 'long') {
    if (draft.stopLoss >= draft.entryPrice) {
      errors.push('For long trades, stop loss must be below entry price.');
    }
    if (draft.target <= draft.entryPrice) {
      errors.push('For long trades, target must be above entry price.');
    }
  } else {
    if (draft.stopLoss <= draft.entryPrice) {
      errors.push('For short trades, stop loss must be above entry price.');
    }
    if (draft.target >= draft.entryPrice) {
      errors.push('For short trades, target must be below entry price.');
    }
  }

  return errors;
}

export function validateTradeCloseInput(input: TradeCloseInput, trade: Pick<Trade, 'entryPrice' | 'status'>) {
  const errors: string[] = [];

  if (trade.status !== 'open') {
    errors.push('Only open trades can be closed.');
  }
  if (input.exitPrice <= 0) {
    errors.push('Exit price must be greater than 0.');
  }
  if (input.exitFees < 0) {
    errors.push('Exit fees cannot be negative.');
  }
  if (input.rating < 1 || input.rating > 5) {
    errors.push('Process rating must be between 1 and 5.');
  }
  if (!input.lessonLearned.trim()) {
    errors.push('Lesson learned is required.');
  }
  if (!input.followedPlan && !input.planDeviationNotes?.trim()) {
    errors.push('Deviation notes are required when the plan was not followed.');
  }
  if (input.exitPrice === trade.entryPrice) {
    errors.push('Exit price must differ from entry price.');
  }

  return errors;
}

export function validateSettingsPatch(nextSettings: Pick<AppSettings, 'currentCapital' | 'startingCapital'>) {
  const errors: string[] = [];

  if (!Number.isFinite(nextSettings.startingCapital) || nextSettings.startingCapital <= 0) {
    errors.push('Starting capital must be greater than 0.');
  }
  if (!Number.isFinite(nextSettings.currentCapital) || nextSettings.currentCapital <= 0) {
    errors.push('Current capital must be greater than 0.');
  }

  return errors;
}
