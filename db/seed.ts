import { v4 as uuidv4 } from 'uuid';
import {
    calcPnl,
    calcPnlNet,
    calcPnlPercentage,
    calcRiskRewardActual,
    calcRiskRewardPlanned,
} from '../lib/calculations';
import db from './index';
import { dailyJournal, rules, settings, trades } from './schema';

function makeId(): string {
    return uuidv4();
}

type TradeInput = {
    symbol: string;
    market: string;
    instrument_type: string;
    direction: 'long' | 'short';
    entry_date: string;
    entry_price: number;
    quantity: number;
    entry_fees: number;
    exit_date?: string;
    exit_price?: number;
    exit_fees?: number;
    stop_loss?: number;
    target?: number;
    setup_type?: string;
    thesis?: string;
    timeframe?: string;
    confluence_factors?: string[];
    emotion_pre_trade?: string;
    emotion_during_trade?: string;
    emotion_post_trade?: string;
    conviction_level?: number;
    followed_plan?: boolean;
    plan_deviation_notes?: string;
    lesson_learned?: string;
    mistake_tags?: string[];
    rating?: number;
    actual_sl_hit?: boolean;
    sl_honored?: boolean;
    expiry_date?: string;
    strike_price?: number;
};

function buildTrade(t: TradeInput) {
    const status = t.exit_date ? 'closed' : 'open';
    const pnl = t.exit_price != null
        ? calcPnl(t.entry_price, t.exit_price, t.quantity, t.direction)
        : null;
    const pnl_net = pnl != null
        ? calcPnlNet(pnl, t.entry_fees, t.exit_fees ?? 0)
        : null;
    const pnl_percentage = pnl_net != null
        ? calcPnlPercentage(pnl_net, t.entry_price, t.quantity)
        : null;
    const rr_planned = calcRiskRewardPlanned(t.entry_price, t.target, t.stop_loss);
    const rr_actual = t.exit_price != null
        ? calcRiskRewardActual(t.entry_price, t.exit_price, t.stop_loss)
        : null;

    return {
        id: makeId(),
        symbol: t.symbol,
        market: t.market,
        instrument_type: t.instrument_type,
        direction: t.direction,
        entry_date: t.entry_date,
        entry_price: t.entry_price,
        quantity: t.quantity,
        entry_fees: t.entry_fees,
        exit_date: t.exit_date ?? null,
        exit_price: t.exit_price ?? null,
        exit_fees: t.exit_fees ?? 0,
        status,
        stop_loss: t.stop_loss ?? null,
        target: t.target ?? null,
        actual_sl_hit: t.actual_sl_hit ?? false,
        sl_honored: t.sl_honored ?? null,
        risk_reward_planned: rr_planned,
        risk_reward_actual: rr_actual,
        position_size_pct: null,
        setup_type: t.setup_type ?? null,
        thesis: t.thesis ?? null,
        timeframe: t.timeframe ?? null,
        confluence_factors: t.confluence_factors ? JSON.stringify(t.confluence_factors) : null,
        emotion_pre_trade: t.emotion_pre_trade ?? null,
        emotion_during_trade: t.emotion_during_trade ?? null,
        emotion_post_trade: t.emotion_post_trade ?? null,
        conviction_level: t.conviction_level ?? null,
        followed_plan: t.followed_plan ?? null,
        plan_deviation_notes: t.plan_deviation_notes ?? null,
        pnl,
        pnl_net,
        pnl_percentage,
        lesson_learned: t.lesson_learned ?? null,
        mistake_tags: t.mistake_tags ? JSON.stringify(t.mistake_tags) : null,
        rating: t.rating ?? null,
        screenshots: null,
        expiry_date: t.expiry_date ?? null,
        strike_price: t.strike_price ?? null,
    };
}

