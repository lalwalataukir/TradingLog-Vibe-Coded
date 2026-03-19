import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/layout/screen';
import { AppCard } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { formatCurrency, formatPercentage } from '@/lib/format';
import { colors, spacing } from '@/lib/theme';
import { useAppData } from '@/providers/app-data-provider';

export default function TradeDetailRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTrade, isReady } = useAppData();
  const trade = id ? getTrade(id) : null;

  if (!isReady) {
    return (
      <AppScreen>
        <ActivityIndicator color={colors.primary} />
      </AppScreen>
    );
  }

  if (!trade) {
    return (
      <AppScreen>
        <Text style={styles.title}>Trade not found</Text>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppCard style={styles.heroCard}>
        <Text style={styles.symbol}>{trade.symbol}</Text>
        <Text style={styles.subtext}>
          {trade.market} · {trade.setupType} · {trade.timeframe}
        </Text>
        <Text style={[styles.pnl, (trade.pnlNet ?? 0) >= 0 ? styles.pnlProfit : styles.pnlLoss]}>
          {trade.pnlNet === null ? 'Open trade' : formatCurrency(trade.pnlNet)}
        </Text>
        {trade.pnlPercentage !== null ? <Text style={styles.percent}>{formatPercentage(trade.pnlPercentage)}</Text> : null}
      </AppCard>

      <View style={styles.metricGrid}>
        <Metric label="Entry" value={formatCurrency(trade.entryPrice)} />
        <Metric label="Qty" value={`${trade.quantity}`} />
        <Metric label="Planned R:R" value={trade.riskRewardPlanned ? `${trade.riskRewardPlanned.toFixed(1)}x` : '—'} />
        <Metric label="Position %" value={trade.positionSizePct ? `${trade.positionSizePct.toFixed(2)}%` : '—'} />
      </View>

      <AppCard style={styles.notesCard}>
        <Text style={styles.notesTitle}>Thesis</Text>
        <Text style={styles.notesCopy}>{trade.thesis ?? 'No thesis recorded.'}</Text>
      </AppCard>

      <AppCard style={styles.notesCard}>
        <Text style={styles.notesTitle}>Review</Text>
        <Text style={styles.notesCopy}>{trade.lessonLearned ?? 'This trade has not been reviewed yet.'}</Text>
      </AppCard>

      {trade.status === 'open' ? <PrimaryButton label="Close Trade" onPress={() => router.push(`/trades/${trade.id}/close`)} /> : null}
    </AppScreen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    gap: 6,
  },
  metricCard: {
    flex: 1,
    gap: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: spacing.md,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  metricValue: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '800',
  },
  notesCard: {
    gap: 8,
    marginBottom: spacing.lg,
  },
  notesCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  notesTitle: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: '800',
  },
  percent: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  pnl: {
    fontSize: 28,
    fontWeight: '800',
  },
  pnlLoss: {
    color: colors.loss,
  },
  pnlProfit: {
    color: colors.profit,
  },
  subtext: {
    color: colors.muted,
    fontSize: 13,
  },
  symbol: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: '800',
  },
  title: {
    color: colors.foreground,
    fontSize: 24,
    fontWeight: '800',
  },
});
