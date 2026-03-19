import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii } from '@/lib/theme';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
}

export function Chip({ label, onPress, selected = false }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.base, selected ? styles.selected : styles.idle]}>
      <Text style={[styles.text, selected ? styles.selectedText : styles.idleText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  idle: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  idleText: {
    color: colors.muted,
  },
  selectedText: {
    color: colors.primaryForeground,
  },
});
