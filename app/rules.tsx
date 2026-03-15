import { RULE_CATEGORIES } from '@/constants/enums';
import db from '@/db';
import type { Rule } from '@/db/schema';
import { rules } from '@/db/schema';
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
    View,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';

export default function RulesScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [tick, setTick] = useState(0);
    const [showAdd, setShowAdd] = useState(false);
    const [newText, setNewText] = useState('');
    const [newCategory, setNewCategory] = useState('risk');
    const s = styles(colors);

    const ruleList: Rule[] = useMemo(
        () => db.select().from(rules).orderBy(rules.category).all(),
        [tick]
    );

    const grouped = useMemo(() => {
        const g: Record<string, Rule[]> = {};
        for (const r of ruleList) {
            if (!g[r.category]) g[r.category] = [];
            g[r.category].push(r);
        }
        return g;
    }, [ruleList]);

    const addRule = () => {
        if (!newText.trim()) return;
        db.insert(rules).values({ id: uuidv4(), rule_text: newText.trim(), category: newCategory, is_active: true }).run();
        setNewText('');
        setShowAdd(false);
        setTick((t) => t + 1);
    };

    const toggleActive = (rule: Rule) => {
        db.update(rules).set({ is_active: !rule.is_active }).where(eq(rules.id, rule.id)).run();
        setTick((t) => t + 1);
    };

    const deleteRule = (id: string) => {
        Alert.alert('Delete Rule', 'Remove this rule?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { db.delete(rules).where(eq(rules.id, id)).run(); setTick((t) => t + 1); } },
        ]);
    };

    const catColor: Record<string, string> = {
        risk: colors.red, entry: colors.green, exit: colors.amber,
        psychology: colors.purple, sizing: colors.blue,
    };

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>← Back</Text></TouchableOpacity>
                <Text style={s.title}>Trading Rules</Text>
                <TouchableOpacity onPress={() => setShowAdd((v) => !v)}>
                    <Text style={s.add}>+ Add</Text>
                </TouchableOpacity>
            </View>

            {showAdd && (
                <View style={s.addCard}>
                    <TextInput
                        style={s.addInput}
                        value={newText}
                        onChangeText={setNewText}
                        placeholder="Enter rule text..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 8 }}>
                            {RULE_CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.value}
                                    style={[s.catChip, newCategory === cat.value && { backgroundColor: catColor[cat.value] + '33', borderColor: catColor[cat.value] }]}
                                    onPress={() => setNewCategory(cat.value)}
                                >
                                    <Text style={[s.catChipText, newCategory === cat.value && { color: catColor[cat.value] }]}>{cat.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                    <TouchableOpacity style={s.saveBtn} onPress={addRule}>
                        <Text style={s.saveBtnText}>Save Rule</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {Object.entries(grouped).map(([category, catRules]) => (
                    <View key={category} style={{ marginBottom: 16 }}>
                        <View style={s.catHeader}>
                            <View style={[s.catDot, { backgroundColor: catColor[category] ?? colors.primary }]} />
                            <Text style={s.catTitle}>{category.toUpperCase()}</Text>
                            <Text style={s.catCount}>{catRules.length}</Text>
                        </View>
                        {catRules.map((rule) => (
                            <View key={rule.id} style={[s.ruleCard, !rule.is_active && { opacity: 0.4 }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[s.ruleText, !rule.is_active && { textDecorationLine: 'line-through' }]}>
                                        {rule.rule_text}
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                    <TouchableOpacity onPress={() => toggleActive(rule)}>
                                        <Text style={{ fontSize: 18 }}>{rule.is_active ? '✅' : '⬜'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => deleteRule(rule.id)}>
                                        <Text style={{ fontSize: 16, color: colors.textMuted }}>🗑</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
                {ruleList.length === 0 && (
                    <View style={s.empty}>
                        <Text style={s.emptyEmoji}>📜</Text>
                        <Text style={s.emptyTitle}>No rules yet</Text>
                        <Text style={s.emptySub}>Add trading rules to keep yourself disciplined.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = (c: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
    back: { color: c.primary, fontSize: 16, fontWeight: '600' },
    title: { color: c.text, fontSize: 20, fontWeight: '800' },
    add: { color: c.primary, fontSize: 16, fontWeight: '700' },
    addCard: { marginHorizontal: 16, backgroundColor: c.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: c.border },
    addInput: { backgroundColor: c.background, borderRadius: 10, padding: 12, color: c.text, fontSize: 14, borderWidth: 1, borderColor: c.border, minHeight: 60, textAlignVertical: 'top', marginBottom: 8 },
    catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    catChipText: { color: c.textSecondary, fontSize: 12, fontWeight: '600' },
    saveBtn: { backgroundColor: c.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    catHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    catDot: { width: 8, height: 8, borderRadius: 4 },
    catTitle: { color: c.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    catCount: { color: c.textMuted, fontSize: 11, marginLeft: 'auto' },
    ruleCard: { backgroundColor: c.surface, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, borderWidth: 1, borderColor: c.border },
    ruleText: { color: c.text, fontSize: 14, lineHeight: 20 },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { color: c.text, fontSize: 18, fontWeight: '700' },
    emptySub: { color: c.textMuted, fontSize: 14, marginTop: 6, textAlign: 'center' },
});
