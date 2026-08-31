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
        <View style={styles.badgeRow}>
          <StatusBadge status={order.status} />
          <View style={[styles.qtyBadge, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Ionicons name="layers-outline" size={12} color={colors.primary} />
            <Text style={[styles.qtyBadgeText, { color: colors.text }]}>
              Qty: {order.quantity || 1}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="pricetag-outline" size={14} color={colors.iconSecondary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {order.declared_price != null
              ? (order.quantity && order.quantity > 1
                  ? `${formatCurrency(order.declared_price)} × ${order.quantity} (${formatCurrency(order.declared_price * order.quantity)})`
                  : formatCurrency(order.declared_price))
              : '—'}
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
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  qtyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  qtyBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
