import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/layout/screen';
import { AppCard } from '@/components/ui/card';
import { ChartShell } from '@/components/ui/chart-shell';
import { ListRow } from '@/components/ui/list-row';
import { StatCard } from '@/components/ui/stat-card';
import { formatCompactCurrency, formatCurrency, formatPercentage } from '@/lib/format';
import { colors, radii, spacing } from '@/lib/theme';
import { useAppData } from '@/providers/app-data-provider';

export default function DashboardRoute() {
  const router = useRouter();
  const { analytics, isReady } = useAppData();

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
          <View>
            <Text style={styles.eyebrow}>Good evening,</Text>
            <Text style={styles.title}>TradeLog</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push('/rules')} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Rules</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/settings')} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Settings</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <AppCard style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total P&L · This Month</Text>
        <Text style={[styles.heroValue, analytics.totalPnl >= 0 ? styles.profit : styles.loss]}>{formatCurrency(analytics.totalPnl)}</Text>
        <Text style={[styles.heroSubtext, analytics.totalPnlPercent >= 0 ? styles.profit : styles.loss]}>
          {formatPercentage(analytics.totalPnlPercent)}
        </Text>
      </AppCard>

      <View style={styles.statGrid}>
        <StatCard label="Win Rate" tone="profit" value={`${analytics.winRate.toFixed(0)}%`} />
        <StatCard label="Avg R:R" tone="accent" value={`${analytics.averageRiskReward.toFixed(1)}x`} />
        <StatCard label="Streak" value={analytics.currentStreakLabel} />
      </View>

      <ChartShell subtitle="Recent journal days" title="Daily P&L" values={analytics.dailyPnlSeries} />
      <ChartShell
        subtitle="Top setup contribution by total P&L"
        title="Setup Performance"
        values={analytics.setupPerformance.slice(0, 5).map((item) => item.totalPnl)}
      />

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent Trades</Text>
        <Link href="/trades" style={styles.linkText}>
          View all
        </Link>
      </View>

      <View style={styles.stack}>
        {analytics.recentTrades.map((trade) => (
          <ListRow
            key={trade.id}
            onPress={() => router.push(`/trades/${trade.id}`)}
            subtitle={`${trade.setupType.replace('_', ' ')} · ${trade.status}`}
            title={trade.symbol}
            value={trade.pnlNet === null ? 'Open' : formatCompactCurrency(trade.pnlNet)}
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: colors.foreground,
    fontSize: 12,
    fontWeight: '700',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroCard: {
    backgroundColor: colors.cardAlt,
    gap: 6,
  },
  heroLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  heroSubtext: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  linkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  loss: {
    color: colors.loss,
  },
  profit: {
    color: colors.profit,
  },
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '800',
  },
  stack: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: spacing.md,
  },
  title: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: '800',
  },
});
