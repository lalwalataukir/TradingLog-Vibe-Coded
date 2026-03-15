import db from '@/db';
import type { Trade } from '@/db/schema';
import { trades } from '@/db/schema';
import { and, desc, eq, gte, like, lte } from 'drizzle-orm';
import { useEffect, useState } from 'react';

type TradeFilters = {
    status?: 'open' | 'closed';
    market?: string;
    direction?: string;
    setup_type?: string;
    symbol?: string;
    pnl_filter?: 'winners' | 'losers' | 'all';
    date_from?: string;
    date_to?: string;
};

export function useTrades(filters: TradeFilters = {}): {
    trades: Trade[];
    isLoading: boolean;
    refetch: () => void;
} {
    const [data, setData] = useState<Trade[]>([]);
    const [tick, setTick] = useState(0);
    const filterKey = JSON.stringify(filters);

    useEffect(() => {
        try {
            const conditions: any[] = [];

            if (filters.status) conditions.push(eq(trades.status, filters.status));
            if (filters.market) conditions.push(eq(trades.market, filters.market));
            if (filters.direction) conditions.push(eq(trades.direction, filters.direction));
            if (filters.setup_type) conditions.push(eq(trades.setup_type, filters.setup_type));
            if (filters.symbol) conditions.push(like(trades.symbol, `%${filters.symbol}%`));
            if (filters.date_from) conditions.push(gte(trades.entry_date, filters.date_from));
            if (filters.date_to) conditions.push(lte(trades.entry_date, filters.date_to));

            let result: Trade[];
            if (conditions.length > 0) {
                result = db.select().from(trades).where(and(...conditions)).orderBy(desc(trades.entry_date)).all();
            } else {
                result = db.select().from(trades).orderBy(desc(trades.entry_date)).all();
            }

            if (filters.pnl_filter === 'winners') result = result.filter((t) => (t.pnl_net ?? 0) > 0);
            if (filters.pnl_filter === 'losers') result = result.filter((t) => (t.pnl_net ?? 0) < 0);

            setData(result);
        } catch (e) {
            console.error('useTrades error:', e);
            setData([]);
        }
    }, [tick, filterKey]);

    return { trades: data, isLoading: false, refetch: () => setTick((t) => t + 1) };
}
