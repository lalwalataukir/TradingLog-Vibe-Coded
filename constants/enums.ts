// Markets
export const MARKETS = [
    { value: 'indian_equity', label: 'Indian Equity' },
    { value: 'indian_fo', label: 'Indian F&O' },
    { value: 'us_equity', label: 'US Equity' },
    { value: 'commodity', label: 'Commodity' },
    { value: 'crypto', label: 'Crypto' },
] as const;
export type Market = typeof MARKETS[number]['value'];

// Instrument Types
export const INSTRUMENT_TYPES = [
    { value: 'stock', label: 'Stock' },
    { value: 'futures', label: 'Futures' },
    { value: 'call_option', label: 'Call Option' },
    { value: 'put_option', label: 'Put Option' },
    { value: 'index', label: 'Index' },
] as const;
export type InstrumentType = typeof INSTRUMENT_TYPES[number]['value'];

// Directions
export const DIRECTIONS = [
    { value: 'long', label: 'Long' },
    { value: 'short', label: 'Short' },
] as const;
export type Direction = typeof DIRECTIONS[number]['value'];

// Timeframes
export const TIMEFRAMES = [
    { value: 'scalp_<15min', label: 'Scalp (<15m)' },
    { value: 'intraday', label: 'Intraday' },
    { value: 'swing_2_14d', label: 'Swing (2-14d)' },
    { value: 'positional_14d+', label: 'Positional (14d+)' },
] as const;
export type Timeframe = typeof TIMEFRAMES[number]['value'];

// Setup Types
export const SETUP_TYPES = [
    { value: 'breakout', label: 'Breakout' },
    { value: 'breakdown', label: 'Breakdown' },
    { value: 'pullback', label: 'Pullback' },
    { value: 'reversal', label: 'Reversal' },
    { value: 'momentum', label: 'Momentum' },
    { value: 'range_trade', label: 'Range Trade' },
    { value: 'earnings_play', label: 'Earnings Play' },
    { value: 'news_event', label: 'News Event' },
    { value: 'gap_fill', label: 'Gap Fill' },
    { value: 'trend_following', label: 'Trend Following' },
    { value: 'mean_reversion', label: 'Mean Reversion' },
    { value: 'custom', label: 'Custom' },
] as const;
export type SetupType = typeof SETUP_TYPES[number]['value'];

// Emotions
export const EMOTIONS = [
    { value: 'confident', label: 'Confident', emoji: '😎' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'fomo', label: 'FOMO', emoji: '😤' },
    { value: 'revenge', label: 'Revenge', emoji: '😡' },
    { value: 'bored', label: 'Bored', emoji: '😑' },
    { value: 'calm', label: 'Calm', emoji: '😌' },
    { value: 'greedy', label: 'Greedy', emoji: '🤑' },
    { value: 'fearful', label: 'Fearful', emoji: '😨' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
] as const;
export type Emotion = typeof EMOTIONS[number]['value'];

// Confluence Factors
export const CONFLUENCE_FACTORS = [
    { value: 'volume_confirmation', label: 'Volume' },
    { value: 'support_resistance', label: 'S/R Levels' },
    { value: 'moving_average', label: 'Moving Avg' },
    { value: 'rsi_divergence', label: 'RSI Divergence' },
    { value: 'macd_crossover', label: 'MACD Cross' },
    { value: 'vwap', label: 'VWAP' },
    { value: 'oi_buildup', label: 'OI Buildup' },
    { value: 'fib_levels', label: 'Fibonacci' },
    { value: 'trendline', label: 'Trendline' },
    { value: 'sector_strength', label: 'Sector Strength' },
    { value: 'fii_dii_flow', label: 'FII/DII Flow' },
    { value: 'news_catalyst', label: 'News Catalyst' },
] as const;
export type ConfluenceFactor = typeof CONFLUENCE_FACTORS[number]['value'];

// Mistake Tags
export const MISTAKE_TAGS = [
    { value: 'entered_too_early', label: 'Entered Too Early' },
    { value: 'entered_too_late', label: 'Entered Too Late' },
    { value: 'no_stop_loss', label: 'No Stop Loss' },
    { value: 'moved_stop_loss', label: 'Moved Stop Loss' },
    { value: 'exited_too_early', label: 'Exited Too Early' },
    { value: 'held_too_long', label: 'Held Too Long' },
    { value: 'oversized', label: 'Oversized' },
    { value: 'undersized', label: 'Undersized' },
    { value: 'chased_entry', label: 'Chased Entry' },
    { value: 'revenge_trade', label: 'Revenge Trade' },
    { value: 'ignored_plan', label: 'Ignored Plan' },
    { value: 'no_thesis', label: 'No Thesis' },
    { value: 'poor_timing', label: 'Poor Timing' },
    { value: 'wrong_direction', label: 'Wrong Direction' },
] as const;
export type MistakeTag = typeof MISTAKE_TAGS[number]['value'];

// Rule Categories
export const RULE_CATEGORIES = [
    { value: 'risk', label: 'Risk' },
    { value: 'entry', label: 'Entry' },
    { value: 'exit', label: 'Exit' },
    { value: 'psychology', label: 'Psychology' },
    { value: 'sizing', label: 'Sizing' },
] as const;
export type RuleCategory = typeof RULE_CATEGORIES[number]['value'];

// Trade Status
export type TradeStatus = 'open' | 'closed';

// Market Bias
export const MARKET_BIASES = [
    { value: 'bullish', label: 'Bullish', emoji: '🐂' },
    { value: 'bearish', label: 'Bearish', emoji: '🐻' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'no_view', label: 'No View', emoji: '🤷' },
] as const;
export type MarketBias = typeof MARKET_BIASES[number]['value'];
