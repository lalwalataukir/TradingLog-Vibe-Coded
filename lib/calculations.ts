// P&L Calculations
export function calcPnl(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    direction: 'long' | 'short'
): number {
    const multiplier = direction === 'long' ? 1 : -1;
    return (exitPrice - entryPrice) * quantity * multiplier;
}

export function calcPnlNet(
    pnl: number,
    entryFees: number,
    exitFees: number
): number {
    return pnl - entryFees - (exitFees ?? 0);
}

export function calcPnlPercentage(
    pnlNet: number,
    entryPrice: number,
    quantity: number
): number {
    const investment = entryPrice * quantity;
    if (investment === 0) return 0;
    return (pnlNet / investment) * 100;
}

// Risk-Reward
export function calcRiskRewardPlanned(
    entryPrice: number,
    target: number | null | undefined,
    stopLoss: number | null | undefined
): number | null {
    if (!target || !stopLoss) return null;
    const reward = Math.abs(target - entryPrice);
    const risk = Math.abs(entryPrice - stopLoss);
    if (risk === 0) return null;
    return reward / risk;
}

export function calcRiskRewardActual(
    entryPrice: number,
    exitPrice: number,
    stopLoss: number | null | undefined
): number | null {
    if (!stopLoss) return null;
    const reward = Math.abs(exitPrice - entryPrice);
    const risk = Math.abs(entryPrice - stopLoss);
    if (risk === 0) return null;
    return reward / risk;
}

export function calcPositionSizePct(
    entryPrice: number,
    quantity: number,
    totalCapital: number
): number {
    if (totalCapital === 0) return 0;
    return ((entryPrice * quantity) / totalCapital) * 100;
}

// Analytics
export function calcProfitFactor(trades: { pnl_net: number | null }[]): number {
    const grossWins = trades
        .filter((t) => (t.pnl_net ?? 0) > 0)
        .reduce((sum, t) => sum + (t.pnl_net ?? 0), 0);
    const grossLosses = Math.abs(
        trades
            .filter((t) => (t.pnl_net ?? 0) < 0)
            .reduce((sum, t) => sum + (t.pnl_net ?? 0), 0)
    );
    if (grossLosses === 0) return grossWins > 0 ? 999 : 0;
    return grossWins / grossLosses;
}

export function calcWinRate(trades: { pnl_net: number | null }[]): number {
    if (trades.length === 0) return 0;
    const wins = trades.filter((t) => (t.pnl_net ?? 0) > 0).length;
    return (wins / trades.length) * 100;
}

export function calcExpectancy(trades: { pnl_net: number | null }[]): number {
    if (trades.length === 0) return 0;
    const wins = trades.filter((t) => (t.pnl_net ?? 0) > 0);
    const losses = trades.filter((t) => (t.pnl_net ?? 0) < 0);
    const winRate = wins.length / trades.length;
    const lossRate = losses.length / trades.length;
    const avgWin =
        wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl_net ?? 0), 0) / wins.length : 0;
    const avgLoss =
        losses.length > 0
            ? Math.abs(losses.reduce((s, t) => s + (t.pnl_net ?? 0), 0) / losses.length)
            : 0;
    return winRate * avgWin - lossRate * avgLoss;
}

export function calcMaxDrawdown(equityCurve: number[]): number {
    let peak = equityCurve[0] ?? 0;
    let maxDD = 0;
    for (const val of equityCurve) {
        if (val > peak) peak = val;
        const dd = peak - val;
        if (dd > maxDD) maxDD = dd;
    }
    return maxDD;
}

export function calcMaxConsecutiveLosses(trades: { pnl_net: number | null }[]): number {
    let max = 0;
    let current = 0;
    for (const t of trades) {
        if ((t.pnl_net ?? 0) < 0) {
            current++;
            if (current > max) max = current;
        } else {
            current = 0;
        }
    }
    return max;
}

export function calcCurrentStreak(trades: { pnl_net: number | null }[]): {
    type: 'win' | 'loss' | 'none';
    count: number;
} {
    if (trades.length === 0) return { type: 'none', count: 0 };
    const sorted = [...trades].reverse();
    const first = sorted[0];
    const isWin = (first.pnl_net ?? 0) > 0;
    let count = 0;
    for (const t of sorted) {
        const tIsWin = (t.pnl_net ?? 0) > 0;
        if (tIsWin === isWin) count++;
        else break;
    }
    return { type: isWin ? 'win' : 'loss', count };
}

// Formatting
export function formatCurrency(
    value: number,
    market: string = 'indian_equity'
): string {
    const isUS = market === 'us_equity' || market === 'crypto';
    const symbol = isUS ? '$' : '₹';
    const absVal = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    if (absVal >= 100000) {
        return `${sign}${symbol}${(absVal / 100000).toFixed(2)}L`;
    }
    if (absVal >= 1000) {
        return `${sign}${symbol}${(absVal / 1000).toFixed(2)}K`;
    }
    return `${sign}${symbol}${absVal.toFixed(2)}`;
}

export function formatPct(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

export function formatRR(value: number | null | undefined): string {
    if (value == null) return '—';
    return `${value.toFixed(2)}R`;
}
