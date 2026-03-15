import { MARKETS } from '@/constants/enums';
import db from '@/db';
import { dailyJournal, settings, trades } from '@/db/schema';
import { useTheme } from '@/hooks/useTheme';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

function getSetting(key: string, fallback: string): string {
    const row = db.select().from(settings).where(eq(settings.key, key)).get();
    return row?.value ?? fallback;
}

function setSetting(key: string, value: string) {
    const existing = db.select().from(settings).where(eq(settings.key, key)).get();
    if (existing) {
        db.update(settings).set({ value }).where(eq(settings.key, key)).run();
    } else {
        db.insert(settings).values({ key, value }).run();
    }
}

export default function SettingsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const s = styles(colors);

    const [capital, setCapital] = useState(() => getSetting('starting_capital', '1000000'));
    const [defaultMarket, setDefaultMarket] = useState(() => getSetting('default_market', 'indian_equity'));
    const [risk, setRisk] = useState(() => getSetting('risk_per_trade', '2'));
    const [saved, setSaved] = useState(false);

    const saveAll = () => {
        setSetting('starting_capital', capital);
        setSetting('default_market', defaultMarket);
        setSetting('risk_per_trade', risk);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const stats = useMemo(() => {
        const tradeCount = db.select().from(trades).all().length;
        const journalCount = db.select().from(dailyJournal).all().length;
        return { tradeCount, journalCount };
    }, []);

    const confirmReset = () => {
        Alert.alert(
            'Reset All Data',
            'This will permanently delete all trades, journal entries, and settings. Cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset All', style: 'destructive', onPress: () => {
                        db.delete(trades).run();
                        db.delete(dailyJournal).run();
                        db.delete(settings).run();
                        router.replace('/');
                    }
                },
            ]
        );
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Back</Text></TouchableOpacity>
                <Text style={s.title}>Settings</Text>
                <TouchableOpacity onPress={saveAll}>
                    <Text style={[s.save, saved && { color: colors.green }]}>{saved ? '✓ Saved!' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60, gap: 20 }}>
                {/* Capital */}
                <SectionCard title="Capital" colors={colors}>
                    <View style={s.field}>
                        <Text style={s.label}>Starting Capital (₹)</Text>
                        <TextInput
                            style={s.input}
                            value={capital}
                            onChangeText={setCapital}
                            keyboardType="number-pad"
                            placeholder="1000000"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                    <View style={s.field}>
                        <Text style={s.label}>Risk Per Trade (%)</Text>
                        <TextInput
                            style={s.input}
                            value={risk}
                            onChangeText={setRisk}
                            keyboardType="decimal-pad"
                            placeholder="2"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                </SectionCard>

                {/* Defaults */}
                <SectionCard title="Defaults" colors={colors}>
                    <Text style={s.label}>Default Market</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        {MARKETS.map((m) => (
                            <TouchableOpacity
                                key={m.value}
                                style={[s.chip, defaultMarket === m.value && s.chipActive]}
                                onPress={() => setDefaultMarket(m.value)}
                            >
                                <Text style={[s.chipText, defaultMarket === m.value && s.chipTextActive]}>{m.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </SectionCard>

                {/* Data Stats */}
                <SectionCard title="Data" colors={colors}>
                    <View style={s.statRow}>
                        <Text style={s.statLabel}>Total Trades</Text>
                        <Text style={s.statValue}>{stats.tradeCount}</Text>
                    </View>
                    <View style={s.statRow}>
                        <Text style={s.statLabel}>Journal Entries</Text>
                        <Text style={s.statValue}>{stats.journalCount}</Text>
                    </View>
                    <View style={s.statRow}>
                        <Text style={s.statLabel}>Database</Text>
                        <Text style={s.statValue}>tradeLog.db (local)</Text>
                    </View>
                </SectionCard>

                {/* Danger Zone */}
                <SectionCard title="⚠ Danger Zone" colors={colors}>
                    <Text style={[s.label, { color: colors.red, marginBottom: 12 }]}>
                        Reset will permanently delete all your data.
                    </Text>
                    <TouchableOpacity style={s.resetBtn} onPress={confirmReset}>
                        <Text style={s.resetBtnText}>Reset All Data</Text>
                    </TouchableOpacity>
                </SectionCard>

                {/* About */}
                <View style={s.about}>
                    <Text style={s.aboutText}>TradeLog · v1.0.0</Text>
                    <Text style={s.aboutSub}>Local-first · No external APIs · SQLite</Text>
                    <Text style={s.aboutSub}>Built for Indian equity & F&O traders</Text>
                </View>
            </ScrollView>
        </View>
    );
}

function SectionCard({ title, colors, children }: any) {
    return (
        <View>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>{title}</Text>
            <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                {children}
            </View>
        </View>
    );
}

const styles = (c: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
    back: { color: c.primary, fontSize: 16, fontWeight: '600' },
    title: { color: c.text, fontSize: 20, fontWeight: '800' },
    save: { color: c.primary, fontSize: 16, fontWeight: '700' },
    field: { marginBottom: 14 },
    label: { color: c.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 6 },
    input: { backgroundColor: c.background, borderRadius: 10, padding: 12, color: c.text, fontSize: 14, borderWidth: 1, borderColor: c.border },
    chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: c.background, borderWidth: 1, borderColor: c.border },
    chipActive: { backgroundColor: c.primary, borderColor: c.primary },
    chipText: { color: c.textSecondary, fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: '#fff' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border },
    statLabel: { color: c.textSecondary, fontSize: 14 },
    statValue: { color: c.text, fontSize: 14, fontWeight: '600' },
    resetBtn: { backgroundColor: c.redBg, borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: c.red },
    resetBtnText: { color: c.red, fontSize: 15, fontWeight: '700' },
    about: { alignItems: 'center', paddingTop: 8 },
    aboutText: { color: c.textMuted, fontSize: 13, fontWeight: '700' },
    aboutSub: { color: c.textMuted, fontSize: 12, marginTop: 3 },
});
