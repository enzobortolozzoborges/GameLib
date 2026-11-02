import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { colors, spacing, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={styles.splashContainer}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Restaurando sessão da GameLib"
      >
        <View style={styles.logoBadge}>
          <Ionicons name="game-controller" size={48} color={colors.accent} />
        </View>
        <Text style={styles.splashTitle} allowFontScaling={true}>
          GameLib
        </Text>
        <ActivityIndicator
          size="large"
          color={colors.accent}
          style={styles.spinner}
        />
        <Text style={styles.spinnerText} allowFontScaling={true}>
          Restaurando sua biblioteca...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
    marginBottom: spacing.md,
  },
  splashTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },
  spinner: {
    marginBottom: spacing.sm,
  },
  spinnerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
