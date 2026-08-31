/**
 * Iran Gate — Order Card Component
 *
 * List item card for the home dashboard showing order summary.
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Shadows, TextStyles } from '@/theme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Order } from '@/services/orderService';
import { formatCurrency, formatDate } from '@/utils/formatters';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

export function OrderCard({ order, onPress }: OrderCardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          shadowColor: colors.shadowColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {order.title}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.iconSecondary}
          />
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="pricetag-outline" size={14} color={colors.iconSecondary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {order.declared_price != null ? formatCurrency(order.declared_price) : '—'}
          </Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.iconSecondary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {formatDate(order.created_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  header: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...TextStyles.h4,
    flex: 1,
    marginRight: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  footerText: {
    ...TextStyles.caption,
  },
});
