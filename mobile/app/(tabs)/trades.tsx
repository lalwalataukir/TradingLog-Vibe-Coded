import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/layout/screen';
import { Chip } from '@/components/ui/chip';
import { ListRow } from '@/components/ui/list-row';
import { StatCard } from '@/components/ui/stat-card';
import { formatCompactCurrency } from '@/lib/format';
import { colors, spacing } from '@/lib/theme';
import { useAppData } from '@/providers/app-data-provider';

type FilterKey = 'all' | 'closed' | 'open';

export default function TradeLogRoute() {
  const router = useRouter();
  const { analytics, isReady, trades } = useAppData();
  const [filter, setFilter] = useState<FilterKey>('all');

  const filteredTrades = useMemo(() => {
    if (filter === 'all') return trades;
    return trades.filter((trade) => trade.status === filter);
  }, [filter, trades]);

  if (!isReady) {
    return (
      <AppScreen>
        <ActivityIndicator color={colors.primary} />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      header={
        <View style={styles.headerRow}>
          <Text style={styles.title}>Trade Log</Text>
          <Text style={styles.headerText}>{filteredTrades.length} shown</Text>
        </View>
      }
    >
      <View style={styles.filterRow}>
        <Chip label="All" onPress={() => setFilter('all')} selected={filter === 'all'} />
        <Chip label="Open" onPress={() => setFilter('open')} selected={filter === 'open'} />
        <Chip label="Closed" onPress={() => setFilter('closed')} selected={filter === 'closed'} />
      </View>

      <View style={styles.summaryRow}>
        <StatCard label="Trades" value={`${analytics.tradesThisMonth}`} />
        <StatCard label="Total P&L" tone="profit" value={formatCompactCurrency(analytics.totalPnl)} />
        <StatCard label="Win Rate" tone="accent" value={`${analytics.winRate.toFixed(0)}%`} />
      </View>

      <View style={styles.stack}>
        {filteredTrades.map((trade) => (
          <ListRow
            key={trade.id}
            onPress={() => router.push(`/trades/${trade.id}`)}
            subtitle={`${trade.market} · ${trade.setupType}`}
            title={trade.symbol}
            value={trade.pnlNet === null ? 'Open' : formatCompactCurrency(trade.pnlNet)}
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  stack: {
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: '800',
  },
});
