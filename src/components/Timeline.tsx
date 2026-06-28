/**
 * Iran Gate — Timeline Component
 *
 * Vertical status timeline showing all 7 logistics stages.
 * Active step gets a pulsing animated indicator.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, TextStyles, BorderRadius } from '@/theme';
import type { OrderStatus } from '@/services/orderService';
import { ORDER_STATUSES, getStatusLabel } from '@/utils/formatters';

interface TimelineProps {
  currentStatus: OrderStatus;
}

function TimelineStep({
  status,
  isCompleted,
  isActive,
  isLast,
}: {
  status: OrderStatus;
  isCompleted: boolean;
  isActive: boolean;
  isLast: boolean;
}) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [isActive, pulseAnim]);

  const dotColor = isCompleted
    ? colors.success
    : isActive
      ? colors.primary
      : colors.border;

  const lineColor = isCompleted ? colors.success : colors.border;
  const textColor = isCompleted || isActive ? colors.text : colors.textTertiary;

  return (
    <View style={styles.step}>
      {/* Dot & Line Column */}
      <View style={styles.dotColumn}>
        {isActive ? (
          <View style={styles.activeDotContainer}>
            <Animated.View
              style={[
                styles.activePulse,
                {
                  backgroundColor: colors.primaryLight,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <View style={[styles.dot, styles.activeDot, { backgroundColor: colors.primary }]}>
              <View style={[styles.dotInner, { backgroundColor: '#fff' }]} />
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.dot,
              { backgroundColor: isCompleted ? colors.success : 'transparent', borderColor: dotColor },
            ]}
          >
            {isCompleted && (
              <Ionicons name="checkmark" size={10} color="#fff" />
            )}
          </View>
        )}
        {!isLast && (
          <View style={[styles.line, { backgroundColor: lineColor }]} />
        )}
      </View>

      {/* Label */}
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: textColor }]}>
          {getStatusLabel(status)}
        </Text>
      </View>
    </View>
  );
}

export function Timeline({ currentStatus }: TimelineProps) {
  const currentIndex = ORDER_STATUSES.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {ORDER_STATUSES.map((status, index) => (
        <TimelineStep
          key={status}
          status={status}
          isCompleted={index < currentIndex}
          isActive={index === currentIndex}
          isLast={index === ORDER_STATUSES.length - 1}
        />
      ))}
    </View>
  );
}

const DOT_SIZE = 22;

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  step: {
    flexDirection: 'row',
    minHeight: 52,
  },
  dotColumn: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  activeDotContainer: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    borderWidth: 0,
  },
  activePulse: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    opacity: 0.4,
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  labelContainer: {
    flex: 1,
    paddingLeft: Spacing.md,
    paddingTop: 2,
  },
  label: {
    ...TextStyles.bodyMedium,
  },
});
