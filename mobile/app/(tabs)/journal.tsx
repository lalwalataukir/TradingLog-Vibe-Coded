import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/layout/screen';
import { AppCard } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { PrimaryButton } from '@/components/ui/primary-button';
import { formatCompactCurrency } from '@/lib/format';
import { colors, radii, spacing } from '@/lib/theme';
import { useAppData } from '@/providers/app-data-provider';

export default function JournalRoute() {
  const { analytics, isReady, journalEntries, saveJournal } = useAppData();
  const latestJournal = journalEntries[0];
  const activeDate = latestJournal?.date ?? new Date().toISOString().slice(0, 10);
  const [preMarketPlan, setPreMarketPlan] = useState(latestJournal?.preMarketPlan ?? '');
  const [postMarketNotes, setPostMarketNotes] = useState(latestJournal?.postMarketNotes ?? '');

  useEffect(() => {
    setPreMarketPlan(latestJournal?.preMarketPlan ?? '');
    setPostMarketNotes(latestJournal?.postMarketNotes ?? '');
  }, [latestJournal?.id, latestJournal?.postMarketNotes, latestJournal?.preMarketPlan]);

  if (!isReady) {
    return (
      <AppScreen>
        <ActivityIndicator color={colors.primary} />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      header={
        <View style={styles.headerRow}>
          <Text style={styles.title}>Daily Journal</Text>
          <Text style={styles.headerLabel}>{activeDate}</Text>
        </View>
      }
    >
      <AppCard style={styles.card}>
        <Text style={styles.cardTitle}>Latest Entry</Text>
        {latestJournal ? (
          <Text style={[styles.cardValue, latestJournal.dailyPnl >= 0 ? styles.profit : styles.loss]}>
            {formatCompactCurrency(latestJournal.dailyPnl)}
          </Text>
        ) : (
          <Text style={styles.emptyCopy}>No journal entry yet. Create your first note for today.</Text>
        )}
        <TextInput multiline onChangeText={setPreMarketPlan} style={[styles.input, styles.textarea]} value={preMarketPlan} />
        <TextInput multiline onChangeText={setPostMarketNotes} style={[styles.input, styles.textarea]} value={postMarketNotes} />
        <PrimaryButton
          label="Save Journal"
          onPress={() =>
            saveJournal(activeDate, {
              postMarketNotes,
              preMarketPlan,
            })
          }
        />
      </AppCard>

      {latestJournal ? (
        <View style={styles.metricRow}>
          <Metric label="Mood" value={`${latestJournal.moodScore}/5`} />
          <Metric label="Sleep" value={`${latestJournal.sleepHours}h`} />
          <Metric label="Trades" value={`${latestJournal.totalTrades}`} />
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Trades That Day</Text>
      <View style={styles.stack}>
        {analytics.todayTrades.map((trade) => (
          <ListRow
            key={trade.id}
            subtitle={`${trade.setupType} · ${trade.status}`}
            title={trade.symbol}
            value={trade.pnlNet === null ? 'Open' : formatCompactCurrency(trade.pnlNet)}
          />
        ))}
      </View>
    </AppScreen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  emptyCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  cardCopy: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  cardTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '800',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loss: {
    color: colors.loss,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
    paddingVertical: 14,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: spacing.md,
  },
  metricValue: {
    color: colors.foreground,
    fontSize: 20,
    fontWeight: '800',
  },
  profit: {
    color: colors.profit,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  stack: {
    gap: spacing.sm,
  },
  textarea: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
  title: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: '800',
  },
});
