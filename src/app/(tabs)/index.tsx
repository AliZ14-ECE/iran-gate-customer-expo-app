/**
 * Iran Gate — Home Dashboard (Tab)
 *
 * Shows a greeting, active order count, and a list of user's orders.
 * FAB navigates to the create order screen.
 */

import { EmptyState } from "@/components/EmptyState";
import { FAB } from "@/components/FAB";
import { OrderCard } from "@/components/OrderCard";
import { Button } from "@/components/ui/Button";
import { orderService, type Order } from "@/services/orderService";
import { useAuthStore } from "@/store/useAuthStore";
import { Colors, Shadows, Spacing, TextStyles } from "@/theme";
import { getErrorMessage } from "@/utils/formatters";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await orderService.list();
      console.log("orders response:::", response.data);
      setOrders(response.data.orders ?? []);
    } catch (error) {
      Alert.alert("Error", getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refetch when tab becomes focused
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const activeOrders = orders.filter((o) => o.status !== "DELIVERED");

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Greeting */}
      <View style={styles.greeting}>
        <View>
          <Text style={[styles.greetingLabel, { color: colors.textSecondary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.greetingName, { color: colors.text }]}>
            {user?.name ?? "Customer"} 👋
          </Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {(user?.name ?? "C").charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
      >
        <View style={styles.statItem}>
          <Ionicons name="cube" size={22} color="rgba(255,255,255,0.9)" />
          <Text style={styles.statNumber}>{activeOrders.length}</Text>
          <Text style={styles.statLabel}>Active Orders</Text>
        </View>
        <View
          style={[
            styles.statDivider,
            { backgroundColor: "rgba(255,255,255,0.2)" },
          ]}
        />
        <View style={styles.statItem}>
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="rgba(255,255,255,0.9)"
          />
          <Text style={styles.statNumber}>
            {orders.length - activeOrders.length}
          </Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
        <View
          style={[
            styles.statDivider,
            { backgroundColor: "rgba(255,255,255,0.2)" },
          ]}
        />
        <View style={styles.statItem}>
          <Ionicons name="layers" size={22} color="rgba(255,255,255,0.9)" />
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Section title */}
      {orders.length > 0 && (
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Your Orders
        </Text>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="cart-outline"
        title="No orders yet"
        description="Start by creating your first purchase request. We'll handle the rest!"
        action={
          <Button
            title="Create First Request"
            onPress={() => router.push("/orders/create")}
            size="md"
          />
        }
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/orders/${item.id}`)}
          />
        )}
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

      {/* FAB — always visible */}
      <FAB onPress={() => router.push("/orders/create")} icon="add" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    paddingTop: Spacing["5xl"],
    paddingBottom: Spacing.lg,
  },
  greeting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  greetingLabel: {
    ...TextStyles.caption,
    marginBottom: 2,
  },
  greetingName: {
    ...TextStyles.h2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...TextStyles.h3,
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
    ...Shadows.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
  },
  statDivider: {
    width: 1,
    marginHorizontal: Spacing.sm,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Spacing.sm,
  },
});
