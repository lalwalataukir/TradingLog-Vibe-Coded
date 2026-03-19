import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';

import { AppScreen } from '@/components/layout/screen';
import { AppCard } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { PrimaryButton } from '@/components/ui/primary-button';
import { SymbolPickerField } from '@/components/ui/symbol-picker-field';
import { calculatePositionSizePct, calculateRiskRewardPlanned } from '@/lib/calculations';
import { colors, radii, spacing } from '@/lib/theme';
import type { TradeDraft } from '@/lib/types';
import { validateTradeDraft } from '@/lib/validation';
import { useAppData } from '@/providers/app-data-provider';

const steps = ['Instrument', 'Execution', 'Setup', 'Psychology'] as const;

export default function LogTradeRoute() {
  const router = useRouter();
  const { createTradeDraft, settings } = useAppData();
  const [stepIndex, setStepIndex] = useState(0);
  const { control, handleSubmit, setValue, watch } = useForm<TradeDraft>({
    defaultValues: {
      market: settings.defaultMarket,
      symbol: '',
      instrumentType: 'stock',
      direction: 'long',
      entryPrice: 2840,
      quantity: 200,
      entryFees: 143,
      stopLoss: 2790,
      target: 2940,
      setupType: 'breakout',
      timeframe: 'intraday',
      thesis: 'Waiting for confirmation above the opening range with volume support.',
      convictionLevel: 4,
      emotionPreTrade: 'calm',
      confluenceFactors: ['volume_confirmation', 'support_resistance'],
    },
  });

  const entryPrice = Number(watch('entryPrice')) || 0;
  const quantity = Number(watch('quantity')) || 0;
  const stopLoss = Number(watch('stopLoss')) || 0;
  const target = Number(watch('target')) || 0;
  const market = watch('market');
  const rr = calculateRiskRewardPlanned(entryPrice, stopLoss, target);
  const positionSizePct = calculatePositionSizePct(entryPrice, quantity, settings.currentCapital);

  const saveTrade = handleSubmit((values) => {
    const errors = validateTradeDraft(values);
    if (errors.length > 0) {
      Alert.alert('Invalid Trade', errors[0]);
      return;
    }

    try {
      const tradeId = createTradeDraft(values);
      Alert.alert('Trade Logged', `${values.symbol} saved as an open trade.`);
      router.replace(`/trades/${tradeId}`);
    } catch (error) {
      Alert.alert('Unable to Save Trade', error instanceof Error ? error.message : 'Unknown error');
    }
  });

  return (
    <AppScreen
      header={
        <View style={styles.headerRow}>
          <Text style={styles.title}>Log Trade</Text>
          <Text style={styles.headerLabel}>Step {stepIndex + 1} of 4</Text>
        </View>
      }
    >
      <View style={styles.stepRow}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View style={[styles.stepBar, index <= stepIndex ? styles.stepBarActive : undefined]} />
            <Text style={[styles.stepText, index === stepIndex ? styles.stepTextActive : undefined]}>{step}</Text>
          </View>
        ))}
      </View>

      {stepIndex === 0 ? (
        <View style={styles.stack}>
          <FieldLabel label="Market" />
          <View style={styles.chipRow}>
            <Chip label="NSE Equity" onPress={() => setMarket(setValue, 'indian_equity')} selected={market === 'indian_equity'} />
            <Chip label="F&O" onPress={() => setMarket(setValue, 'indian_fo')} selected={market === 'indian_fo'} />
            <Chip label="US Equity" onPress={() => setMarket(setValue, 'us_equity')} selected={market === 'us_equity'} />
          </View>

          <FieldLabel label="Symbol" />
          <Controller
            control={control}
            name="symbol"
            render={({ field: { onChange, value } }) => (
              <SymbolPickerField market={market} onChange={onChange} value={value} />
            )}
          />

          <FieldLabel label="Direction" />
          <View style={styles.chipRow}>
            <Chip label="Long" onPress={() => setValue('direction', 'long')} selected={watch('direction') === 'long'} />
            <Chip label="Short" onPress={() => setValue('direction', 'short')} selected={watch('direction') === 'short'} />
          </View>
        </View>
      ) : null}

      {stepIndex === 1 ? (
        <View style={styles.stack}>
          <Field control={control} keyboardType="decimal-pad" label="Entry Price" name="entryPrice" />
          <Field control={control} keyboardType="number-pad" label="Quantity" name="quantity" />
          <Field control={control} keyboardType="decimal-pad" label="Entry Fees" name="entryFees" />
          <Field control={control} keyboardType="decimal-pad" label="Stop Loss" name="stopLoss" />
          <Field control={control} keyboardType="decimal-pad" label="Target" name="target" />

          <AppCard style={styles.metricCard}>
            <Text style={styles.metricLabel}>Planned R:R</Text>
            <Text style={styles.metricValue}>{rr.toFixed(1)} : 1</Text>
            <Text style={styles.metricFootnote}>Position Size {positionSizePct.toFixed(2)}%</Text>
          </AppCard>
        </View>
      ) : null}

      {stepIndex === 2 ? (
        <View style={styles.stack}>
          <FieldLabel label="Setup Type" />
          <View style={styles.chipRow}>
            <Chip label="Breakout" onPress={() => setValue('setupType', 'breakout')} selected={watch('setupType') === 'breakout'} />
            <Chip label="Pullback" onPress={() => setValue('setupType', 'pullback')} selected={watch('setupType') === 'pullback'} />
            <Chip label="Momentum" onPress={() => setValue('setupType', 'momentum')} selected={watch('setupType') === 'momentum'} />
          </View>

          <FieldLabel label="Timeframe" />
          <View style={styles.chipRow}>
            <Chip label="Intraday" onPress={() => setValue('timeframe', 'intraday')} selected={watch('timeframe') === 'intraday'} />
            <Chip label="Swing" onPress={() => setValue('timeframe', 'swing_2_14d')} selected={watch('timeframe') === 'swing_2_14d'} />
          </View>

          <FieldLabel label="Thesis" />
          <Controller
            control={control}
            name="thesis"
            render={({ field: { onChange, value } }) => (
              <TextInput
                multiline
                onChangeText={onChange}
                placeholder="Why this trade, right now, at this price?"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.textarea]}
                value={value}
              />
            )}
          />
        </View>
      ) : null}

      {stepIndex === 3 ? (
        <View style={styles.stack}>
          <FieldLabel label="Pre-trade emotion" />
          <View style={styles.chipRow}>
            <Chip label="Calm" onPress={() => setValue('emotionPreTrade', 'calm')} selected={watch('emotionPreTrade') === 'calm'} />
            <Chip label="Confident" onPress={() => setValue('emotionPreTrade', 'confident')} selected={watch('emotionPreTrade') === 'confident'} />
            <Chip label="FOMO" onPress={() => setValue('emotionPreTrade', 'fomo')} selected={watch('emotionPreTrade') === 'fomo'} />
          </View>

          <AppCard style={styles.checklistCard}>
            <Text style={styles.checklistTitle}>Pre-trade Rules Check</Text>
            <Text style={styles.checklistCopy}>Risk ≤ {settings.riskPerTradeDefault}% of capital</Text>
            <Text style={styles.checklistCopy}>Stop loss defined before entry</Text>
            <Text style={styles.checklistCopy}>Trade thesis written</Text>
          </AppCard>
        </View>
      ) : null}

      <View style={styles.footerRow}>
        {stepIndex > 0 ? <PrimaryButton label="Back" onPress={() => setStepIndex((current) => current - 1)} /> : <View style={styles.spacer} />}
        <PrimaryButton
          label={stepIndex === steps.length - 1 ? 'Save as Open Trade' : 'Continue'}
          onPress={stepIndex === steps.length - 1 ? saveTrade : () => setStepIndex((current) => current + 1)}
        />
      </View>
    </AppScreen>
  );
}

