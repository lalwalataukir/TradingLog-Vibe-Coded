import { useTheme } from '@/hooks/useTheme';
import { useTrades } from '@/hooks/useTrades';
import {
    calcExpectancy,
    calcMaxConsecutiveLosses,
    calcMaxDrawdown,
    calcProfitFactor,
    calcWinRate,
    formatCurrency
} from '@/lib/calculations';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const { width } = Dimensions.get('window');
const CHART_W = width - 64;

const TABS = ['Performance', 'Behavioral', 'Setup', 'Risk'];

export default function AnalyticsScreen() {
    const { colors } = useTheme();
    const { trades } = useTrades({ status: 'closed' });
    const [activeTab, setActiveTab] = useState(0);
    const s = styles(colors);

    const analytics = useMemo(() => {
        if (!trades.length) return null;

        // ── Performance ──────────────────────────────────────────────────────────
        const wins = trades.filter((t) => (t.pnl_net ?? 0) > 0);
        const losses = trades.filter((t) => (t.pnl_net ?? 0) < 0);
        const winRate = calcWinRate(trades);
        const profitFactor = calcProfitFactor(trades);
        const expectancy = calcExpectancy(trades);
        const avgWin = wins.length ? wins.reduce((s, t) => s + (t.pnl_net ?? 0), 0) / wins.length : 0;
        const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + (t.pnl_net ?? 0), 0) / losses.length) : 0;

        let running = 0;
        const equityCurve: number[] = [...trades]
            .sort((a, b) => (a.exit_date! > b.exit_date! ? 1 : -1))
            .map((t) => { running += t.pnl_net ?? 0; return running; });
        const maxDD = calcMaxDrawdown(equityCurve);
        const maxConsecLoss = calcMaxConsecutiveLosses(trades);

        // Win rate by direction
        const longTrades = trades.filter((t) => t.direction === 'long');
        const shortTrades = trades.filter((t) => t.direction === 'short');

        // Win rate by timeframe
        const tfMap: Record<string, number[]> = {};
        for (const t of trades) {
            if (!t.timeframe) continue;
            if (!tfMap[t.timeframe]) tfMap[t.timeframe] = [];
            tfMap[t.timeframe].push((t.pnl_net ?? 0) > 0 ? 1 : 0);
        }
        const tfWinRates = Object.entries(tfMap).map(([tf, arr]) => ({
            label: tf.replace(/_/g, ' ').replace('d+', 'd+'),
            value: (arr.reduce((a, b) => a + b, 0) / arr.length) * 100,
            frontColor: colors.primary,
        }));

        // ── Behavioral ───────────────────────────────────────────────────────────
        const emotionMap: Record<string, { total: number; pnlSum: number }> = {};
        for (const t of trades) {
            const e = t.emotion_pre_trade;
            if (!e) continue;
            if (!emotionMap[e]) emotionMap[e] = { total: 0, pnlSum: 0 };
            emotionMap[e].total++;
            emotionMap[e].pnlSum += t.pnl_net ?? 0;
        }
        const emotionData = Object.entries(emotionMap)
            .map(([emotion, v]) => ({
                emotion,
                avgPnl: v.pnlSum / v.total,
                count: v.total,
                frontColor: v.pnlSum / v.total >= 0 ? colors.green : colors.red,
            }))
            .sort((a, b) => b.avgPnl - a.avgPnl);

        // Plan adherence
        const followed = trades.filter((t) => t.followed_plan === true);
        const notFollowed = trades.filter((t) => t.followed_plan === false);
        const followedAvg = followed.length
            ? followed.reduce((s, t) => s + (t.pnl_net ?? 0), 0) / followed.length
            : 0;
        const notFollowedAvg = notFollowed.length
            ? notFollowed.reduce((s, t) => s + (t.pnl_net ?? 0), 0) / notFollowed.length
            : 0;

        // Conviction vs outcome (conviction levels 1-5)
        const convMap: Record<number, number[]> = {};
        for (const t of trades) {
            if (!t.conviction_level) continue;
            if (!convMap[t.conviction_level]) convMap[t.conviction_level] = [];
            convMap[t.conviction_level].push(t.pnl_net ?? 0);
        }
        const convictionData = [1, 2, 3, 4, 5].map((c) => {
            const arr = convMap[c] ?? [];
            const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
            return { value: arr.length, label: `${c}★`, frontColor: avg >= 0 ? colors.green : colors.red };
        });

        // Mistake frequency
        const mistakeMap: Record<string, { count: number; cost: number }> = {};
        for (const t of trades) {
            if (!t.mistake_tags) continue;
            const tags: string[] = JSON.parse(t.mistake_tags);
            for (const tag of tags) {
                if (!mistakeMap[tag]) mistakeMap[tag] = { count: 0, cost: 0 };
                mistakeMap[tag].count++;
                mistakeMap[tag].cost += t.pnl_net ?? 0;
            }
        }
        const mistakeData = Object.entries(mistakeMap)
            .map(([tag, v]) => ({
                label: tag.replace(/_/g, '\n').slice(0, 15),
                value: Math.abs(v.cost),
                count: v.count,
                frontColor: colors.red,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);

        // ── Setup ─────────────────────────────────────────────────────────────────
        const setupMap: Record<string, { wins: number; total: number; pnlSum: number }> = {};
        for (const t of trades) {
            if (!t.setup_type) continue;
            if (!setupMap[t.setup_type]) setupMap[t.setup_type] = { wins: 0, total: 0, pnlSum: 0 };
            setupMap[t.setup_type].total++;
            setupMap[t.setup_type].pnlSum += t.pnl_net ?? 0;
            if ((t.pnl_net ?? 0) > 0) setupMap[t.setup_type].wins++;
        }
        const setupReport = Object.entries(setupMap)
            .map(([setup, v]) => ({
                setup,
                total: v.total,
                winRate: (v.wins / v.total) * 100,
                totalPnl: v.pnlSum,
                avgPnl: v.pnlSum / v.total,
            }))
            .sort((a, b) => b.totalPnl - a.totalPnl);

        // ── Risk ──────────────────────────────────────────────────────────────────
        const slHonored = trades.filter((t) => t.sl_honored === true);
        const slNotHonored = trades.filter((t) => t.sl_honored === false);
        const slHonoredAvg = slHonored.length ? slHonored.reduce((s, t) => s + (t.pnl_net ?? 0), 0) / slHonored.length : 0;
        const slNotAvg = slNotHonored.length ? slNotHonored.reduce((s, t) => s + (t.pnl_net ?? 0), 0) / slNotHonored.length : 0;
        const slDisciplineRate = trades.length ? (slHonored.length / trades.filter((t) => t.sl_honored != null).length) * 100 : 0;

        const rrPlannedActual = trades
            .filter((t) => t.risk_reward_planned != null && t.risk_reward_actual != null)
            .map((t) => ({
                planned: t.risk_reward_planned!,
                actual: t.risk_reward_actual!,
            }));

        return {
            // Performance
            winRate, profitFactor, expectancy, avgWin, avgLoss, maxDD, maxConsecLoss,
            longWinRate: calcWinRate(longTrades), shortWinRate: calcWinRate(shortTrades),
            tfWinRates,
            // Behavioral
            emotionData, followedAvg, notFollowedAvg, convictionData, mistakeData,
            followedCount: followed.length, notFollowedCount: notFollowed.length,
            // Setup
            setupReport,
            // Risk
            slDisciplineRate, slHonoredAvg, slNotAvg, rrPlannedActual,
        };
    }, [trades, colors]);

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <View style={s.header}>
                <Text style={s.title}>Analytics</Text>
            </View>

            {/* Tab Bar */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                {TABS.map((tab, i) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(i)}
                        style={[s.tab, i === activeTab && s.tabActive]}
                    >
                        <Text style={[s.tabText, i === activeTab && s.tabTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {!analytics ? (
                <View style={s.empty}>
                    <Text style={s.emptyEmoji}>📈</Text>
                    <Text style={s.emptyTitle}>No data yet</Text>
                    <Text style={s.emptySub}>Log and close trades to see analytics.</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                    {activeTab === 0 && <PerformanceTab analytics={analytics} colors={colors} />}
                    {activeTab === 1 && <BehavioralTab analytics={analytics} colors={colors} />}
                    {activeTab === 2 && <SetupTab analytics={analytics} colors={colors} />}
                    {activeTab === 3 && <RiskTab analytics={analytics} colors={colors} />}
                </ScrollView>
            )}
        </View>
    );
}

function Card({ colors, children, title }: any) {
    return (
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border }}>
            {title && <Text style={{ color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 12 }}>{title}</Text>}
            {children}
        </View>
    );
}

function MetricRow({ label, value, colors, positive }: any) {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{label}</Text>
            <Text style={{ color: positive == null ? colors.text : positive ? colors.green : colors.red, fontSize: 14, fontWeight: '700' }}>
                {value}
            </Text>
        </View>
    );
}