const SEED_TRADES: TradeInput[] = [
    // ─── December 2024 ───────────────────────────────────────────────────────
    {
        symbol: 'RELIANCE', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2024-12-02T09:30:00', entry_price: 2850, quantity: 20, entry_fees: 120,
        exit_date: '2024-12-03T14:20:00', exit_price: 2920, exit_fees: 120,
        stop_loss: 2800, target: 2950,
        setup_type: 'breakout', thesis: 'Breaking above key resistance with strong volume.',
        timeframe: 'swing_2_14d', confluence_factors: ['volume_confirmation', 'support_resistance'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Patience paid off. Volume confirmation was key.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'TCS', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2024-12-04T10:15:00', entry_price: 4200, quantity: 10, entry_fees: 150,
        exit_date: '2024-12-04T15:10:00', exit_price: 4150, exit_fees: 150,
        stop_loss: 4140, target: 4350,
        setup_type: 'pullback', thesis: 'Pullback to 20 EMA in an uptrend.',
        timeframe: 'intraday', confluence_factors: ['moving_average', 'trendline'],
        emotion_pre_trade: 'calm', emotion_during_trade: 'anxious', emotion_post_trade: 'fearful',
        conviction_level: 3, followed_plan: false, plan_deviation_notes: 'Panicked and exited before stop was hit.',
        lesson_learned: 'Stick to the stop. Anxiety caused early exit.', mistake_tags: ['exited_too_early'],
        rating: 2, sl_honored: false, actual_sl_hit: false,
    },
    {
        symbol: 'NIFTY25JANPE23000', market: 'indian_fo', instrument_type: 'put_option', direction: 'long',
        entry_date: '2024-12-05T09:45:00', entry_price: 85, quantity: 75, entry_fees: 250,
        exit_date: '2024-12-06T11:30:00', exit_price: 145, exit_fees: 250,
        stop_loss: 60, target: 150, expiry_date: '2025-01-30', strike_price: 23000,
        setup_type: 'reversal', thesis: 'Nifty overbought on RSI, expecting correction.',
        timeframe: 'swing_2_14d', confluence_factors: ['rsi_divergence', 'fib_levels'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 5, followed_plan: true, lesson_learned: 'RSI divergence + fib confluence = solid setup.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'HDFC', market: 'indian_equity', instrument_type: 'stock', direction: 'short',
        entry_date: '2024-12-09T09:30:00', entry_price: 1720, quantity: 30, entry_fees: 180,
        exit_date: '2024-12-10T14:00:00', exit_price: 1740, exit_fees: 180,
        stop_loss: 1745, target: 1680,
        setup_type: 'breakdown', thesis: 'Breaking below support with FII selling.',
        timeframe: 'swing_2_14d', confluence_factors: ['volume_confirmation', 'fii_dii_flow'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'anxious', emotion_post_trade: 'neutral',
        conviction_level: 3, followed_plan: false, plan_deviation_notes: 'Should have exited at SL but held hoping for reversal.',
        lesson_learned: 'When SL is hit, exit. No exceptions.', mistake_tags: ['moved_stop_loss', 'held_too_long'],
        rating: 1, sl_honored: false, actual_sl_hit: true,
    },
    {
        symbol: 'NVDA', market: 'us_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2024-12-10T21:30:00', entry_price: 138.50, quantity: 10, entry_fees: 5,
        exit_date: '2024-12-12T21:30:00', exit_price: 148.20, exit_fees: 5,
        stop_loss: 132, target: 155,
        setup_type: 'momentum', thesis: 'AI momentum continuing, breaking all-time high.',
        timeframe: 'swing_2_14d', confluence_factors: ['volume_confirmation', 'sector_strength', 'moving_average'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'greedy', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Greed made me want to hold longer. Took profits at target.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'TATAMOTORS', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2024-12-11T11:00:00', entry_price: 980, quantity: 25, entry_fees: 120,
        exit_date: '2024-12-11T15:00:00', exit_price: 965, exit_fees: 120,
        stop_loss: 960, target: 1020,
        setup_type: 'pullback', thesis: 'Pullback in a strong uptrend near 13 EMA.',
        timeframe: 'intraday', confluence_factors: ['moving_average', 'vwap'],
        emotion_pre_trade: 'neutral', emotion_during_trade: 'anxious', emotion_post_trade: 'neutral',
        conviction_level: 3, followed_plan: true,
        lesson_learned: 'Market was choppy. Better to skip on chop days.',
        mistake_tags: ['poor_timing'], rating: 3, sl_honored: true, actual_sl_hit: true,
    },
    {
        symbol: 'INFY', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2024-12-12T09:35:00', entry_price: 1890, quantity: 15, entry_fees: 100,
        exit_date: '2024-12-16T10:00:00', exit_price: 1965, exit_fees: 100,
        stop_loss: 1855, target: 1980,
        setup_type: 'trend_following', thesis: 'IT sector outperforming. INFY breaking resistance.',
        timeframe: 'swing_2_14d', confluence_factors: ['sector_strength', 'volume_confirmation', 'trendline'],
        emotion_pre_trade: 'calm', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Sector momentum trade worked perfectly.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'BANKNIFTY25JANPE48000', market: 'indian_fo', instrument_type: 'put_option', direction: 'long',
        entry_date: '2024-12-13T09:45:00', entry_price: 120, quantity: 50, entry_fees: 200,
        exit_date: '2024-12-13T14:00:00', exit_price: 85, exit_fees: 200,
        stop_loss: 90, target: 200, expiry_date: '2025-01-30', strike_price: 48000,
        setup_type: 'reversal', thesis: 'BankNifty near resistance, expecting pullback.',
        timeframe: 'intraday', confluence_factors: ['support_resistance', 'rsi_divergence'],
        emotion_pre_trade: 'anxious', emotion_during_trade: 'fearful', emotion_post_trade: 'neutral',
        conviction_level: 2, followed_plan: true,
        lesson_learned: 'Low conviction trades should be skipped. Anxiety = bad trade.',
        mistake_tags: ['no_thesis'], rating: 2, sl_honored: true, actual_sl_hit: true,
    },
    {
        symbol: 'META', market: 'us_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2024-12-16T21:30:00', entry_price: 615, quantity: 5, entry_fees: 5,
        exit_date: '2024-12-18T21:30:00', exit_price: 632, exit_fees: 5,
        stop_loss: 600, target: 640,
        setup_type: 'momentum', thesis: 'Meta AI investments paying off, strong fundamentals.',
        timeframe: 'swing_2_14d',
        confluence_factors: ['volume_confirmation', 'sector_strength'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Good process. Followed the plan.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'RELIANCE', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2024-12-17T09:30:00', entry_price: 2950, quantity: 15, entry_fees: 110,
        exit_date: '2024-12-17T11:00:00', exit_price: 3020, exit_fees: 110,
        stop_loss: 2920, target: 3050,
        setup_type: 'breakout', thesis: 'Breaking previous high on high volume.',
        timeframe: 'intraday', confluence_factors: ['volume_confirmation', 'support_resistance'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'greedy', emotion_post_trade: 'confident',
        conviction_level: 5, followed_plan: false, plan_deviation_notes: 'Exited early to lock profits, target not hit.',
        lesson_learned: 'Let winners run. Greedy exit cut profits.', mistake_tags: ['exited_too_early'],
        rating: 3, sl_honored: true, actual_sl_hit: false,
    },
    // ─── January 2025 ────────────────────────────────────────────────────────
    {
        symbol: 'TCS', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-01-03T09:40:00', entry_price: 4380, quantity: 10, entry_fees: 140,
        exit_date: '2025-01-07T14:30:00', exit_price: 4520, exit_fees: 140,
        stop_loss: 4320, target: 4550,
        setup_type: 'breakout', thesis: 'IT sector breakout post FY guidance upgrade.',
        timeframe: 'swing_2_14d', confluence_factors: ['volume_confirmation', 'sector_strength', 'news_catalyst'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 5, followed_plan: true, lesson_learned: 'Patience. Waited 4 days for the target.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'BANKNIFTY25JANPE46000', market: 'indian_fo', instrument_type: 'put_option', direction: 'long',
        entry_date: '2025-01-06T09:30:00', entry_price: 95, quantity: 50, entry_fees: 180,
        exit_date: '2025-01-06T12:00:00', exit_price: 180, exit_fees: 180,
        stop_loss: 65, target: 200, expiry_date: '2025-01-30', strike_price: 46000,
        setup_type: 'reversal', thesis: 'BankNifty at weekly resistance, FII selling pattern.',
        timeframe: 'intraday', confluence_factors: ['support_resistance', 'fii_dii_flow', 'oi_buildup'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'confident', emotion_post_trade: 'confident',
        conviction_level: 5, followed_plan: true, lesson_learned: 'Great conviction + follow-through.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'HDFC', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-01-07T09:45:00', entry_price: 1680, quantity: 30, entry_fees: 160,
        exit_date: '2025-01-07T15:20:00', exit_price: 1660, exit_fees: 160,
        stop_loss: 1655, target: 1720,
        setup_type: 'pullback', thesis: 'Pullback to support in uptrend.',
        timeframe: 'intraday', confluence_factors: ['support_resistance', 'moving_average'],
        emotion_pre_trade: 'fomo', emotion_during_trade: 'anxious', emotion_post_trade: 'fearful',
        conviction_level: 2, followed_plan: false, plan_deviation_notes: 'Entered FOMO after seeing price surge. No plan.',
        lesson_learned: 'FOMO = disaster. Wait for proper entry.', mistake_tags: ['entered_too_late', 'chased_entry', 'no_thesis'],
        rating: 1, sl_honored: true, actual_sl_hit: true,
    },
    {
        symbol: 'AAPL', market: 'us_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-01-08T21:30:00', entry_price: 245, quantity: 15, entry_fees: 5,
        exit_date: '2025-01-13T21:30:00', exit_price: 258, exit_fees: 5,
        stop_loss: 236, target: 265,
        setup_type: 'momentum', thesis: 'Apple post-CES announcement, services revenue growing.',
        timeframe: 'swing_2_14d', confluence_factors: ['volume_confirmation', 'news_catalyst', 'moving_average'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Good trade, took partial profits at 258.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'RELIANCE', market: 'indian_equity', instrument_type: 'stock', direction: 'short',
        entry_date: '2025-01-09T10:30:00', entry_price: 2910, quantity: 20, entry_fees: 130,
        exit_date: '2025-01-09T15:20:00', exit_price: 2890, exit_fees: 130,
        stop_loss: 2935, target: 2860,
        setup_type: 'breakdown', thesis: 'Breaking below 50 DMA with high volume.',
        timeframe: 'intraday', confluence_factors: ['volume_confirmation', 'moving_average'],
        emotion_pre_trade: 'calm', emotion_during_trade: 'calm', emotion_post_trade: 'calm',
        conviction_level: 3, followed_plan: true, lesson_learned: 'Clean intraday short.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    // Revenge trade sequence
    {
        symbol: 'TATAMOTORS', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-01-10T09:30:00', entry_price: 990, quantity: 30, entry_fees: 150,
        exit_date: '2025-01-10T10:05:00', exit_price: 978, exit_fees: 150,
        stop_loss: 975, target: 1030,
        setup_type: 'breakout', thesis: 'Expecting gap-up continuation.',
        timeframe: 'intraday', confluence_factors: ['volume_confirmation'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'anxious', emotion_post_trade: 'fearful',
        conviction_level: 3, followed_plan: true, lesson_learned: 'Gap fill reversed immediately.',
        mistake_tags: ['poor_timing'], rating: 3, sl_honored: true, actual_sl_hit: true,
    },
    {
        symbol: 'TATAMOTORS', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-01-10T10:10:00', entry_price: 975, quantity: 50, entry_fees: 180, // larger size = revenge
        exit_date: '2025-01-10T11:30:00', exit_price: 960, exit_fees: 180,
        stop_loss: 965, target: 1010,
        setup_type: 'reversal', thesis: 'Will recover. Added more to average down.',
        timeframe: 'intraday', confluence_factors: ['support_resistance'],
        emotion_pre_trade: 'revenge', emotion_during_trade: 'fearful', emotion_post_trade: 'neutral',
        conviction_level: 2, followed_plan: false, plan_deviation_notes: 'Revenge trade after loss. Doubled size.',
        lesson_learned: 'Never average down intraday. Revenge trades destroy capital.', mistake_tags: ['revenge_trade', 'oversized', 'ignored_plan'],
        rating: 1, sl_honored: false, actual_sl_hit: true,
    },
    {
        symbol: 'NIFTY25JANPE22500', market: 'indian_fo', instrument_type: 'put_option', direction: 'long',
        entry_date: '2025-01-13T09:45:00', entry_price: 75, quantity: 75, entry_fees: 220,
        exit_date: '2025-01-15T11:00:00', exit_price: 140, exit_fees: 220,
        stop_loss: 50, target: 150, expiry_date: '2025-01-30', strike_price: 22500,
        setup_type: 'reversal', thesis: 'Nifty at weekly resistance. Derivatives data pointing to selling.',
        timeframe: 'swing_2_14d', confluence_factors: ['oi_buildup', 'support_resistance', 'fii_dii_flow'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Derivatives-based thesis worked.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'INFY', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-01-14T09:35:00', entry_price: 1945, quantity: 15, entry_fees: 110,
        // Open trade
        stop_loss: 1900, target: 2050,
        setup_type: 'trend_following', thesis: 'Long-term uptrend intact. Adding on pullback.',
        timeframe: 'positional_14d+', confluence_factors: ['trendline', 'sector_strength'],
        emotion_pre_trade: 'calm', conviction_level: 4,
    },
    {
        symbol: 'GOOGL', market: 'us_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-01-15T21:30:00', entry_price: 198, quantity: 10, entry_fees: 5,
        exit_date: '2025-01-22T21:30:00', exit_price: 210, exit_fees: 5,
        stop_loss: 188, target: 220,
        setup_type: 'momentum', thesis: 'Alphabet AI integration, strong ad revenue expected.',
        timeframe: 'swing_2_14d', confluence_factors: ['volume_confirmation', 'sector_strength'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'US tech momentum trade worked.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    // ─── February 2025 ───────────────────────────────────────────────────────
    {
        symbol: 'BANKNIFTY25FEBCE51000', market: 'indian_fo', instrument_type: 'call_option', direction: 'long',
        entry_date: '2025-02-03T09:45:00', entry_price: 110, quantity: 50, entry_fees: 200,
        exit_date: '2025-02-03T14:30:00', exit_price: 195, exit_fees: 200,
        stop_loss: 75, target: 200, expiry_date: '2025-02-27', strike_price: 51000,
        setup_type: 'breakout', thesis: 'BankNifty breaking all-time high on budget day.',
        timeframe: 'intraday', confluence_factors: ['volume_confirmation', 'oi_buildup', 'news_catalyst'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'greedy', emotion_post_trade: 'confident',
        conviction_level: 5, followed_plan: true, lesson_learned: 'Budget day = high volatility. Perfect setup.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'RELIANCE', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-02-04T11:00:00', entry_price: 3050, quantity: 15, entry_fees: 120,
        exit_date: '2025-02-05T15:00:00', exit_price: 3020, exit_fees: 120,
        stop_loss: 3010, target: 3120,
        setup_type: 'pullback', thesis: 'Pullback after budget rally.',
        timeframe: 'intraday', confluence_factors: ['support_resistance', 'vwap'],
        emotion_pre_trade: 'neutral', emotion_during_trade: 'anxious', emotion_post_trade: 'neutral',
        conviction_level: 3, followed_plan: true, lesson_learned: 'Entry was fine but trend was reversal, not pullback.',
        mistake_tags: ['poor_timing', 'wrong_direction'], rating: 2, sl_honored: true, actual_sl_hit: true,
    },
    {
        symbol: 'NVDA', market: 'us_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-02-05T21:30:00', entry_price: 128, quantity: 15, entry_fees: 5,
        exit_date: '2025-02-10T21:30:00', exit_price: 142, exit_fees: 5,
        stop_loss: 120, target: 150,
        setup_type: 'momentum', thesis: 'Nvidia bounce after correction, AI demand intact.',
        timeframe: 'swing_2_14d', confluence_factors: ['volume_confirmation', 'fib_levels', 'sector_strength'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 5, followed_plan: true, lesson_learned: 'Bought the dip with conviction. Worked great.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'TCS', market: 'indian_equity', instrument_type: 'stock', direction: 'short',
        entry_date: '2025-02-06T10:00:00', entry_price: 4450, quantity: 10, entry_fees: 140,
        exit_date: '2025-02-06T15:20:00', exit_price: 4510, exit_fees: 140,
        stop_loss: 4490, target: 4350,
        setup_type: 'breakdown', thesis: 'Earnings disappointment expected.',
        timeframe: 'intraday', confluence_factors: ['news_catalyst', 'volume_confirmation'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'fearful', emotion_post_trade: 'neutral',
        conviction_level: 3, followed_plan: false, plan_deviation_notes: 'Did not exit at SL. Held hoping it would turn.',
        lesson_learned: 'News can be already priced in. RSI showed buying. Should have seen it.', mistake_tags: ['moved_stop_loss', 'held_too_long'],
        rating: 1, sl_honored: false, actual_sl_hit: true,
    },
    {
        symbol: 'INFY', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-02-10T09:35:00', entry_price: 1975, quantity: 15, entry_fees: 110,
        exit_date: '2025-02-12T14:00:00', exit_price: 2020, exit_fees: 110,
        stop_loss: 1940, target: 2060,
        setup_type: 'range_trade', thesis: 'Range between 1940-2060. Buying the low.',
        timeframe: 'swing_2_14d', confluence_factors: ['support_resistance', 'rsi_divergence'],
        emotion_pre_trade: 'calm', emotion_during_trade: 'calm', emotion_post_trade: 'calm',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Range trade executed well.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'TATAMOTORS', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-02-11T09:30:00', entry_price: 1010, quantity: 25, entry_fees: 140,
        exit_date: '2025-02-12T15:20:00', exit_price: 1038, exit_fees: 140,
        stop_loss: 993, target: 1055,
        setup_type: 'breakout', thesis: 'Breaking key resistance after consolidation.',
        timeframe: 'swing_2_14d', confluence_factors: ['volume_confirmation', 'support_resistance', 'trendline'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'confident', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Classic breakout. Patience after entry worked.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'NIFTY25FEBCE23500', market: 'indian_fo', instrument_type: 'call_option', direction: 'long',
        entry_date: '2025-02-13T10:00:00', entry_price: 95, quantity: 75, entry_fees: 220,
        exit_date: '2025-02-13T12:00:00', exit_price: 40, exit_fees: 220,
        stop_loss: 60, target: 180, expiry_date: '2025-02-27', strike_price: 23500,
        setup_type: 'momentum', thesis: 'Nifty trending up, riding momentum with OTM call.',
        timeframe: 'intraday', confluence_factors: ['momentum'],
        emotion_pre_trade: 'fomo', emotion_during_trade: 'fearful', emotion_post_trade: 'neutral',
        conviction_level: 2, followed_plan: false, plan_deviation_notes: 'FOMO entry. Market reversed immediately.',
        lesson_learned: 'FOMO options are insurance for the MM. Never again.', mistake_tags: ['fomo', 'entered_too_late', 'chased_entry', 'no_thesis'],
        rating: 1, sl_honored: true, actual_sl_hit: true,
    },
    {
        symbol: 'META', market: 'us_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-02-14T21:30:00', entry_price: 655, quantity: 5, entry_fees: 5,
        exit_date: '2025-02-20T21:30:00', exit_price: 680, exit_fees: 5,
        stop_loss: 630, target: 700,
        setup_type: 'trend_following', thesis: 'Meta in strong uptrend. Buying dip to 50 EMA.',
        timeframe: 'swing_2_14d', confluence_factors: ['moving_average', 'trendline'],
        emotion_pre_trade: 'calm', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Trend following is the bread and butter.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'HDFC', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-02-17T09:35:00', entry_price: 1695, quantity: 30, entry_fees: 160,
        exit_date: '2025-02-19T14:30:00', exit_price: 1735, exit_fees: 160,
        stop_loss: 1670, target: 1750,
        setup_type: 'pullback', thesis: 'Sector rotation into BFSI. HDFC near support.',
        timeframe: 'swing_2_14d', confluence_factors: ['sector_strength', 'support_resistance'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'BFSI rotation trade.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'BANKNIFTY25FEBPE49000', market: 'indian_fo', instrument_type: 'put_option', direction: 'long',
        entry_date: '2025-02-18T09:30:00', entry_price: 88, quantity: 50, entry_fees: 180,
        exit_date: '2025-02-18T14:00:00', exit_price: 65, exit_fees: 180,
        stop_loss: 60, target: 160, expiry_date: '2025-02-27', strike_price: 49000,
        setup_type: 'reversal', thesis: 'BankNifty at resistance, theta decay acceptable.',
        timeframe: 'intraday', confluence_factors: ['support_resistance', 'oi_buildup'],
        emotion_pre_trade: 'neutral', emotion_during_trade: 'anxious', emotion_post_trade: 'neutral',
        conviction_level: 2, followed_plan: true, lesson_learned: 'BankNifty just continued up. Respect the trend.',
        mistake_tags: ['wrong_direction'], rating: 2, sl_honored: true, actual_sl_hit: true,
    },
    {
        symbol: 'AAPL', market: 'us_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-02-19T21:30:00', entry_price: 228, quantity: 10, entry_fees: 5,
        exit_date: '2025-02-25T21:30:00', exit_price: 238, exit_fees: 5,
        stop_loss: 218, target: 245,
        setup_type: 'momentum', thesis: 'Apple Vision Pro sales data + AI features incoming.',
        timeframe: 'swing_2_14d', confluence_factors: ['news_catalyst', 'moving_average'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 3, followed_plan: true, lesson_learned: 'Partial profit take at 238 was correct.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'RELIANCE', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-02-20T09:35:00', entry_price: 3100, quantity: 15, entry_fees: 115,
        // Open trade
        stop_loss: 3050, target: 3200,
        setup_type: 'breakout', thesis: 'Multi-month breakout above 3090 resistance.',
        timeframe: 'positional_14d+', confluence_factors: ['volume_confirmation', 'trendline', 'support_resistance'],
        emotion_pre_trade: 'confident', conviction_level: 5,
    },
    {
        symbol: 'INFY', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-02-24T09:30:00', entry_price: 2010, quantity: 15, entry_fees: 110,
        exit_date: '2025-02-26T15:00:00', exit_price: 2045, exit_fees: 110,
        stop_loss: 1985, target: 2080,
        setup_type: 'trend_following', thesis: 'IT strength continues. Breakout of previous high.',
        timeframe: 'swing_2_14d', confluence_factors: ['sector_strength', 'volume_confirmation'],
        emotion_pre_trade: 'calm', emotion_during_trade: 'calm', emotion_post_trade: 'calm',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Consistent setup, consistent execution.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'TATAMOTORS', market: 'indian_equity', instrument_type: 'stock', direction: 'short',
        entry_date: '2025-02-25T10:15:00', entry_price: 1050, quantity: 20, entry_fees: 140,
        exit_date: '2025-02-26T11:30:00', exit_price: 1025, exit_fees: 140,
        stop_loss: 1065, target: 1010,
        setup_type: 'breakdown', thesis: 'Breaking below 20 EMA on negative news.',
        timeframe: 'swing_2_14d', confluence_factors: ['moving_average', 'news_catalyst', 'volume_confirmation'],
        emotion_pre_trade: 'calm', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 3, followed_plan: true, lesson_learned: 'News-driven breakdown worked. Good risk management.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    // ─── March 2025 ──────────────────────────────────────────────────────────
    {
        symbol: 'NIFTY25MARPE22000', market: 'indian_fo', instrument_type: 'put_option', direction: 'long',
        entry_date: '2025-03-03T09:45:00', entry_price: 70, quantity: 75, entry_fees: 220,
        exit_date: '2025-03-03T14:00:00', exit_price: 130, exit_fees: 220,
        stop_loss: 45, target: 140, expiry_date: '2025-03-27', strike_price: 22000,
        setup_type: 'reversal', thesis: 'Nifty overbought, weekly resistance + FII selling.',
        timeframe: 'intraday', confluence_factors: ['rsi_divergence', 'fii_dii_flow', 'oi_buildup', 'support_resistance'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 5, followed_plan: true, lesson_learned: 'Best trade of the week. All factors aligned.',
        mistake_tags: [], rating: 5, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'NVDA', market: 'us_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-03-05T21:30:00', entry_price: 115, quantity: 20, entry_fees: 5,
        exit_date: '2025-03-10T21:30:00', exit_price: 125, exit_fees: 5,
        stop_loss: 108, target: 135,
        setup_type: 'momentum', thesis: 'NVIDIA post-correction bounce. AI demand story intact.',
        timeframe: 'swing_2_14d', confluence_factors: ['fib_levels', 'volume_confirmation', 'sector_strength'],
        emotion_pre_trade: 'confident', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Fib levels + volume = reliable.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'BANKNIFTY25MARCE52000', market: 'indian_fo', instrument_type: 'call_option', direction: 'long',
        entry_date: '2025-03-06T09:30:00', entry_price: 105, quantity: 50, entry_fees: 190,
        exit_date: '2025-03-06T11:00:00', exit_price: 65, exit_fees: 190,
        stop_loss: 70, target: 200, expiry_date: '2025-03-27', strike_price: 52000,
        setup_type: 'breakout', thesis: 'Expecting BankNifty to break out post RBI policy.',
        timeframe: 'intraday', confluence_factors: ['news_catalyst', 'volume_confirmation'],
        emotion_pre_trade: 'anxious', emotion_during_trade: 'fearful', emotion_post_trade: 'neutral',
        conviction_level: 2, followed_plan: true, lesson_learned: 'RBI kept rates same. News was expected by market.',
        mistake_tags: ['no_thesis', 'poor_timing'], rating: 2, sl_honored: true, actual_sl_hit: true,
    },
    {
        symbol: 'TCS', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-03-07T09:40:00', entry_price: 4480, quantity: 10, entry_fees: 140,
        exit_date: '2025-03-10T14:00:00', exit_price: 4560, exit_fees: 140,
        stop_loss: 4420, target: 4600,
        setup_type: 'breakout', thesis: 'TCS breaking resistance with good delivery volumes.',
        timeframe: 'swing_2_14d', confluence_factors: ['volume_confirmation', 'support_resistance'],
        emotion_pre_trade: 'calm', emotion_during_trade: 'calm', emotion_post_trade: 'confident',
        conviction_level: 4, followed_plan: true, lesson_learned: 'Simple breakout in an uptrend.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'GOOGL', market: 'us_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-03-10T21:30:00', entry_price: 185, quantity: 10, entry_fees: 5,
        // Open trade
        stop_loss: 175, target: 205,
        setup_type: 'pullback', thesis: 'Google Gemini AI update + pullback to key MA.',
        timeframe: 'swing_2_14d', confluence_factors: ['moving_average', 'sector_strength', 'news_catalyst'],
        emotion_pre_trade: 'calm', conviction_level: 4,
    },
    {
        symbol: 'HDFC', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-03-11T09:30:00', entry_price: 1705, quantity: 25, entry_fees: 150,
        exit_date: '2025-03-12T15:20:00', exit_price: 1728, exit_fees: 150,
        stop_loss: 1682, target: 1750,
        setup_type: 'pullback', thesis: 'HDFC holding above 200 DMA, BFSI sector strength.',
        timeframe: 'swing_2_14d', confluence_factors: ['sector_strength', 'moving_average'],
        emotion_pre_trade: 'calm', emotion_during_trade: 'calm', emotion_post_trade: 'calm',
        conviction_level: 3, followed_plan: true, lesson_learned: 'Took half profit at +1.3%. Good risk management.',
        mistake_tags: [], rating: 4, sl_honored: true, actual_sl_hit: false,
    },
    {
        symbol: 'INFY', market: 'indian_equity', instrument_type: 'stock', direction: 'long',
        entry_date: '2025-03-13T09:35:00', entry_price: 2030, quantity: 15, entry_fees: 110,
        // Open trade
        stop_loss: 2000, target: 2100,
        setup_type: 'trend_following', thesis: 'IT sector momentum. Quarterly guidance positive.',
        timeframe: 'positional_14d+', confluence_factors: ['sector_strength', 'trendline'],
        emotion_pre_trade: 'confident', conviction_level: 5,
    },
];

export function seedDatabase() {
    // Check if already seeded
    const existingTrades = db.select().from(trades).limit(1).all();
    if (existingTrades.length > 0) return;

    console.log('Seeding database...');

    // Insert trades
    for (const t of SEED_TRADES) {
        const tradeRecord = buildTrade(t);
        db.insert(trades).values(tradeRecord).run();
    }

    // Seed default settings
    const defaultSettings = [
        { key: 'starting_capital', value: '1000000' },
        { key: 'default_market', value: 'indian_equity' },
        { key: 'currency', value: 'INR' },
        { key: 'risk_per_trade', value: '2' },
        { key: 'theme', value: 'dark' },
    ];
    for (const s of defaultSettings) {
        db.insert(settings).values(s).run();
    }

    // Seed default rules
    const defaultRules = [
        { id: makeId(), rule_text: 'Never risk more than 2% of capital on a single trade', category: 'risk' },
        { id: makeId(), rule_text: 'Always set a stop loss before entering a trade', category: 'risk' },
        { id: makeId(), rule_text: 'Do not trade FOMO. Wait for your setup.', category: 'psychology' },
        { id: makeId(), rule_text: 'Honor your stop loss — never move it against your position', category: 'exit' },
        { id: makeId(), rule_text: 'Only enter a trade from your predefined setup list', category: 'entry' },
        { id: makeId(), rule_text: 'No more than 3 trades per day', category: 'risk' },
        { id: makeId(), rule_text: 'Stop trading after 2 consecutive losses in a day', category: 'psychology' },
        { id: makeId(), rule_text: 'Position size must not exceed 15% of capital', category: 'sizing' },
    ];
    for (const r of defaultRules) {
        db.insert(rules).values({ ...r, is_active: true }).run();
    }

    // Seed daily journal entries (Dec 2024 - Feb 2025, ~30 entries)
    const journalEntries = generateJournalEntries();
    for (const j of journalEntries) {
        db.insert(dailyJournal).values(j).run();
    }

    console.log('Database seeded successfully!');
}

function generateJournalEntries() {
    const entries = [];
    const dates = [
        '2024-12-02', '2024-12-03', '2024-12-04', '2024-12-05', '2024-12-06',
        '2024-12-09', '2024-12-10', '2024-12-11', '2024-12-12', '2024-12-13',
        '2024-12-16', '2024-12-17',
        '2025-01-03', '2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09',
        '2025-01-10', '2025-01-13', '2025-01-14', '2025-01-15',
        '2025-02-03', '2025-02-04', '2025-02-05', '2025-02-06', '2025-02-10',
        '2025-02-11', '2025-02-12', '2025-02-13', '2025-02-14',
        '2025-02-17', '2025-02-18', '2025-02-19', '2025-02-20',
        '2025-03-03', '2025-03-05', '2025-03-06', '2025-03-07', '2025-03-10', '2025-03-11',
    ];

    const plans = [
        'Watch RELIANCE breakout above 2900. Nifty support at 22400.',
        'TCS earnings reaction. Watch for pullback.',
        'Budget day — expect high volatility. Fade the initial spike.',
        'BankNifty at key resistance. Watch OI data.',
        'IT sector strong. Adding to Infy if pullback holds 1890.',
        'US markets weak overnight. Cautious today.',
        'Nifty expiry week. Theta decay in options. Trade carefully.',
        'Strong FII inflow yesterday. Bullish bias.',
        'RBI policy today. No directional bets before 10am.',
        'Midcap correction ongoing. Only large caps today.',
    ];
    const biases: string[] = ['bullish', 'bullish', 'bullish', 'neutral', 'bearish', 'neutral'];
    const reflections = [
        'Executed well today. Stayed within plan.',
        'Lost focus in the afternoon. Should have stopped at 2 trades.',
        'Great day — multiple setups aligned.',
        'Overtraded. Need to be more selective.',
        'Revenge traded after morning loss. Will not repeat.',
        'Clean trading day. No deviations.',
        'Market was choppy. Stayed flat was best.',
        'Caught the big Nifty move perfectly.',
        'FOMO cost me a bad trade. Expensive lesson.',
        'Best day in weeks. Conviction + patience.',
        'Learned: check OI before F&O trades.',
        'Screen time too high. Need more breaks.',
    ];
    const mistakes = [
        'Held a losing trade too long.',
        'Revenge traded after first loss.',
        'FOMO entry into a high-risk setup.',
        'Did not set SL before entry.',
        'Oversized on a low conviction trade.',
        null, null, null,
    ];

    for (let i = 0; i < dates.length; i++) {
        const mood = Math.floor(Math.random() * 3) + 2; // 2-4
        const sleep = 5.5 + Math.random() * 2.5;
        entries.push({
            id: makeId(),
            date: dates[i],
            pre_market_plan: plans[i % plans.length],
            market_bias: biases[i % biases.length],
            mood_score: mood,
            sleep_hours: Math.round(sleep * 10) / 10,
            exercise_today: Math.random() > 0.4,
            screen_time_hours: 4 + Math.random() * 4,
            total_trades: Math.floor(Math.random() * 3) + 1,
            daily_pnl: (Math.random() - 0.4) * 20000,
            post_market_notes: reflections[i % reflections.length],
            biggest_mistake: mistakes[i % mistakes.length],
            biggest_win_reason: i % 3 === 0 ? 'Stuck to setup and waited patiently.' : null,
            rule_violations: Math.random() > 0.7 ? JSON.stringify(['moved_stop_loss']) : null,
        });
    }
    return entries;
}
