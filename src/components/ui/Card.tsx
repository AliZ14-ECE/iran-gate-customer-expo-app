/**
 * Iran Gate — Card Component
 *
 * Elevated card container with shadow and border radius.
 */

import React from 'react';
import {
  View,
  StyleSheet,
  useColorScheme,
  type ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
  onPress?: () => void;
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          shadowColor: colors.shadowColor,
        },
        variant === 'elevated' && Shadows.lg,
        variant === 'default' && Shadows.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
});