function Field({
  control,
  keyboardType,
  label,
  name,
}: {
  control: ReturnType<typeof useForm<TradeDraft>>['control'];
  keyboardType: 'decimal-pad' | 'number-pad';
  label: string;
  name: 'entryPrice' | 'quantity' | 'entryFees' | 'stopLoss' | 'target';
}) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} />
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <TextInput
            keyboardType={keyboardType}
            onChangeText={(text) => onChange(Number(text || 0))}
            placeholder={label}
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={String(value)}
          />
        )}
      />
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function setMarket(
  setValue: ReturnType<typeof useForm<TradeDraft>>['setValue'],
  market: TradeDraft['market']
) {
  setValue('market', market);
  setValue('symbol', '');
  setValue('instrumentType', market === 'indian_fo' ? 'futures' : 'stock');
}

const styles = StyleSheet.create({
  checklistCard: {
    gap: 8,
  },
  checklistCopy: {
    color: colors.muted,
    fontSize: 13,
  },
  checklistTitle: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: '800',
  },
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
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: spacing.xl,
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
  metricCard: {
    backgroundColor: colors.cardAlt,
    gap: 6,
  },
  metricFootnote: {
    color: colors.muted,
    fontSize: 12,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '800',
  },
  spacer: {
    flex: 1,
  },
  stack: {
    gap: spacing.md,
  },
  stepBar: {
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    height: 4,
    width: '100%',
  },
  stepBarActive: {
    backgroundColor: colors.primary,
  },
  stepItem: {
    flex: 1,
    gap: 6,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.lg,
  },
  stepText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  stepTextActive: {
    color: colors.primary,
  },
  textarea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  title: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: '800',
  },
});
