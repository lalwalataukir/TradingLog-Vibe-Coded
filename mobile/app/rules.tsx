import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/layout/screen';
import { AppCard } from '@/components/ui/card';
import { colors, spacing } from '@/lib/theme';
import { useAppData } from '@/providers/app-data-provider';

export default function RulesRoute() {
  const { analytics, isReady, rules, toggleRule } = useAppData();

  if (!isReady) {
    return (
      <AppScreen>
        <ActivityIndicator color={colors.primary} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <AppCard style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Days since last violation</Text>
        <Text style={styles.summaryValue}>{analytics.daysSinceRuleViolation}</Text>
      </AppCard>

      <View style={styles.stack}>
        {rules.map((rule) => (
          <Pressable key={rule.id} onPress={() => toggleRule(rule.id)}>
            <AppCard style={styles.ruleCard}>
              <View style={styles.ruleHeader}>
                <Text style={styles.ruleCategory}>{rule.category}</Text>
                <Text style={styles.ruleStatus}>{rule.isActive ? 'Active' : 'Paused'}</Text>
              </View>
              <Text style={styles.ruleText}>{rule.ruleText}</Text>
              <Text style={styles.ruleMeta}>{rule.violationsThisMonth} violations this month</Text>
            </AppCard>
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  ruleCard: {
    gap: 6,
  },
  ruleCategory: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ruleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ruleMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  ruleStatus: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  ruleText: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: '700',
  },
  stack: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  summaryCard: {
    gap: 6,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  summaryValue: {
    color: colors.profit,
    fontSize: 32,
    fontWeight: '800',
  },
});
