/**
 * Iran Gate — Catalog Screen (Tab)
 *
 * Grid of public products from the catalog.
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  useColorScheme,
  Alert,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { catalogService, type CatalogProduct } from '@/services/catalogService';
import { getErrorMessage, formatCurrency } from '@/utils/formatters';
import { EmptyState } from '@/components/EmptyState';
import { Colors, Spacing, TextStyles, BorderRadius, Shadows } from '@/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = Spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_GAP) / 2;

export default function CatalogScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCatalog = useCallback(async () => {
    try {
      const response = await catalogService.list();
      setProducts(response.data.products ?? []);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCatalog();
    }, [fetchCatalog]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCatalog();
  }, [fetchCatalog]);

  const renderProduct = ({ item }: { item: CatalogProduct }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          shadowColor: colors.shadowColor,
        },
      ]}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View
          style={[
            styles.cardImagePlaceholder,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <Ionicons name="image-outline" size={32} color={colors.iconSecondary} />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text
          style={[styles.cardTitle, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text style={[styles.cardPrice, { color: colors.primary }]}>
          {formatCurrency(item.price)}
        </Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Catalog</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Browse available products
      </Text>
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="storefront-outline"
        title="No products yet"
        description="The catalog is currently empty. Check back later for new items!"
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  header: {
    paddingTop: Spacing['5xl'],
    paddingBottom: Spacing.xl,
  },
  title: {
    ...TextStyles.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...TextStyles.body,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardTitle: {
    ...TextStyles.captionMedium,
    lineHeight: 18,
  },
  cardPrice: {
    ...TextStyles.h4,
  },
});
