import { DarkTheme, type Theme } from '@react-navigation/native';

export const colors = {
  background: '#111214',
  card: '#181B20',
  cardAlt: '#20242B',
  foreground: '#F5F7FA',
  muted: '#9AA4B2',
  border: '#2A303A',
  primary: '#57E389',
  primaryForeground: '#0E1116',
  profit: '#57E389',
  profitMuted: 'rgba(87, 227, 137, 0.16)',
  loss: '#F36A67',
  lossMuted: 'rgba(243, 106, 103, 0.16)',
  secondary: '#20242B',
  chart3: '#5AB6FF',
  chart4: '#F5C451',
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  screen: 20,
} as const;

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.card,
    border: colors.border,
    notification: colors.loss,
    primary: colors.primary,
    text: colors.foreground,
  },
};
