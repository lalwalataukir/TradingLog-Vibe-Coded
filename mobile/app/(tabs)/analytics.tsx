import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/layout/screen';
import { AppCard } from '@/components/ui/card';
import { ChartShell } from '@/components/ui/chart-shell';
import { Chip } from '@/components/ui/chip';
import { StatCard } from '@/components/ui/stat-card';
import { formatCompactCurrency } from '@/lib/format';
import { colors, spacing } from '@/lib/theme';
import { useAppData } from '@/providers/app-data-provider';

const analyticsTabs = ['Performance', 'Behavior', 'Setups', 'Risk'] as const;

export default function AnalyticsRoute() {
  const [activeTab, setActiveTab] = useState<(typeof analyticsTabs)[number]>('Performance');
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
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.headerLabel}>Local SQLite</Text>
        </View>
      }
    >
      <View style={styles.tabRow}>
        {analyticsTabs.map((tab) => (
          <Chip key={tab} label={tab} onPress={() => setActiveTab(tab)} selected={tab === activeTab} />
        ))}
      </View>

      {activeTab === 'Performance' ? (
        <>
          <View style={styles.metricsRow}>
            <StatCard label="Profit Factor" tone="profit" value={analytics.profitFactor.toFixed(2)} />
            <StatCard label="Avg R:R" tone="accent" value={`${analytics.averageRiskReward.toFixed(1)}x`} />
          </View>
          <ChartShell subtitle="Last 15 journal days" title="Daily P&L" values={analytics.dailyPnlSeries} />
        </>
      ) : null}

      {activeTab === 'Behavior' ? (
        <>
          <ChartShell
            subtitle="Average P&L by pre-trade emotion"
            title="Emotion vs Outcome"
            values={analytics.emotionPerformance.map((item) => item.averagePnl)}
          />
          <AppCard style={styles.detailCard}>
            {analytics.emotionPerformance.map((item) => (
              <View key={item.emotion} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{item.emotion}</Text>
                <Text style={[styles.detailValue, item.averagePnl >= 0 ? styles.profit : styles.loss]}>
                  {formatCompactCurrency(item.averagePnl)}
                </Text>
              </View>
            ))}
          </AppCard>
        </>
      ) : null}

      {activeTab === 'Setups' ? (
        <>
          <ChartShell
            subtitle="Total P&L by setup"
            title="Setup Contribution"
            values={analytics.setupPerformance.slice(0, 6).map((item) => item.totalPnl)}
          />
          <AppCard style={styles.detailCard}>
            {analytics.setupPerformance.slice(0, 6).map((item) => (
              <View key={item.setupType} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{item.setupType}</Text>
                <Text style={[styles.detailValue, item.totalPnl >= 0 ? styles.profit : styles.loss]}>
                  {formatCompactCurrency(item.totalPnl)}
                </Text>
              </View>
            ))}
          </AppCard>
        </>
      ) : null}

      {activeTab === 'Risk' ? (
        <>
          <View style={styles.metricsRow}>
            <StatCard label="Rule Streak" tone="accent" value={`${analytics.daysSinceRuleViolation}d`} />
            <StatCard label="Open Today" value={`${analytics.todayTrades.length}`} />
          </View>
          <ChartShell
            subtitle="Most recent trade P&L values"
            title="Recent Risk Outcomes"
            values={analytics.recentTrades.map((trade) => trade.pnlNet ?? 0)}
          />
        </>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  detailCard: {
    gap: 10,
    marginTop: spacing.md,
  },
  detailLabel: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: '700',
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  headerLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loss: {
    color: colors.loss,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  profit: {
    color: colors.profit,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: '800',
  },
});
