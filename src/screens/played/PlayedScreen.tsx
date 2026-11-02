import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, AppStackParamList } from '../../types/navigation';
import { PlayedGame } from '../../types/played';
import { usePlayed } from '../../context/PlayedContext';
import { StarRating } from '../../components/StarRating';
import { EmptyState } from '../../components/EmptyState';
import { formatDate } from '../../utils/format';
import { colors, spacing, typography } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'PlayedTab'>,
  NativeStackScreenProps<AppStackParamList>
>;

export const PlayedScreen: React.FC<Props> = ({ navigation }) => {
  const { playedGames, togglePlayed, setRating, loading } = usePlayed();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (gameId: number) => {
    setImageErrors((prev) => ({ ...prev, [gameId]: true }));
  };

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PlayedGame>) => {
      const hasValidImage = Boolean(item.background_image) && !imageErrors[item.id];

      return (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardClickable}
            onPress={() => navigation.navigate('GameDetails', { id: item.id })}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Detalhes de ${item.name}. Nota atribuída: ${item.userRating} de 5 estrelas`}
          >
            {/* Imagem do Jogo */}
            <View style={styles.imageContainer}>
              {hasValidImage ? (
                <Image
                  source={{ uri: item.background_image! }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => handleImageError(item.id)}
                  accessible={true}
                  accessibilityRole="image"
                  accessibilityLabel={`Capa do jogo jogado ${item.name}`}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="game-controller-outline" size={32} color={colors.textMuted} />
                </View>
              )}
            </View>

            {/* Informações */}
            <View style={styles.infoContainer}>
              <Text
                style={styles.gameTitle}
                numberOfLines={2}
                ellipsizeMode="tail"
                allowFontScaling={true}
              >
                {item.name}
              </Text>

              <Text style={styles.playedDate} allowFontScaling={true}>
                Registrado em {formatDate(item.playedAt.split('T')[0])}
              </Text>

              {/* Avaliação em Estrelas Editável */}
              <View style={styles.starsWrapper}>
                <StarRating
                  rating={item.userRating}
                  interactive={true}
                  onRatingChange={(newRating) => setRating(item.id, newRating)}
                  size={24}
                  showValue={true}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Botão de Remover de Jogados */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() =>
              togglePlayed({
                id: item.id,
                name: item.name,
                background_image: item.background_image,
              })
            }
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Remover ${item.name} da lista de jogos jogados`}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      );
    },
    [imageErrors, navigation, setRating, togglePlayed]
  );

  const keyExtractor = useCallback((item: PlayedGame) => String(item.id), []);

  if (loading) {
    return (
      <View
        style={styles.centerContainer}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando jogos jogados"
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={playedGames}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="Nenhum jogo registrado"
            description="Você ainda não marcou nenhum jogo como jogado. Acesse a tela de detalhes de um jogo para marcá-lo e avaliar com estrelas."
            actionLabel="Navegar no Catálogo"
            onAction={() => navigation.navigate('CatalogTab')}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cardClickable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 90,
    height: 100,
    backgroundColor: colors.surfaceElevated,
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
  infoContainer: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  gameTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  playedDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 6,
  },
  starsWrapper: {
    marginTop: 2,
  },
  removeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
});