function PerformanceTab({ analytics: a, colors }: any) {
    return (
        <>
            <Card colors={colors} title="Key Metrics">
                <MetricRow label="Win Rate" value={`${a.winRate.toFixed(1)}%`} colors={colors} positive={a.winRate >= 50} />
                <MetricRow label="Profit Factor" value={a.profitFactor.toFixed(2)} colors={colors} positive={a.profitFactor >= 1.5} />
                <MetricRow label="Expectancy / Trade" value={formatCurrency(a.expectancy)} colors={colors} positive={a.expectancy >= 0} />
                <MetricRow label="Avg Winner" value={formatCurrency(a.avgWin)} colors={colors} positive={true} />
                <MetricRow label="Avg Loser" value={`-${formatCurrency(a.avgLoss)}`} colors={colors} positive={false} />
                <MetricRow label="Max Drawdown" value={formatCurrency(a.maxDD)} colors={colors} positive={false} />
                <MetricRow label="Max Consec. Losses" value={`${a.maxConsecLoss}`} colors={colors} positive={null} />
                <MetricRow label="Long Win Rate" value={`${a.longWinRate.toFixed(1)}%`} colors={colors} positive={a.longWinRate >= 50} />
                <MetricRow label="Short Win Rate" value={`${a.shortWinRate.toFixed(1)}%`} colors={colors} positive={a.shortWinRate >= 50} />
            </Card>
            {a.tfWinRates.length > 0 && (
                <Card colors={colors} title="Win Rate by Timeframe">
                    <BarChart
                        data={a.tfWinRates}
                        width={CHART_W - 32}
                        height={120}
                        noOfSections={4}
                        yAxisColor="transparent"
                        xAxisColor={colors.border}
                        yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                        xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 9 }}
                        rulesColor={colors.border}
                        barBorderRadius={4}
                        isAnimated
                    />
                </Card>
            )}
        </>
    );
}

