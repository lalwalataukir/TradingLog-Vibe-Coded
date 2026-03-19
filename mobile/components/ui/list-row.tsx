import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/card';
import { colors } from '@/lib/theme';

interface ListRowProps {
  title: string;
  subtitle: string;
  value?: string;
  onPress?: () => void;
}

export function ListRow({ onPress, subtitle, title, value }: ListRowProps) {
  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        <View style={styles.content}>
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {value ? <Text style={styles.value}>{value}</Text> : null}
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 14,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: 4,
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
  value: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: '700',
  },
});
