/**
 * Iran Gate — Profile Screen (Tab)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, TextStyles, BorderRadius, type ThemeColors } from '@/theme';

export default function ProfileScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const initial = (user?.name ?? 'U').charAt(0).toUpperCase();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatarLarge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarLargeText, { color: colors.primary }]}>
            {initial}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {user?.name ?? 'Customer'}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email ?? '—'}
        </Text>
      </View>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <InfoRow
          icon="person-outline"
          label="Full Name"
          value={user?.name ?? '—'}
          colors={colors}
        />
        <View style={[styles.cardDivider, { backgroundColor: colors.divider }]} />
        <InfoRow
          icon="mail-outline"
          label="Email"
          value={user?.email ?? '—'}
          colors={colors}
        />
        <View style={[styles.cardDivider, { backgroundColor: colors.divider }]} />
        <InfoRow
          icon="shield-checkmark-outline"
          label="Role"
          value={user?.role ?? 'customer'}
          colors={colors}
        />
      </Card>

      {/* Logout Button */}
      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="danger"
        fullWidth
        size="lg"
        icon={<Ionicons name="log-out-outline" size={20} color="#fff" />}
      />
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon} size={20} color={colors.icon} />
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing['5xl'],
    paddingBottom: Spacing['4xl'],
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  avatarLargeText: {
    fontSize: 34,
    fontWeight: '700',
  },
  name: {
    ...TextStyles.h2,
    marginBottom: Spacing.xxs,
  },
  email: {
    ...TextStyles.body,
  },
  infoCard: {
    marginBottom: Spacing['2xl'],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoLabel: {
    ...TextStyles.body,
  },
  infoValue: {
    ...TextStyles.bodyMedium,
  },
  cardDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
});
