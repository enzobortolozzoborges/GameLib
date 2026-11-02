import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { getMetacriticColor } from '../utils/format';

interface GameCardProps {
  imagem: string | null;
  nome: string;
  favorito: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
  rating?: number;
  metacritic?: number | null;
}

export const GameCard: React.FC<GameCardProps> = React.memo(
  ({ imagem, nome, favorito, onPress, onToggleFavorite, rating, metacritic }) => {
    const [imageError, setImageError] = useState(false);
    const hasValidImage = Boolean(imagem) && !imageError;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Abrir detalhes de ${nome}`}
        accessibilityHint="Toque duas vezes para ver a ficha completa do jogo"
      >
        {/* Container da Capa / Placeholder */}
        <View style={styles.imageContainer}>
          {hasValidImage ? (
            <Image
              source={{ uri: imagem! }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`Capa do jogo ${nome}`}
            />
          ) : (
            <View
              style={styles.placeholder}
              accessible={true}
              accessibilityRole="image"
              accessibilityLabel={`Placeholder sem capa para ${nome}`}
            >
              <Ionicons name="game-controller-outline" size={44} color={colors.textMuted} />
              <Text style={styles.placeholderText} allowFontScaling={true}>
                Sem imagem
              </Text>
            </View>
          )}

          {/* Botão de Favorito Sobreposto à Capa */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleFavorite();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              favorito ? `Remover ${nome} dos favoritos` : `Adicionar ${nome} aos favoritos`
            }
            accessibilityState={{ selected: favorito }}
          >
            <Ionicons
              name={favorito ? 'heart' : 'heart-outline'}
              size={22}
              color={favorito ? colors.error : colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Badge Metacritic (se houver) */}
          {metacritic !== null && metacritic !== undefined && (
            <View
              style={[
                styles.metacriticBadge,
                { borderColor: getMetacriticColor(metacritic) },
              ]}
              accessible={true}
              accessibilityLabel={`Nota Metacritic: ${metacritic}`}
            >
              <Text
                style={[
                  styles.metacriticText,
                  { color: getMetacriticColor(metacritic) },
                ]}
                allowFontScaling={true}
              >
                {metacritic}
              </Text>
            </View>
          )}
        </View>

        {/* Informações Textuais */}
        <View style={styles.content}>
          <Text
            style={styles.title}
            numberOfLines={2}
            ellipsizeMode="tail"
            allowFontScaling={true}
          >
            {nome}
          </Text>

          {rating !== undefined && rating > 0 && (
            <View style={styles.ratingRow} accessible={false}>
              <Ionicons name="star" size={13} color={colors.star} />
              <Text style={styles.ratingText} allowFontScaling={true}>
                {rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

GameCard.displayName = 'GameCard';

const { width } = Dimensions.get('window');
// Card width adaptado para grid de 2 colunas com padding
const cardWidth = (width - spacing.md * 3) / 2;

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 210,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: colors.surfaceElevated,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metacriticBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  metacriticText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: spacing.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});