function BehavioralTab({ analytics: a, colors }: any) {
    return (
        <>
            <Card colors={colors} title="Emotion vs Avg P&L">
                {a.emotionData.map((e: any) => (
                    <View key={e.emotion} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 14, flex: 1, textTransform: 'capitalize' }}>{e.emotion}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, width: 40, textAlign: 'center' }}>{e.count}x</Text>
                        <Text style={{ color: e.avgPnl >= 0 ? colors.green : colors.red, fontSize: 14, fontWeight: '700', width: 80, textAlign: 'right' }}>
                            {formatCurrency(e.avgPnl)}
                        </Text>
                    </View>
                ))}
            </Card>

            <Card colors={colors} title="Plan Adherence Impact">
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1, backgroundColor: colors.greenBg, borderRadius: 12, padding: 14, alignItems: 'center' }}>
                        <Text style={{ color: colors.green, fontSize: 20, fontWeight: '800' }}>{formatCurrency(a.followedAvg)}</Text>
                        <Text style={{ color: colors.green, fontSize: 11, marginTop: 4 }}>Followed Plan</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{a.followedCount} trades</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: colors.redBg, borderRadius: 12, padding: 14, alignItems: 'center' }}>
                        <Text style={{ color: colors.red, fontSize: 20, fontWeight: '800' }}>{formatCurrency(a.notFollowedAvg)}</Text>
                        <Text style={{ color: colors.red, fontSize: 11, marginTop: 4 }}>Deviated</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{a.notFollowedCount} trades</Text>
                    </View>
                </View>
            </Card>

            {a.mistakeData.length > 0 && (
                <Card colors={colors} title="Mistake Cost (Total P&L Impact)">
                    {a.mistakeData.map((m: any) => (
                        <View key={m.label} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <Text style={{ color: colors.textSecondary, fontSize: 12, flex: 1 }} numberOfLines={1}>{m.label.replace(/\n/g, ' ')}</Text>
                            <Text style={{ color: colors.textMuted, fontSize: 12, width: 30 }}>{m.count}x</Text>
                            <Text style={{ color: colors.red, fontSize: 13, fontWeight: '700', width: 80, textAlign: 'right' }}>
                                -{formatCurrency(m.value)}
                            </Text>
                        </View>
                    ))}
                </Card>
            )}

            <Card colors={colors} title="Conviction vs Trade Count">
                <BarChart
                    data={a.convictionData}
                    width={CHART_W - 32}
                    height={100}
                    noOfSections={3}
                    yAxisColor="transparent"
                    xAxisColor={colors.border}
                    yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 11 }}
                    barBorderRadius={4}
                    isAnimated
                />
            </Card>
        </>
    );
}

