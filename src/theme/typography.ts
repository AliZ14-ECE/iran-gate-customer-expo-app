/**
 * Iran Gate — Typography System
 */

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const Typography = {
  fontFamily,

  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },

  // Font weights (as RN string literals)
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line height multipliers
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
} as const;

/** Pre-composed text styles for quick use */
export const TextStyles = {
  h1: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  h2: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  h3: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
  },
  h4: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  body: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.regular,
  },
  bodyMedium: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  caption: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.regular,
  },
  captionMedium: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  tiny: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.regular,
  },
  button: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    letterSpacing: Typography.letterSpacing.wide,
  },
} as const;
