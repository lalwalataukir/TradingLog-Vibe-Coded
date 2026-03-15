import {
    CONFLUENCE_FACTORS, EMOTIONS,
    INSTRUMENT_TYPES,
    MARKETS,
    SETUP_TYPES,
    TIMEFRAMES
} from '@/constants/enums';
import db from '@/db';
import { trades } from '@/db/schema';
import { useTheme } from '@/hooks/useTheme';
import {
    calcRiskRewardPlanned
} from '@/lib/calculations';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

const STEPS = ['Instrument', 'Execution', 'Setup', 'Psychology'];

type FormState = {
    symbol: string;
    market: string;
    instrument_type: string;
    direction: string;
    expiry_date: string;
    strike_price: string;
    entry_date: string;
    entry_price: string;
    quantity: string;
    entry_fees: string;
    stop_loss: string;
    target: string;
    setup_type: string;
    thesis: string;
    timeframe: string;
    confluence_factors: string[];
    conviction_level: number;
    emotion_pre_trade: string;
};

const CONVICTION_LEVELS_LIST = [1, 2, 3, 4, 5];

export default function NewTradeScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [step, setStep] = useState(0);
    const s = styles(colors);

    const [form, setForm] = useState<FormState>({
        symbol: '',
        market: 'indian_equity',
        instrument_type: 'stock',
        direction: 'long',
        expiry_date: '',
        strike_price: '',
        entry_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        entry_price: '',
        quantity: '',
        entry_fees: '0',
        stop_loss: '',
        target: '',
        setup_type: 'breakout',
        thesis: '',
        timeframe: 'intraday',
        confluence_factors: [],
        conviction_level: 3,
        emotion_pre_trade: 'neutral',
    });

    const set = (key: keyof FormState, val: any) =>
        setForm((f) => ({ ...f, [key]: val }));

    const toggleConfluence = (val: string) =>
        set('confluence_factors', form.confluence_factors.includes(val)
            ? form.confluence_factors.filter((c) => c !== val)
            : [...form.confluence_factors, val]);

    const isFO = form.market === 'indian_fo';
    const isOption = form.instrument_type === 'call_option' || form.instrument_type === 'put_option';

    const liveRR = (() => {
        const ep = parseFloat(form.entry_price);
        const sl = parseFloat(form.stop_loss);
        const t = parseFloat(form.target);
        if (!ep || !sl || !t) return null;
        return calcRiskRewardPlanned(ep, t, sl);
    })();

    const saveTrade = () => {
        const ep = parseFloat(form.entry_price);
        const qty = parseInt(form.quantity);
        if (!form.symbol.trim() || isNaN(ep) || isNaN(qty)) {
            return; // basic validation
        }

        db.insert(trades).values({
            id: uuidv4(),
            symbol: form.symbol.trim().toUpperCase(),
            market: form.market,
            instrument_type: form.instrument_type,
            direction: form.direction,
            expiry_date: form.expiry_date || null,
            strike_price: form.strike_price ? parseFloat(form.strike_price) : null,
            entry_date: form.entry_date,
            entry_price: ep,
            quantity: qty,
            entry_fees: parseFloat(form.entry_fees) || 0,
            stop_loss: form.stop_loss ? parseFloat(form.stop_loss) : null,
            target: form.target ? parseFloat(form.target) : null,
            risk_reward_planned: liveRR,
            setup_type: form.setup_type || null,
            thesis: form.thesis || null,
            timeframe: form.timeframe || null,
            confluence_factors: form.confluence_factors.length > 0 ? JSON.stringify(form.confluence_factors) : null,
            conviction_level: form.conviction_level,
            emotion_pre_trade: form.emotion_pre_trade || null,
            status: 'open',
            pnl: null, pnl_net: null, pnl_percentage: null,
            risk_reward_actual: null, position_size_pct: null,
            emotion_during_trade: null, emotion_post_trade: null,
            followed_plan: null, plan_deviation_notes: null,
            lesson_learned: null, mistake_tags: null, rating: null,
            screenshots: null, actual_sl_hit: false, sl_honored: null,
            exit_date: null, exit_price: null, exit_fees: 0,
        }).run();

        router.back();
    };

    const canNext = () => {
        if (step === 0) return form.symbol.trim().length > 0;
        if (step === 1) return form.entry_price.length > 0 && form.quantity.length > 0;
        return true;
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.cancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={s.title}>Log Trade</Text>
                {step === STEPS.length - 1 ? (
                    <TouchableOpacity onPress={saveTrade}>
                        <Text style={s.save}>Save</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 50 }} />
                )}
            </View>

            {/* Step Progress */}
            <View style={s.stepBar}>
                {STEPS.map((label, i) => (
                    <View key={label} style={s.stepItem}>
                        <View style={[s.stepDot, i <= step && { backgroundColor: colors.primary }]}>
                            <Text style={[s.stepNum, i <= step && { color: '#fff' }]}>{i + 1}</Text>
                        </View>
                        <Text style={[s.stepLabel, i === step && { color: colors.primary }]}>{label}</Text>
                    </View>
                ))}
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
                {step === 0 && <Step1 form={form} set={set} isFO={isFO} isOption={isOption} colors={colors} />}
                {step === 1 && <Step2 form={form} set={set} liveRR={liveRR} colors={colors} />}
                {step === 2 && <Step3 form={form} set={set} toggleConfluence={toggleConfluence} colors={colors} />}
                {step === 3 && <Step4 form={form} set={set} colors={colors} />}
            </ScrollView>

            {/* Bottom Nav */}
            <View style={s.bottomNav}>
                {step > 0 && (
                    <TouchableOpacity style={s.backBtn} onPress={() => setStep((s) => s - 1)}>
                        <Text style={s.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                )}
                {step < STEPS.length - 1 && (
                    <TouchableOpacity
                        style={[s.nextBtn, !canNext() && { opacity: 0.4 }]}
                        onPress={() => setStep((s) => s + 1)}
                        disabled={!canNext()}
                    >
                        <Text style={s.nextBtnText}>Next →</Text>
                    </TouchableOpacity>
                )}
                {step === STEPS.length - 1 && (
                    <TouchableOpacity style={s.saveBtn} onPress={saveTrade}>
                        <Text style={s.saveBtnText}>Save as Open Trade</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

// ─── Step 1: Instrument & Direction ──────────────────────────────────────────
function Step1({ form, set, isFO, isOption, colors }: any) {
    const s = fieldStyles(colors);
    return (
        <>
            <Field label="Symbol *" colors={colors}>
                <TextInput
                    style={s.input}
                    value={form.symbol}
                    onChangeText={(v) => set('symbol', v.toUpperCase())}
                    placeholder="RELIANCE, NIFTY25JAN..."
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                />
            </Field>

            <Field label="Market" colors={colors}>
                <ChipGroup options={MARKETS} value={form.market} onChange={(v: string) => set('market', v)} colors={colors} />
            </Field>

            <Field label="Instrument Type" colors={colors}>
                <ChipGroup options={INSTRUMENT_TYPES} value={form.instrument_type} onChange={(v: string) => set('instrument_type', v)} colors={colors} />
            </Field>

            {(isFO) && (
                <Field label="Expiry Date" colors={colors}>
                    <TextInput
                        style={s.input}
                        value={form.expiry_date}
                        onChangeText={(v) => set('expiry_date', v)}
                        placeholder="2025-01-30"
                        placeholderTextColor={colors.textMuted}
                    />
                </Field>
            )}

            {isOption && (
                <Field label="Strike Price" colors={colors}>
                    <TextInput
                        style={s.input}
                        value={form.strike_price}
                        onChangeText={(v) => set('strike_price', v)}
                        placeholder="22000"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="decimal-pad"
                    />
                </Field>
            )}

            <Field label="Direction" colors={colors}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        style={[s.dirBtn, form.direction === 'long' && { backgroundColor: colors.green, borderColor: colors.green }]}
                        onPress={() => set('direction', 'long')}
                    >
                        <Text style={[s.dirBtnText, form.direction === 'long' && { color: '#fff' }]}>↑ Long</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.dirBtn, form.direction === 'short' && { backgroundColor: colors.red, borderColor: colors.red }]}
                        onPress={() => set('direction', 'short')}
                    >
                        <Text style={[s.dirBtnText, form.direction === 'short' && { color: '#fff' }]}>↓ Short</Text>
                    </TouchableOpacity>
                </View>
            </Field>
        </>
    );
}

// ─── Step 2: Execution ────────────────────────────────────────────────────────
function Step2({ form, set, liveRR, colors }: any) {
    const s = fieldStyles(colors);
    return (
        <>
            <Field label="Entry Date & Time" colors={colors}>
                <TextInput
                    style={s.input}
                    value={form.entry_date}
                    onChangeText={(v) => set('entry_date', v)}
                    placeholder="2025-01-10T09:30"
                    placeholderTextColor={colors.textMuted}
                />
            </Field>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <Field label="Entry Price *" colors={colors}>
                        <TextInput style={s.input} value={form.entry_price} onChangeText={(v) => set('entry_price', v)} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} />
                    </Field>
                </View>
                <View style={{ flex: 1 }}>
                    <Field label="Quantity *" colors={colors}>
                        <TextInput style={s.input} value={form.quantity} onChangeText={(v) => set('quantity', v)} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.textMuted} />
                    </Field>
                </View>
            </View>
            <Field label="Entry Fees" colors={colors}>
                <TextInput style={s.input} value={form.entry_fees} onChangeText={(v) => set('entry_fees', v)} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textMuted} />
            </Field>
            <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                    <Field label="Stop Loss" colors={colors}>
                        <TextInput style={s.input} value={form.stop_loss} onChangeText={(v) => set('stop_loss', v)} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} />
                    </Field>
                </View>
                <View style={{ flex: 1 }}>
                    <Field label="Target" colors={colors}>
                        <TextInput style={s.input} value={form.target} onChangeText={(v) => set('target', v)} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} />
                    </Field>
                </View>
            </View>
            {liveRR != null && (
                <View style={{ backgroundColor: colors.primary + '22', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.primary + '44' }}>
                    <Text style={{ color: colors.textMuted, fontSize: 12 }}>Planned R:R</Text>
                    <Text style={{ color: colors.primary, fontSize: 28, fontWeight: '800' }}>{liveRR.toFixed(2)}R</Text>
                    <Text style={{ color: colors.textMuted, fontSize: 11 }}>{liveRR >= 2 ? '✅ Good' : liveRR >= 1 ? '⚠ Marginal' : '❌ Poor'}</Text>
                </View>
            )}
        </>
    );
}

