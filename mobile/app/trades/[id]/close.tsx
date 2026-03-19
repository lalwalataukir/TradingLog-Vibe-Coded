import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/layout/screen';
import { AppCard } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { PrimaryButton } from '@/components/ui/primary-button';
import { calculatePnlNet, calculatePnlPercentage } from '@/lib/calculations';
import { formatCurrency, formatPercentage } from '@/lib/format';
import type { Emotion, MistakeTag } from '@/lib/types';
import { colors, radii, spacing } from '@/lib/theme';
import { validateTradeCloseInput } from '@/lib/validation';
import { useAppData } from '@/providers/app-data-provider';

const emotions: Emotion[] = ['calm', 'confident', 'neutral', 'anxious', 'fomo', 'greedy', 'fearful'];
const availableMistakes: MistakeTag[] = ['entered_too_early', 'moved_stop_loss', 'exited_too_early', 'held_too_long', 'oversized', 'revenge_trade'];

export default function CloseTradeRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { closeTradeById, getTrade, isReady } = useAppData();
  const trade = id ? getTrade(id) : null;
  const [exitPrice, setExitPrice] = useState(String(trade?.exitPrice ?? (trade ? trade.entryPrice + 42 : 0)));
  const [exitFees, setExitFees] = useState(String(trade?.exitFees ?? 145));
  const [followedPlan, setFollowedPlan] = useState(true);
  const [emotionDuringTrade, setEmotionDuringTrade] = useState<Emotion>('confident');
  const [emotionPostTrade, setEmotionPostTrade] = useState<Emotion>('calm');
  const [mistakeTags, setMistakeTags] = useState<MistakeTag[]>([]);
  const [planDeviationNotes, setPlanDeviationNotes] = useState('');
  const [lessonLearned, setLessonLearned] = useState('Stayed patient and let the setup develop.');
  const [rating, setRating] = useState('4');

  const livePnl = useMemo(() => {
    if (!trade) {
      return { percentage: 0, pnlNet: 0 };
    }

    const pnlNet = calculatePnlNet(
      trade.entryPrice,
      Number(exitPrice || 0),
      trade.quantity,
      trade.direction,
      trade.entryFees,
      Number(exitFees || 0)
    );

    return {
      percentage: calculatePnlPercentage(trade.entryPrice, trade.quantity, pnlNet),
      pnlNet,
    };
  }, [exitFees, exitPrice, trade]);

  if (!isReady || !trade) {
    return (
      <AppScreen>
        <ActivityIndicator color={colors.primary} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppCard style={styles.heroCard}>
        <Text style={styles.title}>{trade.symbol}</Text>
        <Text style={styles.subtext}>
          Entry {formatCurrency(trade.entryPrice)} · Qty {trade.quantity}
        </Text>
        <Text style={[styles.pnl, livePnl.pnlNet >= 0 ? styles.pnlProfit : styles.pnlLoss]}>{formatCurrency(livePnl.pnlNet)}</Text>
        <Text style={styles.percent}>{formatPercentage(livePnl.percentage)}</Text>
      </AppCard>

      <View style={styles.stack}>
        <Field label="Exit Price" onChangeText={setExitPrice} value={exitPrice} />
        <Field label="Exit Fees" onChangeText={setExitFees} value={exitFees} />

        <Section title="Emotion During Trade">
          <View style={styles.chipRow}>
            {emotions.map((emotion) => (
              <Chip key={emotion} label={emotion} onPress={() => setEmotionDuringTrade(emotion)} selected={emotionDuringTrade === emotion} />
            ))}
          </View>
        </Section>

        <Section title="Emotion Post Trade">
          <View style={styles.chipRow}>
            {emotions.map((emotion) => (
              <Chip key={emotion} label={emotion} onPress={() => setEmotionPostTrade(emotion)} selected={emotionPostTrade === emotion} />
            ))}
          </View>
        </Section>

        <Section title="Followed Plan?">
          <View style={styles.chipRow}>
            <Chip label="Yes" onPress={() => setFollowedPlan(true)} selected={followedPlan} />
            <Chip label="No" onPress={() => setFollowedPlan(false)} selected={!followedPlan} />
          </View>
        </Section>

        {!followedPlan ? (
          <Section title="Deviation Notes">
            <TextInput
              multiline
              onChangeText={setPlanDeviationNotes}
              placeholder="What deviated from the plan?"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textarea]}
              value={planDeviationNotes}
            />
          </Section>
        ) : null}

        <Section title="Mistake Tags">
          <View style={styles.chipRow}>
            {availableMistakes.map((tag) => {
              const selected = mistakeTags.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={tag.replace(/_/g, ' ')}
                  onPress={() =>
                    setMistakeTags((current) => (selected ? current.filter((item) => item !== tag) : [...current, tag]))
                  }
                  selected={selected}
                />
              );
            })}
          </View>
        </Section>

        <Section title="Lesson Learned">
          <TextInput multiline onChangeText={setLessonLearned} style={[styles.input, styles.textarea]} value={lessonLearned} />
        </Section>

        <Field label="Process Rating (1-5)" onChangeText={setRating} value={rating} />
      </View>

      <PrimaryButton
        label="Finalize Close"
        onPress={() => {
          const closeInput = {
            emotionDuringTrade,
            emotionPostTrade,
            exitFees: Number(exitFees || 0),
            exitPrice: Number(exitPrice || 0),
            followedPlan,
            planDeviationNotes: followedPlan ? null : planDeviationNotes,
            lessonLearned,
            mistakeTags,
            rating: Number(rating || 0),
          };
          const errors = validateTradeCloseInput(closeInput, trade);
          if (errors.length > 0) {
            Alert.alert('Invalid Close', errors[0]);
            return;
          }

          try {
            closeTradeById(trade.id, closeInput);
            router.replace(`/trades/${trade.id}`);
          } catch (error) {
            Alert.alert('Unable to Close Trade', error instanceof Error ? error.message : 'Unknown error');
          }
        }}
      />
    </AppScreen>
  );
}

function Field({
  label,
  onChangeText,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput keyboardType="decimal-pad" onChangeText={onChangeText} style={styles.input} value={value} />
    </View>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <AppCard style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  heroCard: {
    gap: 6,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  percent: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  pnl: {
    fontSize: 28,
    fontWeight: '800',
  },
  pnlLoss: {
    color: colors.loss,
  },
  pnlProfit: {
    color: colors.profit,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: '800',
  },
  stack: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  subtext: {
    color: colors.muted,
    fontSize: 13,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  title: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: '800',
  },
});
