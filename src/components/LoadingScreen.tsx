/**
 * Iran Gate — Loading Screen
 *
 * Full-screen loading indicator during auth hydration.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Animated,
  useColorScheme,
  Text,
} from 'react-native';
import { Colors, TextStyles, Spacing } from '@/theme';

export function LoadingScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.background, opacity: fadeAnim },
      ]}
    >
      <Text style={[styles.brand, { color: colors.primary }]}>Iran Gate</Text>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.loader}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    ...TextStyles.h1,
    marginBottom: Spacing['2xl'],
  },
  loader: {
    marginTop: Spacing.lg,
  },
});
