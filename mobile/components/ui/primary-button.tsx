import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii } from '@/lib/theme';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
}

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    color: colors.primaryForeground,
    fontSize: 15,
    fontWeight: '700',
  },
});
