/**
 * Iran Gate — Input Component
 *
 * Styled text input with label, error state, and optional icon.
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography, TextStyles } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  icon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: error ? colors.error : colors.border,
          },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },
            icon ? styles.inputWithIcon : undefined,
            style,
          ]}
          placeholderTextColor={colors.placeholder}
          {...props}
        />
      </View>
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...TextStyles.captionMedium,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xxs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 48,
  },
  icon: {
    paddingLeft: Spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.regular,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  error: {
    ...TextStyles.tiny,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xxs,
  },
});
