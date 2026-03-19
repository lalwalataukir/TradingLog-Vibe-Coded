import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/card';
import { colors, radii } from '@/lib/theme';

interface ChartShellProps {
  title: string;
  subtitle: string;
  values?: number[];
}

export function ChartShell({ subtitle, title, values = [36, 58, 32, 74, 52] }: ChartShellProps) {
  const max = Math.max(...values.map((value) => Math.abs(value)), 1);

  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.canvas}>
        <View style={styles.line} />
        {values.map((value, index) => (
          <View
            key={`${title}-${index}`}
            style={[
              styles.bar,
              {
                backgroundColor: value >= 0 ? colors.primary : colors.loss,
                height: Math.max(18, (Math.abs(value) / max) * 74),
              },
            ]}
          />
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
    flex: 1,
    opacity: 0.8,
  },
  canvas: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    height: 96,
    marginTop: 16,
  },
  card: {
    gap: 4,
  },
  line: {
    ...StyleSheet.absoluteFillObject,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    opacity: 0.35,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
  },
  title: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: '700',
  },
});
