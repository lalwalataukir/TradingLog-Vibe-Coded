import { useTheme } from '@/hooks/useTheme';
import { Tabs } from 'expo-router';

// Icons using unicode symbols for simplicity (no extra library needed)
export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📊" active={color === colors.primary} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trades"
        options={{
          title: 'Trades',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📋" active={color === colors.primary} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📈" active={color === colors.primary} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="📓" active={color === colors.primary} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => (
            <TabIcon emoji="⚙️" active={color === colors.primary} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

import { Text } from 'react-native';

function TabIcon({
  emoji,
  active,
  color,
}: {
  emoji: string;
  active: boolean;
  color: string;
}) {
  return (
    <Text style={{ fontSize: 20, opacity: active ? 1 : 0.6 }}>{emoji}</Text>
  );
}
