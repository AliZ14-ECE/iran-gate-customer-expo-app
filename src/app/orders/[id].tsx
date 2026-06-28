/**
 * Iran Gate — Order Details & Tracking Screen
 *
 * Displays order info, status timeline, quotation review, and images.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  useColorScheme,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { orderService, type Order } from '@/services/orderService';
import {
  getErrorMessage,
  formatCurrency,
  formatDateTime,
  getStatusLabel,
} from '@/utils/formatters';
import { Timeline } from '@/components/Timeline';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors, Spacing, TextStyles, BorderRadius, Shadows, type ThemeColors } from '@/theme';

export default function OrderDetailScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { id } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    try {
      const response = await orderService.getById(id);
      setOrder(response.data);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchOrder();
    }, [fetchOrder]),
  );

  const handleProceedToPayment = () => {
    Alert.alert(
      'Payment',
      'Payment integration coming soon. Please contact support to complete your payment.',
      [{ text: 'OK' }],
    );
  };

  const openSourceUrl = () => {
    if (order?.source_url) {
      Linking.openURL(order.source_url).catch(() =>
        Alert.alert('Error', 'Could not open the URL'),
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textTertiary} />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          Order not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Order Header */}
      <View style={styles.header}>
        <Text style={[styles.orderTitle, { color: colors.text }]}>
          {order.title}
        </Text>
        <StatusBadge status={order.status} />
        <Text style={[styles.orderId, { color: colors.textTertiary }]}>
          ID: {order.id.slice(0, 8)}...
        </Text>
      </View>

      {/* Status Timeline */}
      <Card variant="elevated" style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Tracking Timeline
        </Text>
        <Timeline currentStatus={order.status} />
      </Card>

      {/* Quotation Review — visible when QUOTATION_PROVIDED */}
      {order.status === 'QUOTATION_PROVIDED' && (
        <Card variant="elevated" style={styles.section}>
          <View style={styles.quotationHeader}>
            <Ionicons name="receipt-outline" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quotation Review
            </Text>
          </View>

          <View style={styles.quotationGrid}>
            <QuotationRow
              label="Verified Price"
              value={formatCurrency(order.verified_price ?? 0)}
              colors={colors}
            />
            <QuotationRow
              label="Shipping Fee"
              value={formatCurrency(order.shipping_fee ?? 0)}
              colors={colors}
            />
            <QuotationRow
              label="Weight"
              value={order.weight ? `${order.weight} kg` : '—'}
              colors={colors}
            />
            <View style={[styles.quotationDivider, { backgroundColor: colors.divider }]} />
            <QuotationRow
              label="Total"
              value={formatCurrency(
                (order.verified_price ?? 0) + (order.shipping_fee ?? 0),
              )}
              colors={colors}
              bold
            />
          </View>

          <Button
            title="Proceed to Payment"
            onPress={handleProceedToPayment}
            fullWidth
            size="lg"
            icon={<Ionicons name="card-outline" size={18} color="#fff" />}
            style={styles.paymentBtn}
          />
        </Card>
      )}

      {/* Order Info */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Order Details
        </Text>

        <DetailRow
          icon="link-outline"
          label="Source URL"
          value={order.source_url}
          onPress={openSourceUrl}
          colors={colors}
          isLink
        />
        <DetailRow
          icon="document-text-outline"
          label="Description"
          value={order.description || '—'}
          colors={colors}
        />
        <DetailRow
          icon="cash-outline"
          label="Declared Price"
          value={formatCurrency(order.declared_price)}
          colors={colors}
        />
        <DetailRow
          icon="calendar-outline"
          label="Created"
          value={formatDateTime(order.created_at)}
          colors={colors}
        />
        <DetailRow
          icon="time-outline"
          label="Last Updated"
          value={formatDateTime(order.updated_at)}
          colors={colors}
        />
      </Card>

      {/* Image Gallery */}
      {order.image_urls && order.image_urls.length > 0 && (
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Attached Screenshots
          </Text>
          <View style={styles.imageGallery}>
            {order.image_urls.map((url, index) => (
              <Image
                key={`order-img-${index}`}
                source={{ uri: url }}
                style={[
                  styles.galleryImage,
                  {
                    borderColor: colors.border,
                  },
                ]}
                contentFit="cover"
                transition={200}
              />
            ))}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

function QuotationRow({
  label,
  value,
  colors,
  bold = false,
}: {
  label: string;
  value: string;
  colors: ThemeColors;
  bold?: boolean;
}) {
  return (
    <View style={styles.quotationRow}>
      <Text
        style={[
          styles.quotationLabel,
          { color: colors.textSecondary },
          bold && { fontWeight: '700', color: colors.text },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.quotationValue,
          { color: colors.text },
          bold && { fontWeight: '700', fontSize: 18 },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  colors,
  onPress,
  isLink = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ThemeColors;
  onPress?: () => void;
  isLink?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={18} color={colors.icon} />
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text
        style={[
          styles.detailValue,
          { color: isLink ? colors.primary : colors.text },
        ]}
        numberOfLines={2}
        onPress={onPress}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  errorText: {
    ...TextStyles.body,
    marginTop: Spacing.sm,
  },
  header: {
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  orderTitle: {
    ...TextStyles.h2,
  },
  orderId: {
    ...TextStyles.tiny,
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Spacing.md,
  },
  // Quotation
  quotationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quotationGrid: {
    gap: Spacing.sm,
  },
  quotationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  quotationLabel: {
    ...TextStyles.body,
  },
  quotationValue: {
    ...TextStyles.bodyMedium,
  },
  quotationDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  paymentBtn: {
    marginTop: Spacing.lg,
  },
  // Detail rows
  detailRow: {
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailLabel: {
    ...TextStyles.caption,
  },
  detailValue: {
    ...TextStyles.body,
    marginLeft: 30,
  },
  // Image gallery
  imageGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
});
