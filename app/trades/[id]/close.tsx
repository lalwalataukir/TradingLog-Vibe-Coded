import { EMOTIONS, MISTAKE_TAGS } from '@/constants/enums';
import db from '@/db';
import { trades } from '@/db/schema';
import { useTheme } from '@/hooks/useTheme';
import { calcPnl, calcPnlNet, calcPnlPercentage, calcRiskRewardActual, formatCurrency } from '@/lib/calculations';
import { format } from 'date-fns';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CloseTradeScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const s = styles(colors);

    const trade = db.select().from(trades).where(eq(trades.id, id as string)).get();

    const [exitDate, setExitDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    const [exitPrice, setExitPrice] = useState('');
    const [exitFees, setExitFees] = useState('0');
    const [emotionDuring, setEmotionDuring] = useState('neutral');
    const [emotionPost, setEmotionPost] = useState('neutral');
    const [followedPlan, setFollowedPlan] = useState<boolean | null>(null);
    const [deviationNotes, setDeviationNotes] = useState('');
    const [mistakeTags, setMistakeTags] = useState<string[]>([]);
    const [lessonLearned, setLessonLearned] = useState('');
    const [rating, setRating] = useState<number>(3);
    const [slHonored, setSlHonored] = useState<boolean | null>(null);
    const [actualSlHit, setActualSlHit] = useState(false);

    if (!trade) return null;

    const currency = trade.market === 'us_equity' ? '$' : '₹';

    const previewPnl = (() => {
        const ep = parseFloat(exitPrice);
        if (isNaN(ep)) return null;
        const pnl = calcPnl(trade.entry_price, ep, trade.quantity, trade.direction as 'long' | 'short');
        const pnlNet = calcPnlNet(pnl, trade.entry_fees ?? 0, parseFloat(exitFees) || 0);
        const pnlPct = calcPnlPercentage(pnlNet, trade.entry_price, trade.quantity);
        const rrActual = calcRiskRewardActual(trade.entry_price, ep, trade.stop_loss);
        return { pnl, pnlNet, pnlPct, rrActual };
    })();

    const toggleMistake = (val: string) =>
        setMistakeTags((t) => t.includes(val) ? t.filter((x) => x !== val) : [...t, val]);

    const saveTrade = () => {
        if (!exitPrice) return;
        const ep = parseFloat(exitPrice);
        const pnl = calcPnl(trade.entry_price, ep, trade.quantity, trade.direction as 'long' | 'short');
        const pnlNet = calcPnlNet(pnl, trade.entry_fees ?? 0, parseFloat(exitFees) || 0);
        const pnlPct = calcPnlPercentage(pnlNet, trade.entry_price, trade.quantity);
        const rrActual = calcRiskRewardActual(trade.entry_price, ep, trade.stop_loss);

        db.update(trades).set({
            exit_date: exitDate,
            exit_price: ep,
            exit_fees: parseFloat(exitFees) || 0,
            status: 'closed',
            pnl,
            pnl_net: pnlNet,
            pnl_percentage: pnlPct,
            risk_reward_actual: rrActual,
            emotion_during_trade: emotionDuring || null,
            emotion_post_trade: emotionPost || null,
            followed_plan: followedPlan,
            plan_deviation_notes: deviationNotes || null,
            mistake_tags: mistakeTags.length > 0 ? JSON.stringify(mistakeTags) : null,
            lesson_learned: lessonLearned || null,
            rating,
            sl_honored: slHonored,
            actual_sl_hit: actualSlHit,
        }).where(eq(trades.id, id as string)).run();

        router.back();
        router.back();
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={s.cancel}>Cancel</Text></TouchableOpacity>
                <Text style={s.title}>Close Trade</Text>
                <TouchableOpacity onPress={saveTrade}><Text style={s.save}>Save</Text></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 18 }}>
                {/* Trade Info Banner */}
                <View style={s.tradeBanner}>
                    <Text style={s.bannerSymbol}>{trade.symbol}</Text>
                    <Text style={s.bannerMeta}>
                        {trade.direction.toUpperCase()} @ {currency}{trade.entry_price} × {trade.quantity}
                    </Text>
                </View>

                {/* Exit Details */}
                <View>
                    <Label text="Exit Date & Time" colors={colors} />
                    <TextInput style={s.input} value={exitDate} onChangeText={setExitDate} placeholderTextColor={colors.textMuted} />
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Label text="Exit Price *" colors={colors} />
                        <TextInput
                            style={s.input}
                            value={exitPrice}
                            onChangeText={setExitPrice}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Label text="Exit Fees" colors={colors} />
                        <TextInput style={s.input} value={exitFees} onChangeText={setExitFees} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textMuted} />
                    </View>
                </View>

                {/* P&L Preview */}
                {previewPnl && (
                    <View style={[s.pnlPreview, { backgroundColor: previewPnl.pnlNet >= 0 ? colors.greenBg : colors.redBg, borderColor: previewPnl.pnlNet >= 0 ? colors.green : colors.red }]}>
                        <Text style={[s.pnlAmount, { color: previewPnl.pnlNet >= 0 ? colors.green : colors.red }]}>
                            {formatCurrency(previewPnl.pnlNet, trade.market)}
                        </Text>
                        <Text style={[s.pnlPct, { color: previewPnl.pnlNet >= 0 ? colors.green : colors.red }]}>
                            {previewPnl.pnlPct >= 0 ? '+' : ''}{previewPnl.pnlPct.toFixed(2)}%
                        </Text>
                        {previewPnl.rrActual != null && (
                            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Actual R:R: {previewPnl.rrActual.toFixed(2)}R</Text>
                        )}
                    </View>
                )}

                {/* SL Fields */}
                <View>
                    <Label text="Did price hit your SL?" colors={colors} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {[{ val: true, label: 'Yes' }, { val: false, label: 'No' }].map(({ val, label }) => (
                            <TouchableOpacity
                                key={label}
                                style={[s.boolBtn, actualSlHit === val && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                onPress={() => setActualSlHit(val)}
                            >
                                <Text style={[s.boolBtnText, actualSlHit === val && { color: '#fff' }]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View>
                    <Label text="Did you honor your SL?" colors={colors} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {[{ val: true, label: '✅ Yes' }, { val: false, label: '❌ No' }].map(({ val, label }) => (
                            <TouchableOpacity
                                key={label}
                                style={[s.boolBtn, slHonored === val && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                onPress={() => setSlHonored(val)}
                            >
                                <Text style={[s.boolBtnText, slHonored === val && { color: '#fff' }]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Emotions */}
                <Label text="Emotion During Trade" colors={colors} />
                <EmotionPicker value={emotionDuring} onChange={setEmotionDuring} colors={colors} />

                <Label text="Emotion After Trade" colors={colors} />
                <EmotionPicker value={emotionPost} onChange={setEmotionPost} colors={colors} />

                {/* Plan Adherence */}
                <View>
                    <Label text="Did you follow your plan?" colors={colors} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {[{ val: true, label: '✅ Yes' }, { val: false, label: '❌ No' }].map(({ val, label }) => (
                            <TouchableOpacity
                                key={label}
                                style={[s.boolBtn, followedPlan === val && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                onPress={() => setFollowedPlan(val)}
                            >
                                <Text style={[s.boolBtnText, followedPlan === val && { color: '#fff' }]}>{label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {followedPlan === false && (
                    <View>
                        <Label text="What did you do differently?" colors={colors} />
                        <TextInput style={[s.input, { height: 70 }]} multiline value={deviationNotes} onChangeText={setDeviationNotes} placeholder="Describe the deviation..." placeholderTextColor={colors.textMuted} textAlignVertical="top" />
                    </View>
                )}

                {/* Mistake Tags */}
                <View>
                    <Label text="Mistake Tags" colors={colors} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {MISTAKE_TAGS.map((m) => (
                            <TouchableOpacity
                                key={m.value}
                                style={[s.chip, mistakeTags.includes(m.value) && { backgroundColor: colors.red + '22', borderColor: colors.red }]}
                                onPress={() => toggleMistake(m.value)}
                            >
                                <Text style={[s.chipText, mistakeTags.includes(m.value) && { color: colors.red }]}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Lesson */}
                <View>
                    <Label text="Lesson Learned" colors={colors} />
                    <TextInput
                        style={[s.input, { height: 90 }]}
                        multiline
                        value={lessonLearned}
                        onChangeText={setLessonLearned}
                        placeholder="What would I do differently?"
                        placeholderTextColor={colors.textMuted}
                        textAlignVertical="top"
                    />
                </View>

                {/* Process Rating */}
                <View>
                    <Label text={`Process Rating: ${rating}/5`} colors={colors} />
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                            <TouchableOpacity
                                key={n}
                                style={[s.chip, rating === n && { backgroundColor: colors.amber + '33', borderColor: colors.amber }]}
                                onPress={() => setRating(n)}
                            >
                                <Text style={{ fontSize: 18 }}>{'⭐'.repeat(n)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity style={s.saveFullBtn} onPress={saveTrade}>
                    <Text style={s.saveFullBtnText}>Close Trade & Save</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function Label({ text, colors }: { text: string; colors: any }) {
    return <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8 }}>{text}</Text>;
}

function EmotionPicker({ value, onChange, colors }: any) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                {EMOTIONS.map((e) => (
                    <TouchableOpacity
                        key={e.value}
                        style={{ alignItems: 'center', padding: 8, borderRadius: 12, backgroundColor: value === e.value ? colors.primary : colors.surface, borderWidth: 1, borderColor: value === e.value ? colors.primary : colors.border, minWidth: 60 }}
                        onPress={() => onChange(e.value)}
                    >
                        <Text style={{ fontSize: 20 }}>{e.emoji}</Text>
                        <Text style={{ color: value === e.value ? '#fff' : colors.textMuted, fontSize: 10, marginTop: 2 }}>{e.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = (c: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: c.border },
    cancel: { color: c.textMuted, fontSize: 16 },
    title: { color: c.text, fontSize: 18, fontWeight: '700' },
    save: { color: c.primary, fontSize: 16, fontWeight: '700' },
    tradeBanner: { backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border },
    bannerSymbol: { color: c.text, fontSize: 22, fontWeight: '800' },
    bannerMeta: { color: c.textMuted, fontSize: 14, marginTop: 4, textTransform: 'capitalize' },
    input: { backgroundColor: c.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border },
    pnlPreview: { borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1 },
    pnlAmount: { fontSize: 32, fontWeight: '800' },
    pnlPct: { fontSize: 16, fontWeight: '700', marginTop: 4 },
    boolBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center' },
    boolBtnText: { color: c.textSecondary, fontSize: 14, fontWeight: '600' },
    chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    chipText: { color: c.textSecondary, fontSize: 12, fontWeight: '600' },
    saveFullBtn: { backgroundColor: c.green, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
    saveFullBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
