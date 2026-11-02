import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface RawgAttributionProps {
  style?: object;
}

export const RawgAttribution: React.FC<RawgAttributionProps> = ({ style }) => {
  const handleOpenRawg = async () => {
    try {
      const url = 'https://rawg.io';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('[RawgAttribution] Falha ao abrir link da RAWG:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text} allowFontScaling={true}>
        Dados fornecidos por{' '}
      </Text>
      <TouchableOpacity
        onPress={handleOpenRawg}
        accessible={true}
        accessibilityRole="link"
        accessibilityLabel="Abrir o site oficial da RAWG no navegador"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.linkWrapper}
      >
        <Text style={styles.linkText} allowFontScaling={true}>
          RAWG
        </Text>
        <Ionicons
          name="open-outline"
          size={12}
          color={colors.accent}
          style={styles.linkIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  text: {
    ...typography.caption,
    color: colors.textMuted,
  },
  linkWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  linkIcon: {
    marginLeft: 2,
  },
});