function SetupTab({ analytics: a, colors }: any) {
    return (
        <Card colors={colors} title="Setup Report Card">
            <View style={{ flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: colors.border }}>
                <Text style={{ color: colors.textMuted, fontSize: 11, flex: 2, fontWeight: '700' }}>SETUP</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, width: 36, fontWeight: '700', textAlign: 'center' }}>#</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, width: 44, fontWeight: '700', textAlign: 'center' }}>WIN%</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, width: 72, fontWeight: '700', textAlign: 'right' }}>TOTAL P&L</Text>
            </View>
            {a.setupReport.map((r: any) => (
                <View key={r.setup} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                    <Text style={{ color: colors.text, fontSize: 13, flex: 2, textTransform: 'capitalize' }} numberOfLines={1}>
                        {r.setup.replace(/_/g, ' ')}
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 13, width: 36, textAlign: 'center' }}>{r.total}</Text>
                    <Text style={{ color: r.winRate >= 50 ? colors.green : colors.red, fontSize: 13, width: 44, textAlign: 'center', fontWeight: '700' }}>
                        {r.winRate.toFixed(0)}%
                    </Text>
                    <Text style={{ color: r.totalPnl >= 0 ? colors.green : colors.red, fontSize: 13, width: 72, textAlign: 'right', fontWeight: '700' }}>
                        {formatCurrency(r.totalPnl)}
                    </Text>
                </View>
            ))}
        </Card>
    );
}

function RiskTab({ analytics: a, colors }: any) {
    return (
        <>
            <Card colors={colors} title="Stop Loss Discipline">
                <MetricRow label="SL Discipline Rate" value={`${a.slDisciplineRate.toFixed(1)}%`} colors={colors} positive={a.slDisciplineRate >= 80} />
                <MetricRow label="Avg P&L (SL Honored)" value={formatCurrency(a.slHonoredAvg)} colors={colors} positive={a.slHonoredAvg >= 0} />
                <MetricRow label="Avg P&L (SL NOT Honored)" value={formatCurrency(a.slNotAvg)} colors={colors} positive={a.slNotAvg >= 0} />
            </Card>
            {a.rrPlannedActual.length > 0 && (
                <Card colors={colors} title="R:R Planned vs Actual">
                    {a.rrPlannedActual.slice(0, 10).map((r: any, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1 }}>Planned: {r.planned.toFixed(2)}R</Text>
                            <Text style={{
                                color: r.actual >= r.planned ? colors.green : colors.amber,
                                fontSize: 13,
                                fontWeight: '700',
                            }}>
                                Actual: {r.actual.toFixed(2)}R {r.actual >= r.planned ? '✓' : '↓'}
                            </Text>
                        </View>
                    ))}
                </Card>
            )}
        </>
    );
}

const styles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
    title: { color: colors.text, fontSize: 24, fontWeight: '800' },
    tabBar: { borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 4 },
    tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginVertical: 8 },
    tabActive: { backgroundColor: colors.primary },
    tabText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
    tabTextActive: { color: '#fff' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyEmoji: { fontSize: 56, marginBottom: 12 },
    emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '700' },
    emptySub: { color: colors.textMuted, fontSize: 14, marginTop: 6 },
});
