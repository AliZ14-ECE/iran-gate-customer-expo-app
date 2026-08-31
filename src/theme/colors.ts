/**
 * Iran Gate — Color Palette
 *
 * Premium color system with light/dark mode support.
 * HSL-based colors for harmonious, vibrant UI.
 */

export const Palette = {
  // Brand — Deep indigo / violet
  indigo50: '#EEF2FF',
  indigo100: '#E0E7FF',
  indigo200: '#C7D2FE',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',
  indigo800: '#3730A3',
  indigo900: '#312E81',

  // Accent — Warm amber / gold for CTAs
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',

  // Semantic — Success
  emerald50: '#ECFDF5',
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',
  emerald700: '#047857',

  // Semantic — Warning
  orange50: '#FFF7ED',
  orange400: '#FB923C',
  orange500: '#F97316',

  // Semantic — Error
  rose50: '#FFF1F2',
  rose400: '#FB7185',
  rose500: '#F43F5E',
  rose600: '#E11D48',

  // Semantic — Info
  sky50: '#F0F9FF',
  sky400: '#38BDF8',
  sky500: '#0EA5E9',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  gray950: '#030712',
};

export const Colors = {
  light: {
    // Backgrounds
    background: Palette.gray50,
    surface: Palette.white,
    surfaceElevated: Palette.white,
    surfaceSecondary: Palette.gray100,

    // Text
    text: Palette.gray900,
    textSecondary: Palette.gray500,
    textTertiary: Palette.gray400,
    textInverse: Palette.white,

    // Brand
    primary: Palette.indigo600,
    primaryLight: Palette.indigo100,
    primaryDark: Palette.indigo700,

    // Accent
    accent: Palette.amber500,
    accentLight: '#FEF3C7',

    // Semantic
    success: Palette.emerald500,
    successLight: Palette.emerald50,
    warning: Palette.orange500,
    warningLight: Palette.orange50,
    error: Palette.rose500,
    errorLight: Palette.rose50,
    info: Palette.sky500,
    infoLight: Palette.sky50,

    // UI
    border: Palette.gray200,
    borderLight: Palette.gray100,
    divider: Palette.gray100,
    icon: Palette.gray500,
    iconSecondary: Palette.gray400,
    placeholder: Palette.gray400,
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Tab bar
    tabBar: Palette.white,
    tabBarBorder: Palette.gray200,
    tabActive: Palette.indigo600,
    tabInactive: Palette.gray400,

    // Shadows
    shadowColor: 'rgba(0, 0, 0, 0.08)',
  },

  dark: {
    // Backgrounds
    background: Palette.gray950,
    surface: Palette.gray900,
    surfaceElevated: Palette.gray800,
    surfaceSecondary: Palette.gray800,

    // Text
    text: Palette.gray50,
    textSecondary: Palette.gray400,
    textTertiary: Palette.gray500,
    textInverse: Palette.gray900,

    // Brand
    primary: Palette.indigo400,
    primaryLight: Palette.indigo900,
    primaryDark: Palette.indigo500,

    // Accent
    accent: Palette.amber400,
    accentLight: '#78350F',

    // Semantic
    success: Palette.emerald400,
    successLight: '#064E3B',
    warning: Palette.orange400,
    warningLight: '#7C2D12',
    error: Palette.rose400,
    errorLight: '#881337',
    info: Palette.sky400,
    infoLight: '#0C4A6E',

    // UI
    border: Palette.gray700,
    borderLight: Palette.gray800,
    divider: Palette.gray800,
    icon: Palette.gray400,
    iconSecondary: Palette.gray500,
    placeholder: Palette.gray600,
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Tab bar
    tabBar: Palette.gray900,
    tabBarBorder: Palette.gray800,
    tabActive: Palette.indigo400,
    tabInactive: Palette.gray500,

    // Shadows
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  },
};

export type ThemeColors = typeof Colors.light;
export type ColorScheme = 'light' | 'dark';
