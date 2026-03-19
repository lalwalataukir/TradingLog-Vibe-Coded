export type Market = 'indian_equity' | 'indian_fo' | 'us_equity' | 'commodity' | 'crypto';
export type InstrumentType = 'stock' | 'futures' | 'call_option' | 'put_option' | 'index';
export type TradeDirection = 'long' | 'short';
export type TradeStatus = 'open' | 'closed';
export type SetupType =
  | 'breakout'
  | 'breakdown'
  | 'pullback'
  | 'reversal'
  | 'momentum'
  | 'range_trade'
  | 'earnings_play'
  | 'news_event'
  | 'gap_fill'
  | 'trend_following'
  | 'mean_reversion'
  | 'custom';
export type Timeframe = 'scalp_<15min' | 'intraday' | 'swing_2_14d' | 'positional_14d+';
export type Emotion = 'confident' | 'anxious' | 'fomo' | 'revenge' | 'bored' | 'calm' | 'greedy' | 'fearful' | 'neutral';
export type ConfluenceFactor =
  | 'volume_confirmation'
  | 'support_resistance'
  | 'moving_average'
  | 'rsi_divergence'
  | 'macd_crossover'
  | 'vwap'
  | 'oi_buildup'
  | 'fib_levels'
  | 'trendline'
  | 'sector_strength'
  | 'fii_dii_flow'
  | 'news_catalyst';
export type MistakeTag =
  | 'entered_too_early'
  | 'entered_too_late'
  | 'no_stop_loss'
  | 'moved_stop_loss'
  | 'exited_too_early'
  | 'held_too_long'
  | 'oversized'
  | 'undersized'
  | 'chased_entry'
  | 'revenge_trade'
  | 'ignored_plan'
  | 'no_thesis'
  | 'poor_timing'
  | 'wrong_direction';
export type RuleCategory = 'risk' | 'entry' | 'exit' | 'psychology' | 'sizing';
export type RuleCheckStatus = 'failed' | 'passed';
export type MarketBias = 'bullish' | 'bearish' | 'neutral' | 'no_view';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface Trade {
  createdAt: string;
  id: string;
  symbol: string;
  market: Market;
  instrumentType: InstrumentType;
  direction: TradeDirection;
  status: TradeStatus;
  setupType: SetupType;
  timeframe: Timeframe;
  entryDate: string;
  entryPrice: number;
  quantity: number;
  entryFees: number;
  stopLoss: number | null;
  target: number | null;
  exitDate: string | null;
  exitPrice: number | null;
  exitFees: number | null;
  riskRewardPlanned?: number | null;
  riskRewardActual?: number | null;
  positionSizePct?: number | null;
  pnl: number | null;
  pnlNet: number | null;
  pnlPercentage: number | null;
  emotionPreTrade: Emotion;
  emotionDuringTrade?: Emotion | null;
  emotionPostTrade?: Emotion | null;
  convictionLevel: number;
  followedPlan?: boolean | null;
  planDeviationNotes?: string | null;
  thesis?: string | null;
  lessonLearned?: string | null;
  screenshots?: string[];
  rating?: number | null;
  updatedAt: string;
}

export interface TradeDraft {
  market: Market;
  symbol: string;
  instrumentType: InstrumentType;
  direction: TradeDirection;
  entryPrice: number;
  quantity: number;
  entryFees: number;
  stopLoss: number;
  target: number;
  setupType: SetupType;
  timeframe: Timeframe;
  thesis: string;
  convictionLevel: number;
  emotionPreTrade: Emotion;
  confluenceFactors?: ConfluenceFactor[];
}

export interface TradeCloseInput {
  exitPrice: number;
  exitFees: number;
  emotionDuringTrade: Emotion;
  emotionPostTrade: Emotion;
  followedPlan: boolean;
  planDeviationNotes: string | null;
  lessonLearned: string;
  mistakeTags: MistakeTag[];
  rating: number;
}

export interface Rule {
  id: string;
  ruleText: string;
  category: RuleCategory;
  isActive: boolean;
  violationsThisMonth: number;
}

export interface DailyJournalEntry {
  id: string;
  date: string;
  preMarketPlan: string;
  marketBias: MarketBias;
  moodScore: number;
  sleepHours: number;
  exerciseToday: boolean;
  totalTrades: number;
  dailyPnl: number;
  postMarketNotes: string;
  biggestMistake?: string;
  biggestWinReason?: string;
}

export interface AppSettings {
  startingCapital: number;
  currentCapital: number;
  defaultMarket: Market;
  currency: 'INR' | 'USD';
  timezone: string;
  riskPerTradeDefault: number;
  theme: ThemeMode;
}

export interface CapitalAdjustment {
  id: string;
  effectiveDate: string;
  amountDelta: number;
  note: string;
}

export interface TradeFilters {
  status?: TradeStatus | 'all';
  direction?: TradeDirection | 'all';
  market?: Market | 'all';
  winnerState?: 'winners' | 'losers' | 'all';
  search?: string;
}

export interface AnalyticsFilters {
  rangeLabel: string;
}

export interface DashboardSummary {
  totalPnl: number;
  totalPnlPercent: number;
  winRate: number;
  averageRiskReward: number;
  profitFactor: number;
  streakLabel: string;
  tradesThisMonth: number;
}
