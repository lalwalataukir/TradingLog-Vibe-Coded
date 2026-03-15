import { useTheme } from '@/hooks/useTheme';
import { useTrades } from '@/hooks/useTrades';
import {
  calcCurrentStreak,
  calcExpectancy,
  calcMaxDrawdown,
  calcProfitFactor,
  calcWinRate,
  formatCurrency
} from '@/lib/calculations';
import { format, startOfMonth } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { trades, isLoading } = useTrades({ status: 'closed' });
  const { trades: allTrades } = useTrades({});

  const openTrades = allTrades.filter((t) => t.status === 'open');

  const stats = useMemo(() => {
    if (!trades.length) return null;

    const totalPnl = trades.reduce((s, t) => s + (t.pnl_net ?? 0), 0);
    const winRate = calcWinRate(trades);
    const profitFactor = calcProfitFactor(trades);
    const expectancy = calcExpectancy(trades);
    const streak = calcCurrentStreak(trades);

    // Monthly P&L
    const now = new Date();
    const monthStart = startOfMonth(now).toISOString().slice(0, 10);
    const monthTrades = trades.filter(
      (t) => t.exit_date && t.exit_date >= monthStart
    );
    const monthPnl = monthTrades.reduce((s, t) => s + (t.pnl_net ?? 0), 0);

    // Equity curve data
    let running = 0;
    const sorted = [...trades]
      .filter((t) => t.exit_date)
      .sort((a, b) => (a.exit_date! > b.exit_date! ? 1 : -1));

    const equityData = sorted.map((t) => {
      running += t.pnl_net ?? 0;
      return { value: running };
    });

    // Daily P&L bar chart (last 30 days)
    const dailyMap: Record<string, number> = {};
    for (const t of sorted.slice(-60)) {
      const d = (t.exit_date ?? '').slice(0, 10);
      dailyMap[d] = (dailyMap[d] ?? 0) + (t.pnl_net ?? 0);
    }
    const dailyBars = Object.entries(dailyMap)
      .sort()
      .slice(-20)
      .map(([date, val]) => ({
        value: val,
        frontColor: val >= 0 ? colors.green : colors.red,
        label: date.slice(5),
      }));

    // Win rate by setup
    const setupMap: Record<string, { wins: number; total: number }> = {};
    for (const t of trades) {
      if (!t.setup_type) continue;
      if (!setupMap[t.setup_type]) setupMap[t.setup_type] = { wins: 0, total: 0 };
      setupMap[t.setup_type].total++;
      if ((t.pnl_net ?? 0) > 0) setupMap[t.setup_type].wins++;
    }
    const setupWinRates = Object.entries(setupMap)
      .map(([setup, v]) => ({
        setup,
        winRate: (v.wins / v.total) * 100,
        count: v.total,
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);

    const maxDD = calcMaxDrawdown(equityData.map((d) => d.value));

    return {
      totalPnl,
      monthPnl,
      winRate,
      profitFactor,
      expectancy,
      streak,
      maxDD,
      equityData,
      dailyBars,
      setupWinRates,
      tradeCount: trades.length,
      monthTradeCount: monthTrades.length,
    };
  }, [trades, colors]);

  const recentTrades = allTrades.slice(0, 5);

  const s = styles(colors);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerGreeting}>TradeLog</Text>
            <Text style={s.headerDate}>{format(new Date(), 'EEEE, d MMM yyyy')}</Text>
          </View>
          <TouchableOpacity
            style={s.logButton}
            onPress={() => router.push('/trades/new')}
          >
            <Text style={s.logButtonText}>+ Log Trade</Text>
          </TouchableOpacity>
        </View>

        {/* Open trades banner */}
        {openTrades.length > 0 && (
          <TouchableOpacity style={s.openTradesBanner} onPress={() => router.push('/trades')}>
            <Text style={s.openTradesText}>
              🟢 {openTrades.length} open trade{openTrades.length > 1 ? 's' : ''}
            </Text>
            <Text style={s.openTradesArrow}>→</Text>
          </TouchableOpacity>
        )}

        {!stats ? (
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>📊</Text>
            <Text style={s.emptyTitle}>No trades yet</Text>
            <Text style={s.emptySubtitle}>Log your first trade to see analytics here.</Text>
            <TouchableOpacity
              style={s.emptyButton}
              onPress={() => router.push('/trades/new')}
            >
              <Text style={s.emptyButtonText}>Log First Trade</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Stats Row */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.statsRow}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              <StatCard
                colors={colors}
                label="Total P&L"
                value={formatCurrency(stats.totalPnl)}
                positive={stats.totalPnl >= 0}
                sub={`This month: ${formatCurrency(stats.monthPnl)}`}
              />
              <StatCard
                colors={colors}
                label="Win Rate"
                value={`${stats.winRate.toFixed(1)}%`}
                positive={stats.winRate >= 50}
                sub={`${stats.tradeCount} trades`}
              />
              <StatCard
                colors={colors}
                label="Profit Factor"
                value={stats.profitFactor === 999 ? '∞' : stats.profitFactor.toFixed(2)}
                positive={stats.profitFactor >= 1.5}
                sub="Gross W / Gross L"
              />
              <StatCard
                colors={colors}
                label="Expectancy"
                value={formatCurrency(stats.expectancy)}
                positive={stats.expectancy >= 0}
                sub="Per trade avg"
              />
              <StatCard
                colors={colors}
                label="Max Drawdown"
                value={formatCurrency(stats.maxDD)}
                positive={false}
                sub=""
              />
              <StatCard
                colors={colors}
                label="Streak"
                value={`${stats.streak.count} ${stats.streak.type === 'win' ? '🔥' : '❄️'}`}
                positive={stats.streak.type === 'win'}
                sub={stats.streak.type === 'win' ? 'Win streak' : 'Loss streak'}
              />
            </ScrollView>

            {/* Equity Curve */}
            <View style={s.chartCard}>
              <Text style={s.chartTitle}>Equity Curve</Text>
              {stats.equityData.length > 1 ? (
                <LineChart
                  data={stats.equityData}
                  width={width - 64}
                  height={160}
                  color={colors.primary}
                  thickness={2}
                  dataPointsColor={colors.primary}
                  dataPointsRadius={0}
                  startFillColor={colors.primary}
                  endFillColor="transparent"
                  areaChart
                  curved
                  hideDataPoints
                  yAxisColor="transparent"
                  xAxisColor={colors.border}
                  yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                  noOfSections={4}
                  rulesColor={colors.border}
                  rulesType="solid"
                  formatYLabel={(val) => formatCurrency(Number(val))}
                />
              ) : (
                <Text style={s.noDataText}>Not enough data</Text>
              )}
            </View>

            {/* Daily P&L Bar */}
            {stats.dailyBars.length > 0 && (
              <View style={s.chartCard}>
                <Text style={s.chartTitle}>Daily P&L (Last 20 Days)</Text>
                <BarChart
                  data={stats.dailyBars}
                  width={width - 64}
                  height={120}
                  barWidth={Math.max(8, (width - 80) / stats.dailyBars.length - 4)}
                  hideRules
                  yAxisColor="transparent"
                  xAxisColor={colors.border}
                  yAxisTextStyle={{ color: colors.textMuted, fontSize: 9 }}
                  xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9, rotation: 45 }}
                  noOfSections={3}
                  isAnimated
                />
              </View>
            )}

            {/* Win Rate by Setup */}
            {stats.setupWinRates.length > 0 && (
              <View style={s.chartCard}>
                <Text style={s.chartTitle}>Win Rate by Setup</Text>
                {stats.setupWinRates.map((item) => (
                  <View key={item.setup} style={s.setupRow}>
                    <Text style={s.setupLabel}>{item.setup.replace(/_/g, ' ')}</Text>
                    <View style={s.setupBarBg}>
                      <View
                        style={[
                          s.setupBarFill,
                          {
                            width: `${item.winRate}%`,
                            backgroundColor:
                              item.winRate >= 60 ? colors.green : item.winRate >= 40 ? colors.amber : colors.red,
                          },
                        ]}
                      />
                    </View>
                    <Text style={s.setupPct}>{item.winRate.toFixed(0)}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recent Trades */}
            <View style={s.recentSection}>
              <View style={s.recentHeader}>
                <Text style={s.sectionTitle}>Recent Trades</Text>
                <TouchableOpacity onPress={() => router.push('/trades')}>
                  <Text style={s.seeAll}>See all →</Text>
                </TouchableOpacity>
              </View>
              {recentTrades.map((trade) => (
                <TouchableOpacity
                  key={trade.id}
                  style={s.tradeRow}
                  onPress={() => router.push(`/trades/${trade.id}`)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.tradeSymbol}>{trade.symbol}</Text>
                    <Text style={s.tradeMeta}>
                      {trade.direction.toUpperCase()} · {trade.setup_type?.replace(/_/g, ' ') ?? '—'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        s.tradePnl,
                        { color: (trade.pnl_net ?? 0) >= 0 ? colors.green : colors.red },
                      ]}
                    >
                      {trade.pnl_net != null ? formatCurrency(trade.pnl_net, trade.market) : '—'}
                    </Text>
                    <View
                      style={[
                        s.statusBadge,
                        {
                          backgroundColor:
                            trade.status === 'open' ? colors.primaryLight + '22' : colors.badge.default,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.statusText,
                          {
                            color: trade.status === 'open' ? colors.primaryLight : colors.textSecondary,
                          },
                        ]}
                      >
                        {trade.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({
  colors,
  label,
  value,
  positive,
  sub,
}: {
  colors: any;
  label: string;
  value: string;
  positive: boolean;
  sub: string;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        minWidth: 140,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 6, fontWeight: '600' }}>
        {label.toUpperCase()}
      </Text>
      <Text
        style={{
          color: positive ? colors.green : colors.red,
          fontSize: 20,
          fontWeight: '700',
          marginBottom: 4,
        }}
      >
        {value}
      </Text>
      {sub ? <Text style={{ color: colors.textMuted, fontSize: 11 }}>{sub}</Text> : null}
    </View>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: 32 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
    },
    headerGreeting: { color: colors.text, fontSize: 24, fontWeight: '800' },
    headerDate: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
    logButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 9,
    },
    logButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    openTradesBanner: {
      marginHorizontal: 20,
      marginBottom: 12,
      backgroundColor: colors.primaryLight + '18',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary + '44',
    },
    openTradesText: { color: colors.primaryLight, fontSize: 13, fontWeight: '600' },
    openTradesArrow: { color: colors.primaryLight, fontSize: 16 },
    statsRow: { marginBottom: 16 },
    chartCard: {
      marginHorizontal: 20,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chartTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 12,
    },
    noDataText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
    setupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    setupLabel: { color: colors.textSecondary, fontSize: 12, width: 110, textTransform: 'capitalize' },
    setupBarBg: {
      flex: 1,
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    setupBarFill: { height: '100%', borderRadius: 3 },
    setupPct: { color: colors.text, fontSize: 12, fontWeight: '600', width: 32, textAlign: 'right' },
    recentSection: { marginHorizontal: 20, marginBottom: 16 },
    recentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
    seeAll: { color: colors.primary, fontSize: 13, fontWeight: '600' },
    tradeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tradeSymbol: { color: colors.text, fontSize: 15, fontWeight: '700' },
    tradeMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
    tradePnl: { fontSize: 15, fontWeight: '700' },
    statusBadge: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      marginTop: 4,
    },
    statusText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    emptyState: {
      alignItems: 'center',
      paddingTop: 80,
      paddingHorizontal: 40,
    },
    emptyEmoji: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 8 },
    emptySubtitle: { color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 },
    emptyButton: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 24,
      paddingVertical: 12,
      marginTop: 24,
    },
    emptyButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  });
