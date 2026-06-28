/**
 * Iran Gate — Empty State Component
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, TextStyles } from '@/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = 'cube-outline',
  title,
  description,
  action,
}: EmptyStateProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: colors.primaryLight },
        ]}
      >
        <Ionicons name={icon} size={40} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing['5xl'],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...TextStyles.h3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...TextStyles.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  action: {
    marginTop: Spacing.xl,
  },
});
