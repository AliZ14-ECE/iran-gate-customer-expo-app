/**
 * Iran Gate — Login Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { getErrorMessage } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing, TextStyles } from '@/theme';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    try {
      await login(email.trim(), password);

      // After successful login, register push token
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await authService.registerPushToken(pushToken);
        }
      } catch {
        // Push token registration is non-critical
        console.log('Push token registration failed (non-critical)');
      }
    } catch (error) {
      Alert.alert('Login Failed', getErrorMessage(error));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[styles.logoCircle, { backgroundColor: colors.primaryLight }]}
          >
            <Ionicons name="globe-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.brandTitle, { color: colors.text }]}>
            Iran Gate
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your gateway to global shopping
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon={
              <Ionicons name="mail-outline" size={20} color={colors.icon} />
            }
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            icon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.icon}
              />
            }
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <Link href="/(auth)/register" style={styles.link}>
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Sign Up
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['4xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  brandTitle: {
    ...TextStyles.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...TextStyles.body,
  },
  form: {
    marginBottom: Spacing['2xl'],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...TextStyles.body,
  },
  link: {
    marginLeft: 2,
  },
  linkText: {
    ...TextStyles.bodyMedium,
  },
});
