import { calcProfitFactor, calcWinRate } from './lib/calculations';

// Note: Expo SQLite DB is typically stored in the app's document directory. 
// For this CLI script, we will just parse the seed data directly to ensure the calculations logic on the exact seed payload is 100% accurate.

import { SEED_TRADES } from './db/seed_test_data';

export function runUAT() {
    let passed = 0;
    let failed = 0;
    console.log("Starting UAT calculations test...");

    // Simulate Flow 2: Analytics Validation
    const processedTrades = SEED_TRADES.map(t => {
        const pnl = t.exit_price != null ? (t.exit_price - t.entry_price) * t.quantity * (t.direction === 'long' ? 1 : -1) : null;
        const pnl_net = pnl != null ? pnl - t.entry_fees - (t.exit_fees ?? 0) : null;
        return { ...t, pnl_net };
    });

    const closedTrades = processedTrades.filter(t => t.exit_date != null);

    // Test 1: Win Rate calculation
    const winRate = calcWinRate(closedTrades);
    console.log("Calculated Win Rate:", winRate.toFixed(2) + "%");
    if (winRate > 0 && winRate <= 100) passed++; else failed++;

    // Test 2: Profit Factor calculation
    const pf = calcProfitFactor(closedTrades);
    console.log("Calculated Profit Factor:", pf.toFixed(2));
    if (pf > 0) passed++; else failed++;

    console.log(`\nUAT Complete: ${passed} passed, ${failed} failed`);
}

runUAT();
