import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  title?: string;
  isKeyError?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message = 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
  onRetry,
  title = 'Ops! Algo deu errado',
  isKeyError = false,
}) => {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`${title}: ${message}`}
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name={isKeyError ? 'key-outline' : 'cloud-offline-outline'}
          size={48}
          color={isKeyError ? colors.warning : colors.error}
        />
      </View>

      <Text style={styles.title} allowFontScaling={true}>
        {title}
      </Text>

      <Text style={styles.message} allowFontScaling={true}>
        {message}
      </Text>

      {isKeyError && (
        <View style={styles.keyHelpContainer}>
          <Text style={styles.keyHelpTitle} allowFontScaling={true}>
            Como configurar a chave:
          </Text>
          <Text style={styles.keyHelpText} allowFontScaling={true}>
            1. Obtenha uma chave gratuita em https://rawg.io/apidocs{'\n'}
            2. Adicione no arquivo .env:{'\n'}
            EXPO_PUBLIC_RAWG_API_KEY=sua_chave_aqui{'\n'}
            3. Reinicie o Expo com npx expo start -c
          </Text>
        </View>
      )}

      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente carregar os dados"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="refresh" size={18} color={colors.background} style={styles.retryIcon} />
          <Text style={styles.retryText} allowFontScaling={true}>
            Tentar novamente
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    maxWidth: 320,
  },
  keyHelpContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    maxWidth: 340,
  },
  keyHelpTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  keyHelpText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: 6,
    minHeight: 48,
    minWidth: 180,
  },
  retryIcon: {
    marginRight: spacing.sm,
  },
  retryText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
  },
});