// ─── Step 3: Setup & Thesis ───────────────────────────────────────────────────
function Step3({ form, set, toggleConfluence, colors }: any) {
    const s = fieldStyles(colors);
    return (
        <>
            <Field label="Setup Type" colors={colors}>
                <ChipGroup options={SETUP_TYPES} value={form.setup_type} onChange={(v: string) => set('setup_type', v)} colors={colors} />
            </Field>
            <Field label="Timeframe" colors={colors}>
                <ChipGroup options={TIMEFRAMES} value={form.timeframe} onChange={(v: string) => set('timeframe', v)} colors={colors} />
            </Field>
            <Field label="Confluence Factors" colors={colors}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {CONFLUENCE_FACTORS.map((cf) => (
                        <TouchableOpacity
                            key={cf.value}
                            style={[s.chip, form.confluence_factors.includes(cf.value) && s.chipActive]}
                            onPress={() => toggleConfluence(cf.value)}
                        >
                            <Text style={[s.chipText, form.confluence_factors.includes(cf.value) && s.chipTextActive]}>
                                {cf.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Field>
            <Field label="Thesis — Why this trade?" colors={colors}>
                <TextInput
                    style={[s.input, { height: 90 }]}
                    multiline
                    value={form.thesis}
                    onChangeText={(v) => set('thesis', v)}
                    placeholder="Why this trade, right now, at this price?"
                    placeholderTextColor={colors.textMuted}
                    textAlignVertical="top"
                />
            </Field>
            <Field label={`Conviction: ${form.conviction_level}/5`} colors={colors}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {CONVICTION_LEVELS_LIST.map((n) => (
                        <TouchableOpacity
                            key={n}
                            style={[s.chip, form.conviction_level === n && s.chipActive]}
                            onPress={() => set('conviction_level', n)}
                        >
                            <Text style={[s.chipText, form.conviction_level === n && s.chipTextActive]}>
                                {n}{'⭐'.repeat(n)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Field>
        </>
    );
}

// ─── Step 4: Psychology ───────────────────────────────────────────────────────
function Step4({ form, set, colors }: any) {
    return (
        <Field label="Pre-Trade Emotion" colors={colors}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {EMOTIONS.map((e) => (
                    <TouchableOpacity
                        key={e.value}
                        style={{
                            paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16,
                            backgroundColor: form.emotion_pre_trade === e.value ? colors.primary : colors.surface,
                            borderWidth: 1, borderColor: form.emotion_pre_trade === e.value ? colors.primary : colors.border,
                            alignItems: 'center',
                        }}
                        onPress={() => set('emotion_pre_trade', e.value)}
                    >
                        <Text style={{ fontSize: 22 }}>{e.emoji}</Text>
                        <Text style={{ color: form.emotion_pre_trade === e.value ? '#fff' : colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                            {e.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </Field>
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function Field({ label, colors, children }: any) {
    return (
        <View style={{ marginBottom: 18 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8 }}>{label}</Text>
            {children}
        </View>
    );
}

function ChipGroup({ options, value, onChange, colors }: any) {
    const s = fieldStyles(colors);
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}>
                {options.map((o: any) => (
                    <TouchableOpacity
                        key={o.value}
                        style={[s.chip, value === o.value && s.chipActive]}
                        onPress={() => onChange(o.value)}
                    >
                        <Text style={[s.chipText, value === o.value && s.chipTextActive]}>{o.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = (c: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
    cancel: { color: c.textMuted, fontSize: 16 },
    title: { color: c.text, fontSize: 18, fontWeight: '700' },
    save: { color: c.primary, fontSize: 16, fontWeight: '700', width: 50, textAlign: 'right' },
    stepBar: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.border, marginBottom: 4, backgroundColor: c.surface },
    stepItem: { alignItems: 'center', gap: 4 },
    stepDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: c.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
    stepNum: { color: c.textMuted, fontSize: 13, fontWeight: '700' },
    stepLabel: { color: c.textMuted, fontSize: 10, fontWeight: '600' },
    bottomNav: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: c.border },
    backBtn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: c.border },
    backBtnText: { color: c.textSecondary, fontSize: 15, fontWeight: '600' },
    nextBtn: { flex: 1, backgroundColor: c.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    saveBtn: { flex: 1, backgroundColor: c.green, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

const fieldStyles = (c: any) => StyleSheet.create({
    input: { backgroundColor: c.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: c.text, fontSize: 15, borderWidth: 1, borderColor: c.border },
    chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    chipActive: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.textSecondary, fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: '#fff' },
    dirBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center' },
    dirBtnText: { color: c.textSecondary, fontSize: 16, fontWeight: '700' },
});
