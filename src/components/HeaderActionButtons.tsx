import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

interface HeaderActionButtonsProps {
  onPressFavorites: () => void;
  onPressPlayed: () => void;
  favoritesCount?: number;
  playedCount?: number;
}

export const HeaderActionButtons: React.FC<HeaderActionButtonsProps> = ({
  onPressFavorites,
  onPressPlayed,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPressFavorites}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Abrir favoritos"
        accessibilityHint="Navega para a sua lista de desejos"
      >
        <Ionicons name="heart" size={22} color={colors.accent} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onPressPlayed}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Abrir jogos jogados"
        accessibilityHint="Navega para a lista de jogos avaliados"
      >
        <Ionicons name="game-controller" size={22} color={colors.accent} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
});
