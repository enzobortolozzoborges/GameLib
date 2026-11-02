import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface LoadingFooterProps {
  loading: boolean;
  message?: string;
}

export const LoadingFooter: React.FC<LoadingFooterProps> = ({
  loading,
  message = 'Carregando mais jogos...',
}) => {
  if (!loading) return null;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityLabel={message}
    >
      <ActivityIndicator size="small" color={colors.accent} />
      <Text style={styles.text} allowFontScaling={true}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.textSecondary,
    fontSize: 13,
    marginLeft: spacing.sm,
  },
});
