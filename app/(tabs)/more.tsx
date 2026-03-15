import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function MoreScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const s = styles(colors);

    const menuItems = [
        { icon: '📜', label: 'Trading Rules', sub: 'Manage your personal rules', onPress: () => router.push('/rules') },
        { icon: '⚙️', label: 'Settings', sub: 'Capital, currency, defaults', onPress: () => router.push('/settings') },
    ];

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <View style={s.header}>
                <Text style={s.title}>More</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
                {menuItems.map((item) => (
                    <TouchableOpacity key={item.label} style={s.menuCard} onPress={item.onPress}>
                        <Text style={s.menuIcon}>{item.icon}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={s.menuLabel}>{item.label}</Text>
                            <Text style={s.menuSub}>{item.sub}</Text>
                        </View>
                        <Text style={s.menuArrow}>›</Text>
                    </TouchableOpacity>
                ))}

                <View style={s.section}>
                    <Text style={s.sectionTitle}>About TradeLog</Text>
                    <Text style={s.sectionText}>
                        A personal trading journal designed for Indian equity and F&O traders.{'\n'}
                        Every field powers an insight.
                    </Text>
                    <Text style={s.version}>v1.0.0 · Local SQLite · No external API</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = (c: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
    title: { color: c.text, fontSize: 24, fontWeight: '800' },
    menuCard: {
        backgroundColor: c.surface, borderRadius: 16, padding: 16, flexDirection: 'row',
        alignItems: 'center', gap: 14, borderWidth: 1, borderColor: c.border,
    },
    menuIcon: { fontSize: 24 },
    menuLabel: { color: c.text, fontSize: 16, fontWeight: '700' },
    menuSub: { color: c.textMuted, fontSize: 13, marginTop: 2 },
    menuArrow: { color: c.textMuted, fontSize: 22 },
    section: { marginTop: 16, backgroundColor: c.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: c.border },
    sectionTitle: { color: c.text, fontSize: 15, fontWeight: '700', marginBottom: 8 },
    sectionText: { color: c.textSecondary, fontSize: 13, lineHeight: 20 },
    version: { color: c.textMuted, fontSize: 12, marginTop: 8 },
});
