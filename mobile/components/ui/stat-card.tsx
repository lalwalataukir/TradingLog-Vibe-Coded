import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/card';
import { colors } from '@/lib/theme';

interface StatCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'profit' | 'loss' | 'accent';
}

export function StatCard({ label, tone = 'default', value }: StatCardProps) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, toneStyles[tone]]}>{value}</Text>
    </AppCard>
  );
}

const toneStyles = StyleSheet.create({
  accent: { color: colors.chart3 },
  default: { color: colors.foreground },
  loss: { color: colors.loss },
  profit: { color: colors.profit },
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 6,
    paddingVertical: 14,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
  },
});
