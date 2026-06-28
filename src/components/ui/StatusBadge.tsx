/**
 * Iran Gate — Status Badge Component
 *
 * Colored badge displaying order status.
 */

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors, BorderRadius, Spacing, TextStyles } from '@/theme';
import type { OrderStatus } from '@/services/orderService';
import { getStatusLabel } from '@/utils/formatters';

interface StatusBadgeProps {
  status: OrderStatus;
}

function getStatusColors(
  status: OrderStatus,
  colors: typeof Colors.light,
): { bg: string; text: string } {
  switch (status) {
    case 'PENDING_QUOTATION':
      return { bg: colors.warningLight, text: colors.warning };
    case 'QUOTATION_PROVIDED':
      return { bg: colors.infoLight, text: colors.info };
    case 'PAID':
      return { bg: colors.successLight, text: colors.success };
    case 'PURCHASED':
      return { bg: colors.primaryLight, text: colors.primary };
    case 'ARRIVED_FOREIGN_WH':
      return { bg: colors.primaryLight, text: colors.primary };
    case 'ARRIVED_LOCAL_WH':
      return { bg: colors.accentLight, text: colors.accent };
    case 'DELIVERED':
      return { bg: colors.successLight, text: colors.success };
    default:
      return { bg: colors.surfaceSecondary, text: colors.textSecondary };
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const statusColors = getStatusColors(status, colors);

  return (
    <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
      <Text style={[styles.label, { color: statusColors.text }]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    ...TextStyles.tiny,
    fontWeight: '600',
  },
});
