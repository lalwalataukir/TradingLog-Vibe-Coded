import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/layout/screen';
import { AppCard } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { colors, radii, spacing } from '@/lib/theme';
import { validateSettingsPatch } from '@/lib/validation';
import { useAppData } from '@/providers/app-data-provider';

export default function SettingsRoute() {
  const { exportBackupCsv, exportBackupJson, isReady, settings, updateAppSettings } = useAppData();
  const [startingCapital, setStartingCapital] = useState(String(settings.startingCapital));
  const [currentCapital, setCurrentCapital] = useState(String(settings.currentCapital));

  useEffect(() => {
    setStartingCapital(String(settings.startingCapital));
    setCurrentCapital(String(settings.currentCapital));
  }, [settings.currentCapital, settings.startingCapital]);

  if (!isReady) {
    return (
      <AppScreen>
        <ActivityIndicator color={colors.primary} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <View style={styles.stack}>
        <Section title="Capital">
          <Field label="Starting Capital" onChangeText={setStartingCapital} value={startingCapital} />
          <Field label="Current Capital" onChangeText={setCurrentCapital} value={currentCapital} />
        </Section>

        <Section title="Defaults">
          <Row label="Default Market" value={settings.defaultMarket} />
          <Row label="Currency" value={settings.currency} />
          <Row label="Timezone" value={settings.timezone} />
          <Row label="Risk per Trade" value={`${settings.riskPerTradeDefault}%`} />
        </Section>

        <PrimaryButton
          label="Save Settings"
          onPress={() => {
            const nextSettings = {
              currentCapital: Number(currentCapital),
              startingCapital: Number(startingCapital),
            };
            const errors = validateSettingsPatch(nextSettings);
            if (errors.length > 0) {
              Alert.alert('Invalid Settings', errors[0]);
              return;
            }

            updateAppSettings(nextSettings);
            Alert.alert('Settings Saved', 'Capital settings updated.');
          }}
        />
        <PrimaryButton label="Export JSON Backup" onPress={() => void exportBackupJson()} />
        <PrimaryButton label="Export Trades CSV" onPress={() => void exportBackupCsv()} />
      </View>
    </AppScreen>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: colors.foreground,
    fontSize: 14,
  },
  rowValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stack: {
    gap: spacing.md,
  },
});
