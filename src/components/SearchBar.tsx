import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  onClear,
  isLoading = false,
  placeholder = 'Buscar jogos por título...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          allowFontScaling={true}
          accessible={true}
          accessibilityLabel="Campo de busca de jogos"
          accessibilityHint="Digite o nome de um jogo e toque em buscar"
        />
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={onClear}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Limpar texto da busca"
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!value.trim() || isLoading) && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={!value.trim() || isLoading}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Buscar jogos"
        accessibilityState={{ disabled: !value.trim() || isLoading }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.background} />
        ) : (
          <Text style={styles.submitButtonText} allowFontScaling={true}>
            Buscar
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: spacing.md,
    height: 48,
    marginRight: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.textPrimary,
    height: '100%',
  },
  clearButton: {
    padding: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 72,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.background,
    fontWeight: '700',
  },
});
