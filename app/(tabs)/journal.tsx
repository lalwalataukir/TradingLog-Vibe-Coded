import { MARKET_BIASES } from '@/constants/enums';
import db from '@/db';
import { dailyJournal } from '@/db/schema';
import { useTheme } from '@/hooks/useTheme';
import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { between, eq } from 'drizzle-orm';
import React, { useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export default function JournalScreen() {
    const { colors } = useTheme();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [showForm, setShowForm] = useState(false);
    const s = styles(colors);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Load journal entries for this month
    const entries = useMemo(() => {
        try {
            return db.select().from(dailyJournal)
                .where(between(dailyJournal.date, format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')))
                .all();
        } catch { return []; }
    }, [format(currentMonth, 'yyyy-MM')]);

    const entryMap = useMemo(() => {
        const m: Record<string, typeof entries[0]> = {};
        for (const e of entries) m[e.date] = e;
        return m;
    }, [entries]);

    const selectedDateStr = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
    const selectedEntry = selectedDateStr ? entryMap[selectedDateStr] : null;

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <View style={s.header}>
                <Text style={s.title}>Journal</Text>
            </View>

            {/* Month Navigation */}
            <View style={s.monthNav}>
                <TouchableOpacity onPress={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))}>
                    <Text style={s.navArrow}>← </Text>
                </TouchableOpacity>
                <Text style={s.monthLabel}>{format(currentMonth, 'MMMM yyyy')}</Text>
                <TouchableOpacity onPress={() => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))}>
                    <Text style={s.navArrow}> →</Text>
                </TouchableOpacity>
            </View>

            {/* Day labels */}
            <View style={s.dayLabels}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <Text key={d} style={s.dayLabel}>{d}</Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={s.grid}>
                {/* Empty cells before first day */}
                {Array.from({ length: days[0].getDay() }).map((_, i) => (
                    <View key={`e-${i}`} style={s.dayCell} />
                ))}
                {days.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const entry = entryMap[dateStr];
                    const pnl = entry?.daily_pnl ?? null;
                    const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                    const isToday = isSameDay(day, new Date());

                    return (
                        <TouchableOpacity
                            key={dateStr}
                            style={[s.dayCell, isSelected && { borderColor: colors.primary, borderWidth: 2 }]}
                            onPress={() => setSelectedDay(day)}
                        >
                            <View style={[
                                s.dayInner,
                                isToday && { backgroundColor: colors.primary + '33' },
                                entry && { backgroundColor: pnl != null ? (pnl >= 0 ? colors.greenBg : colors.redBg) : colors.surfaceElevated },
                            ]}>
                                <Text style={[s.dayNum, isToday && { color: colors.primary, fontWeight: '800' }]}>
                                    {day.getDate()}
                                </Text>
                                {pnl != null && (
                                    <Text style={[s.dayPnl, { color: pnl >= 0 ? colors.green : colors.red }]} numberOfLines={1}>
                                        {pnl >= 0 ? '+' : ''}
                                        {(pnl / 1000).toFixed(1)}k
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Selected Day Panel */}
            {selectedDay && (
                <View style={s.dayPanel}>
                    <View style={s.dayPanelHeader}>
                        <Text style={s.dayPanelDate}>{format(selectedDay, 'EEEE, d MMMM yyyy')}</Text>
                        <TouchableOpacity style={s.editBtn} onPress={() => setShowForm(true)}>
                            <Text style={s.editBtnText}>{selectedEntry ? 'Edit' : '+ Add Entry'}</Text>
                        </TouchableOpacity>
                    </View>
                    {selectedEntry ? (
                        <ScrollView style={{ maxHeight: 220 }}>
                            {selectedEntry.mood_score != null && (
                                <Text style={s.entryLine}>Mood: {'😊'.repeat(selectedEntry.mood_score)}  Sleep: {selectedEntry.sleep_hours}h</Text>
                            )}
                            {selectedEntry.market_bias && (
                                <Text style={s.entryLine}>Bias: {MARKET_BIASES.find((b) => b.value === selectedEntry.market_bias)?.emoji} {selectedEntry.market_bias}</Text>
                            )}
                            {selectedEntry.pre_market_plan && (
                                <Text style={s.entryLabel}>Pre-Market Plan</Text>
                            )}
                            {selectedEntry.pre_market_plan && (
                                <Text style={s.entryText}>{selectedEntry.pre_market_plan}</Text>
                            )}
                            {selectedEntry.post_market_notes && (
                                <Text style={s.entryLabel}>Post-Market Notes</Text>
                            )}
                            {selectedEntry.post_market_notes && (
                                <Text style={s.entryText}>{selectedEntry.post_market_notes}</Text>
                            )}
                            {selectedEntry.biggest_mistake && (
                                <Text style={[s.entryText, { color: colors.red }]}>⚠ {selectedEntry.biggest_mistake}</Text>
                            )}
                        </ScrollView>
                    ) : (
                        <Text style={s.noEntry}>No entry for this day. Tap Add Entry to create one.</Text>
                    )}
                </View>
            )}

            <JournalForm
                colors={colors}
                visible={showForm}
                date={selectedDay ? format(selectedDay, 'yyyy-MM-dd') : ''}
                existing={selectedEntry ?? null}
                onClose={() => setShowForm(false)}
                onSaved={() => { setShowForm(false); }}
            />
        </View>
    );
}

function JournalForm({ colors, visible, date, existing, onClose, onSaved }: any) {
    const [plan, setPlan] = useState(existing?.pre_market_plan ?? '');
    const [bias, setBias] = useState(existing?.market_bias ?? 'neutral');
    const [mood, setMood] = useState(existing?.mood_score ?? 3);
    const [sleep, setSleep] = useState(existing?.sleep_hours?.toString() ?? '7');
    const [exercise, setExercise] = useState(existing?.exercise_today ?? false);
    const [postNotes, setPostNotes] = useState(existing?.post_market_notes ?? '');
    const [mistake, setMistake] = useState(existing?.biggest_mistake ?? '');

    const save = () => {
        try {
            const data = {
                pre_market_plan: plan || null,
                market_bias: bias,
                mood_score: mood,
                sleep_hours: parseFloat(sleep) || 7,
                exercise_today: exercise,
                post_market_notes: postNotes || null,
                biggest_mistake: mistake || null,
                date,
            };
            if (existing) {
                db.update(dailyJournal).set(data).where(eq(dailyJournal.id, existing.id)).run();
            } else {
                db.insert(dailyJournal).values({ id: uuidv4(), ...data }).run();
            }
            onSaved();
        } catch (e) {
            console.error('Save journal error:', e);
        }
    };

    const s = formStyles(colors);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={s.container}>
                <View style={s.header}>
                    <TouchableOpacity onPress={onClose}><Text style={s.cancel}>Cancel</Text></TouchableOpacity>
                    <Text style={s.title}>Journal — {date}</Text>
                    <TouchableOpacity onPress={save}><Text style={s.save}>Save</Text></TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
                    {/* Market Bias */}
                    <View>
                        <Text style={s.label}>Market Bias</Text>
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            {MARKET_BIASES.map((b) => (
                                <TouchableOpacity
                                    key={b.value}
                                    style={[s.chip, bias === b.value && s.chipActive]}
                                    onPress={() => setBias(b.value)}
                                >
                                    <Text style={[s.chipText, bias === b.value && s.chipTextActive]}>
                                        {b.emoji} {b.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Mood */}
                    <View>
                        <Text style={s.label}>Mood Score: {mood}/5</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <TouchableOpacity
                                    key={n}
                                    style={[s.chip, mood === n && s.chipActive]}
                                    onPress={() => setMood(n)}
                                >
                                    <Text style={[s.chipText, mood === n && s.chipTextActive]}>{n}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Sleep + Exercise */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={s.label}>Sleep Hours</Text>
                            <TextInput
                                style={s.input}
                                value={sleep}
                                onChangeText={setSleep}
                                keyboardType="decimal-pad"
                                placeholder="7.5"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                        <View style={{ flex: 1, alignItems: 'flex-start' }}>
                            <Text style={s.label}>Exercise?</Text>
                            <Switch
                                value={exercise}
                                onValueChange={setExercise}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>

                    {/* Pre-market plan */}
                    <View>
                        <Text style={s.label}>Pre-Market Plan</Text>
                        <TextInput
                            style={[s.input, { height: 80 }]}
                            multiline
                            value={plan}
                            onChangeText={setPlan}
                            placeholder="What setups are you watching? Key levels?"
                            placeholderTextColor={colors.textMuted}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Post-market notes */}
                    <View>
                        <Text style={s.label}>Post-Market Reflection</Text>
                        <TextInput
                            style={[s.input, { height: 80 }]}
                            multiline
                            value={postNotes}
                            onChangeText={setPostNotes}
                            placeholder="How did trading go today?"
                            placeholderTextColor={colors.textMuted}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Biggest mistake */}
                    <View>
                        <Text style={s.label}>Biggest Mistake Today</Text>
                        <TextInput
                            style={s.input}
                            value={mistake}
                            onChangeText={setMistake}
                            placeholder="One sentence..."
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = (c: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
    title: { color: c.text, fontSize: 24, fontWeight: '800' },
    monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
    navArrow: { color: c.primary, fontSize: 20, paddingHorizontal: 16, fontWeight: '700' },
    monthLabel: { color: c.text, fontSize: 17, fontWeight: '700' },
    dayLabels: { flexDirection: 'row', paddingHorizontal: 8 },
    dayLabel: { flex: 1, textAlign: 'center', color: c.textMuted, fontSize: 11, fontWeight: '600', paddingBottom: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 },
    dayCell: { width: '14.28%', aspectRatio: 1, padding: 2 },
    dayInner: { flex: 1, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    dayNum: { color: '#ccc', fontSize: 13, fontWeight: '500' },
    dayPnl: { fontSize: 9, fontWeight: '700', marginTop: 1 },
    dayPanel: {
        marginHorizontal: 16, marginTop: 12,
        backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border,
    },
    dayPanelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    dayPanelDate: { color: c.text, fontSize: 14, fontWeight: '700' },
    editBtn: { backgroundColor: c.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
    editBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    entryLine: { color: c.textSecondary, fontSize: 13, marginBottom: 6 },
    entryLabel: { color: c.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 8, marginBottom: 4 },
    entryText: { color: c.textSecondary, fontSize: 13, lineHeight: 19 },
    noEntry: { color: c.textMuted, fontSize: 13, fontStyle: 'italic' },
});

const formStyles = (c: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: c.border },
    title: { color: c.text, fontSize: 16, fontWeight: '700' },
    cancel: { color: c.textMuted, fontSize: 16 },
    save: { color: c.primary, fontSize: 16, fontWeight: '700' },
    label: { color: c.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8 },
    input: { backgroundColor: c.surface, borderRadius: 12, padding: 12, color: c.text, fontSize: 14, borderWidth: 1, borderColor: c.border },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    chipActive: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.textSecondary, fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: '#fff' },
});
