import { DIRECTIONS, MARKETS, SETUP_TYPES } from '@/constants/enums';
import { useTheme } from '@/hooks/useTheme';
import { useTrades } from '@/hooks/useTrades';
import { formatCurrency, formatPct } from '@/lib/calculations';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type Filters = {
    status?: 'open' | 'closed';
    market?: string;
    direction?: string;
    setup_type?: string;
    pnl_filter?: 'winners' | 'losers' | 'all';
    symbol?: string;
};

export default function TradesScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [filters, setFilters] = useState<Filters>({});
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { trades, refetch } = useTrades({ ...filters, symbol: searchText || undefined });
    const s = styles(colors);

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            {/* Header */}
            <View style={s.header}>
                <Text style={s.title}>Trade Log</Text>
                <TouchableOpacity
                    style={s.logBtn}
                    onPress={() => router.push('/trades/new')}
                >
                    <Text style={s.logBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {/* Search & Filter */}
            <View style={s.searchRow}>
                <TextInput
                    style={s.searchInput}
                    placeholder="Search symbol..."
                    placeholderTextColor={colors.textMuted}
                    value={searchText}
                    onChangeText={setSearchText}
                />
                <TouchableOpacity
                    style={[s.filterBtn, activeFilterCount > 0 && { backgroundColor: colors.primary }]}
                    onPress={() => setShowFilters(true)}
                >
                    <Text style={[s.filterBtnText, activeFilterCount > 0 && { color: '#fff' }]}>
                        {activeFilterCount > 0 ? `Filters (${activeFilterCount})` : '⚙ Filter'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Summary strip */}
            <View style={s.summaryStrip}>
                <Text style={s.summaryText}>{trades.length} trades</Text>
                {trades.length > 0 && (
                    <>
                        <Text style={s.summaryDot}>·</Text>
                        <Text
                            style={[
                                s.summaryPnl,
                                {
                                    color:
                                        trades.reduce((s, t) => s + (t.pnl_net ?? 0), 0) >= 0
                                            ? colors.green
                                            : colors.red,
                                },
                            ]}
                        >
                            {formatCurrency(trades.reduce((s, t) => s + (t.pnl_net ?? 0), 0))}
                        </Text>
                    </>
                )}
            </View>

            <FlatList
                data={trades}
                keyExtractor={(t) => t.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                renderItem={({ item: trade }) => (
                    <TouchableOpacity
                        style={s.tradeCard}
                        onPress={() => router.push(`/trades/${trade.id}`)}
                    >
                        <View style={s.tradeCardLeft}>
                            <View style={s.tradeSymbolRow}>
                                <Text style={s.tradeSymbol}>{trade.symbol}</Text>
                                <View
                                    style={[
                                        s.dirBadge,
                                        { backgroundColor: trade.direction === 'long' ? colors.greenBg : colors.redBg },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            s.dirText,
                                            { color: trade.direction === 'long' ? colors.green : colors.red },
                                        ]}
                                    >
                                        {trade.direction === 'long' ? '↑ Long' : '↓ Short'}
                                    </Text>
                                </View>
                                {trade.status === 'open' && (
                                    <View style={s.openBadge}>
                                        <Text style={s.openBadgeText}>OPEN</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={s.tradeMeta}>
                                {format(new Date(trade.entry_date), 'd MMM yy')}
                                {trade.exit_date
                                    ? ` → ${format(new Date(trade.exit_date), 'd MMM yy')}`
                                    : ''}
                                {trade.setup_type ? `  ·  ${trade.setup_type.replace(/_/g, ' ')}` : ''}
                            </Text>
                            <Text style={s.tradeEntry}>
                                Entry: {trade.market === 'us_equity' ? '$' : '₹'}
                                {trade.entry_price.toFixed(2)} × {trade.quantity}
                            </Text>
                        </View>
                        <View style={s.tradeCardRight}>
                            {trade.pnl_net != null ? (
                                <>
                                    <Text
                                        style={[
                                            s.tradePnl,
                                            { color: trade.pnl_net >= 0 ? colors.green : colors.red },
                                        ]}
                                    >
                                        {formatCurrency(trade.pnl_net, trade.market)}
                                    </Text>
                                    {trade.pnl_percentage != null && (
                                        <Text
                                            style={[
                                                s.tradePct,
                                                { color: trade.pnl_net >= 0 ? colors.green : colors.red },
                                            ]}
                                        >
                                            {formatPct(trade.pnl_percentage)}
                                        </Text>
                                    )}
                                </>
                            ) : (
                                <Text style={s.openPnl}>Open</Text>
                            )}
                            {trade.rating != null && (
                                <Text style={s.stars}>{'⭐'.repeat(trade.rating)}</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={s.empty}>
                        <Text style={s.emptyEmoji}>📋</Text>
                        <Text style={s.emptyTitle}>No trades found</Text>
                        <Text style={s.emptySub}>
                            {activeFilterCount > 0 ? 'Try clearing filters.' : 'Log your first trade!'}
                        </Text>
                    </View>
                }
            />

            {/* Filter Modal */}
            <FilterModal
                colors={colors}
                visible={showFilters}
                filters={filters}
                onApply={(f: Filters) => {
                    setFilters(f);
                    setShowFilters(false);
                }}
                onClose={() => setShowFilters(false)}
            />
        </View>
    );
}

function FilterModal({ colors, visible, filters, onApply, onClose }: any) {
    const [local, setLocal] = useState<Filters>(filters);
    const s = modalStyles(colors);

    const ChipRow = ({
        label,
        field,
        options,
    }: {
        label: string;
        field: keyof Filters;
        options: { value: string; label: string }[];
    }) => (
        <View style={s.filterGroup}>
            <Text style={s.filterLabel}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                    <TouchableOpacity
                        style={[s.chip, !local[field] && s.chipActive]}
                        onPress={() => setLocal((l) => ({ ...l, [field]: undefined }))}
                    >
                        <Text style={[s.chipText, !local[field] && s.chipTextActive]}>All</Text>
                    </TouchableOpacity>
                    {options.map((o) => (
                        <TouchableOpacity
                            key={o.value}
                            style={[s.chip, local[field] === o.value && s.chipActive]}
                            onPress={() => setLocal((l) => ({ ...l, [field]: o.value }))}
                        >
                            <Text style={[s.chipText, local[field] === o.value && s.chipTextActive]}>
                                {o.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={s.container}>
                <View style={s.header}>
                    <Text style={s.title}>Filters</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={s.close}>✕</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={{ flex: 1 }}>
                    <ChipRow label="Status" field="status" options={[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]} />
                    <ChipRow label="Direction" field="direction" options={DIRECTIONS.map((d) => ({ value: d.value, label: d.label }))} />
                    <ChipRow label="Market" field="market" options={MARKETS.map((m) => ({ value: m.value, label: m.label }))} />
                    <ChipRow label="Setup" field="setup_type" options={SETUP_TYPES.map((s) => ({ value: s.value, label: s.label }))} />
                    <ChipRow label="P&L" field="pnl_filter" options={[{ value: 'winners', label: 'Winners' }, { value: 'losers', label: 'Losers' }]} />
                </ScrollView>
                <View style={s.actions}>
                    <TouchableOpacity style={s.clearBtn} onPress={() => setLocal({})}>
                        <Text style={s.clearBtnText}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.applyBtn} onPress={() => onApply(local)}>
                        <Text style={s.applyBtnText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
    title: { color: colors.text, fontSize: 24, fontWeight: '800' },
    logBtn: { backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
    logBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    searchRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
    searchInput: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border },
    filterBtn: { backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
    filterBtnText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    summaryStrip: { flexDirection: 'row', paddingHorizontal: 20, gap: 6, alignItems: 'center', marginBottom: 12 },
    summaryText: { color: colors.textMuted, fontSize: 13 },
    summaryDot: { color: colors.textMuted, fontSize: 13 },
    summaryPnl: { fontSize: 13, fontWeight: '700' },
    tradeCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border },
    tradeCardLeft: { flex: 1, marginRight: 12 },
    tradeCardRight: { alignItems: 'flex-end', justifyContent: 'center' },
    tradeSymbolRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    tradeSymbol: { color: colors.text, fontSize: 16, fontWeight: '700' },
    dirBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    dirText: { fontSize: 11, fontWeight: '700' },
    openBadge: { backgroundColor: colors.primaryLight + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
    openBadgeText: { color: colors.primaryLight, fontSize: 10, fontWeight: '700' },
    tradeMeta: { color: colors.textMuted, fontSize: 12, textTransform: 'capitalize', marginBottom: 2 },
    tradeEntry: { color: colors.textSecondary, fontSize: 12 },
    tradePnl: { fontSize: 16, fontWeight: '800' },
    tradePct: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    openPnl: { color: colors.textMuted, fontSize: 14 },
    stars: { fontSize: 10, marginTop: 4 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyEmoji: { fontSize: 48, marginBottom: 12 },
    emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
    emptySub: { color: colors.textMuted, fontSize: 14, marginTop: 6 },
});

const modalStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    title: { color: colors.text, fontSize: 20, fontWeight: '700' },
    close: { color: colors.textMuted, fontSize: 20 },
    filterGroup: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    filterLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    chipTextActive: { color: '#fff' },
    actions: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: colors.border },
    clearBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    clearBtnText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
    applyBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    applyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
