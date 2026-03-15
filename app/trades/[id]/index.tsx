import { EMOTIONS } from '@/constants/enums';
import db from '@/db';
import { trades } from '@/db/schema';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency, formatPct, formatRR } from '@/lib/calculations';
import { format } from 'date-fns';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function TradeDetailScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const s = styles(colors);

    const trade = db.select().from(trades).where(eq(trades.id, id as string)).get();

    if (!trade) {
        return (
            <View style={s.container}>
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Back</Text></TouchableOpacity>
                </View>
                <View style={s.center}>
                    <Text style={s.notFound}>Trade not found.</Text>
                </View>
            </View>
        );
    }

    const pnlColor = trade.pnl_net != null ? (trade.pnl_net >= 0 ? colors.green : colors.red) : colors.textMuted;
    const currency = trade.market === 'us_equity' ? '$' : '₹';

    const deleteHandler = () => {
        Alert.alert('Delete Trade', 'Are you sure? This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: () => {
                    db.delete(trades).where(eq(trades.id, id as string)).run();
                    router.back();
                }
            },
        ]);
    };

    const emotionEmoji = (e: string | null) => {
        if (!e) return '—';
        const found = EMOTIONS.find((em) => em.value === e);
        return found ? `${found.emoji} ${found.label}` : e;
    };

    const parsedMistakes: string[] = trade.mistake_tags ? JSON.parse(trade.mistake_tags) : [];
    const parsedConfluence: string[] = trade.confluence_factors ? JSON.parse(trade.confluence_factors) : [];

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.back}>← Back</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    {trade.status === 'open' && (
                        <TouchableOpacity
                            style={s.closeBtn}
                            onPress={() => router.push(`/trades/${id}/close`)}
                        >
                            <Text style={s.closeBtnText}>Close Trade</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={deleteHandler}>
                        <Text style={s.deleteBtn}>🗑</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Symbol + P&L */}
                <View style={s.heroCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={s.symbol}>{trade.symbol}</Text>
                        <Text style={s.heroMeta}>
                            {trade.direction.toUpperCase()} · {trade.market.replace(/_/g, ' ')} · {trade.instrument_type.replace(/_/g, ' ')}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        {trade.pnl_net != null ? (
                            <>
                                <Text style={[s.pnl, { color: pnlColor }]}>{formatCurrency(trade.pnl_net, trade.market)}</Text>
                                {trade.pnl_percentage != null && (
                                    <Text style={[s.pnlPct, { color: pnlColor }]}>{formatPct(trade.pnl_percentage)}</Text>
                                )}
                            </>
                        ) : (
                            <View style={s.openBadge}>
                                <Text style={s.openBadgeText}>OPEN</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Execution */}
                <Section title="Execution" colors={colors}>
                    <Row label="Entry" value={`${currency}${trade.entry_price} × ${trade.quantity}`} colors={colors} />
                    <Row label="Entry Date" value={format(new Date(trade.entry_date), 'dd MMM yyyy, HH:mm')} colors={colors} />
                    <Row label="Entry Fees" value={`${currency}${trade.entry_fees}`} colors={colors} />
                    {trade.exit_price != null && <Row label="Exit" value={`${currency}${trade.exit_price}`} colors={colors} />}
                    {trade.exit_date != null && <Row label="Exit Date" value={format(new Date(trade.exit_date), 'dd MMM yyyy, HH:mm')} colors={colors} />}
                    {trade.exit_fees != null && <Row label="Exit Fees" value={`${currency}${trade.exit_fees}`} colors={colors} />}
                    <Row label="Status" value={trade.status.toUpperCase()} colors={colors} />
                </Section>

                {/* Risk */}
                <Section title="Risk Management" colors={colors}>
                    <Row label="Stop Loss" value={trade.stop_loss != null ? `${currency}${trade.stop_loss}` : '—'} colors={colors} />
                    <Row label="Target" value={trade.target != null ? `${currency}${trade.target}` : '—'} colors={colors} />
                    <Row label="R:R Planned" value={formatRR(trade.risk_reward_planned)} colors={colors} />
                    <Row label="R:R Actual" value={formatRR(trade.risk_reward_actual)} colors={colors} />
                    <Row label="SL Honored" value={trade.sl_honored == null ? '—' : trade.sl_honored ? '✅ Yes' : '❌ No'} colors={colors} />
                    <Row label="SL Hit" value={trade.actual_sl_hit ? '⚠ Yes' : 'No'} colors={colors} />
                </Section>

                {/* Setup */}
                <Section title="Setup & Thesis" colors={colors}>
                    <Row label="Setup Type" value={trade.setup_type?.replace(/_/g, ' ') ?? '—'} colors={colors} />
                    <Row label="Timeframe" value={trade.timeframe?.replace(/_/g, ' ') ?? '—'} colors={colors} />
                    <Row label="Conviction" value={trade.conviction_level != null ? `${trade.conviction_level}/5` : '—'} colors={colors} />
                    {parsedConfluence.length > 0 && (
                        <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6 }}>Confluence Factors</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {parsedConfluence.map((c) => (
                                    <View key={c} style={{ backgroundColor: colors.surfaceElevated, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{c.replace(/_/g, ' ')}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                    {trade.thesis && (
                        <View style={{ paddingVertical: 10 }}>
                            <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 4 }}>Thesis</Text>
                            <Text style={{ color: colors.text, fontSize: 14, lineHeight: 21 }}>{trade.thesis}</Text>
                        </View>
                    )}
                </Section>

                {/* Psychology */}
                <Section title="Psychology" colors={colors}>
                    <Row label="Pre-Trade Emotion" value={emotionEmoji(trade.emotion_pre_trade)} colors={colors} />
                    <Row label="During Trade" value={emotionEmoji(trade.emotion_during_trade)} colors={colors} />
                    <Row label="Post Trade" value={emotionEmoji(trade.emotion_post_trade)} colors={colors} />
                    <Row label="Followed Plan" value={trade.followed_plan == null ? '—' : trade.followed_plan ? '✅ Yes' : '❌ No'} colors={colors} />
                    {trade.plan_deviation_notes && (
                        <View style={{ paddingVertical: 8 }}>
                            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Deviation Notes</Text>
                            <Text style={{ color: colors.text, fontSize: 14, marginTop: 4 }}>{trade.plan_deviation_notes}</Text>
                        </View>
                    )}
                </Section>

                {/* Review */}
                {(trade.lesson_learned || parsedMistakes.length > 0 || trade.rating) && (
                    <Section title="Review" colors={colors}>
                        {trade.rating != null && <Row label="Process Rating" value={'⭐'.repeat(trade.rating)} colors={colors} />}
                        {parsedMistakes.length > 0 && (
                            <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                                <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6 }}>Mistake Tags</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                    {parsedMistakes.map((m) => (
                                        <View key={m} style={{ backgroundColor: colors.redBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                                            <Text style={{ color: colors.red, fontSize: 12 }}>{m.replace(/_/g, ' ')}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                        {trade.lesson_learned && (
                            <View style={{ paddingVertical: 8 }}>
                                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Lesson Learned</Text>
                                <Text style={{ color: colors.text, fontSize: 14, marginTop: 4, lineHeight: 21 }}>{trade.lesson_learned}</Text>
                            </View>
                        )}
                    </Section>
                )}
            </ScrollView>
        </View>
    );
}

function Section({ title, colors, children }: any) {
    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
                {title}
            </Text>
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                {children}
            </View>
        </View>
    );
}

function Row({ label, value, colors }: { label: string; value: string; colors: any }) {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{label}</Text>
            <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' }} numberOfLines={1}>{value}</Text>
        </View>
    );
}

const styles = (c: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
    back: { color: c.primary, fontSize: 16, fontWeight: '600' },
    closeBtn: { backgroundColor: c.green, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 },
    closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    deleteBtn: { fontSize: 20 },
    heroCard: { backgroundColor: c.surface, borderRadius: 18, padding: 20, flexDirection: 'row', marginBottom: 16, borderWidth: 1, borderColor: c.border },
    symbol: { color: c.text, fontSize: 26, fontWeight: '800' },
    heroMeta: { color: c.textMuted, fontSize: 12, textTransform: 'capitalize', marginTop: 4 },
    pnl: { fontSize: 22, fontWeight: '800' },
    pnlPct: { fontSize: 14, fontWeight: '600', marginTop: 3 },
    openBadge: { backgroundColor: c.primaryLight + '22', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
    openBadgeText: { color: c.primaryLight, fontSize: 13, fontWeight: '700' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    notFound: { color: c.textMuted, fontSize: 16 },
});
