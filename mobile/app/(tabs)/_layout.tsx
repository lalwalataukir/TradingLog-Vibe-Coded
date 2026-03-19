import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';

import { colors, radii } from '@/lib/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="home" />,
        }}
      />
      <Tabs.Screen
        name="trades"
        options={{
          title: 'Trades',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="trades" />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarLabel: '',
          tabBarIcon: ({ color, focused }) => <LogTabIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="analytics" />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} name="journal" />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  color,
  focused,
  name,
}: {
  color: string;
  focused: boolean;
  name: 'analytics' | 'home' | 'journal' | 'trades';
}) {
  let iconName: ComponentProps<typeof Ionicons>['name'];

  switch (name) {
    case 'analytics':
      iconName = focused ? 'analytics' : 'analytics-outline';
      break;
    case 'home':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'journal':
      iconName = focused ? 'book' : 'book-outline';
      break;
    case 'trades':
      iconName = focused ? 'bar-chart' : 'bar-chart-outline';
      break;
  }

  return <Ionicons color={color} name={iconName} size={20} />;
}

function LogTabIcon({ color, focused }: { color: string; focused: boolean }) {
  return (
    <View style={[styles.logTab, focused ? styles.logTabFocused : undefined]}>
      <Ionicons color={colors.primaryForeground} name="add" size={28} />
      <Text style={styles.logTabLabel}>Log</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logTab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radii.xl,
    borderWidth: 1,
    elevation: 12,
    gap: 2,
    justifyContent: 'center',
    minHeight: 68,
    minWidth: 76,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: colors.primary,
    shadowOffset: {
      height: 10,
      width: 0,
    },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    transform: [{ translateY: -12 }],
  },
  logTabFocused: {
    elevation: 16,
    shadowOpacity: 0.38,
    transform: [{ translateY: -14 }, { scale: 1.02 }],
  },
  logTabLabel: {
    color: colors.primaryForeground,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    height: 82,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    paddingBottom: 4,
  },
});
