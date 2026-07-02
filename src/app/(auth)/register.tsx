/**
 * Iran Gate — Register Screen
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

export default function RegisterScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Validation Error', 'Password must be at least 8 characters.');
      return;
    }

    try {
      await register(name.trim(), email.trim(), password);

      // After successful register, register push token
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await authService.registerPushToken(pushToken);
        }
      } catch (pushError) {
        console.warn('Push token registration failed (non-critical):', pushError);
      }
    } catch (error) {
      Alert.alert('Registration Failed', getErrorMessage(error));
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
            <Ionicons name="person-add-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join Iran Gate and start shopping globally
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            icon={
              <Ionicons name="person-outline" size={20} color={colors.icon} />
            }
          />

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
            placeholder="Create a password (min. 8 chars)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
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
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" style={styles.link}>
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Sign In
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
  title: {
    ...TextStyles.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...TextStyles.body,
    textAlign: 'center',
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
