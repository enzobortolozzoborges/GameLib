import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AppStackParamList } from '../../types/navigation';
import { GameDetails } from '../../types/game';
import { getGameById } from '../../api/rawg';
import { parseApiError, ApiError } from '../../api/client';
import { useFavorites } from '../../context/FavoritesContext';
import { usePlayed } from '../../context/PlayedContext';
import { stripHtml } from '../../utils/stripHtml';
import { formatDate, getMetacriticColor } from '../../utils/format';
import { StarRating } from '../../components/StarRating';
import { RawgAttribution } from '../../components/RawgAttribution';
import { ErrorView } from '../../components/ErrorView';
import { colors, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'GameDetails'>;

export const GameDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { id } = route.params;

  const { isFavorite, toggleFavorite } = useFavorites();
  const { isPlayed, getRating, togglePlayed, setRating } = usePlayed();

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [imageError, setImageError] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const favorite = isFavorite(id);
  const played = isPlayed(id);
  const userRating = getRating(id);

  const loadDetails = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const data = await getGameById(id, controller.signal);
      if (!controller.signal.aborted) {
        setGame(data);
        // Título dinâmico do header com o nome do jogo
        navigation.setOptions({
          title: data.name,
        });
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const parsed = parseApiError(err);
      setError(parsed);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [id, navigation]);

  useEffect(() => {
    loadDetails();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadDetails]);

  const handleToggleFavorite = () => {
    if (!game) return;
    toggleFavorite({
      id: game.id,
      name: game.name,
      background_image: game.background_image,
      rating: game.rating,
    });
  };

  const handleTogglePlayed = () => {
    if (!game) return;
    togglePlayed(
      {
        id: game.id,
        name: game.name,
        background_image: game.background_image,
      },
      userRating > 0 ? userRating : 5
    );
  };

  const handleRatingChange = (newRating: number) => {
    setRating(id, newRating);
  };

  if (loading) {
    return (
      <View
        style={styles.centerContainer}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando detalhes do jogo"
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !game) {
    return (
      <ErrorView
        title="Erro ao carregar detalhes"
        message={error?.message || 'Não foi possível encontrar as informações deste jogo.'}
        onRetry={loadDetails}
        isKeyError={error?.type === 'MISSING_KEY' || error?.type === 'INVALID_KEY'}
      />
    );
  }

  // Prepara descrição limpa (sem tags HTML)
  const cleanDescription =
    game.description_raw?.trim() || stripHtml(game.description) || 'Sem descrição disponível.';

  const platformsList =
    game.platforms?.map((p) => p.platform.name).join(', ') || 'Não informadas';

  const genresList = game.genres?.map((g) => g.name).join(', ') || 'Não informados';

  const developersList = game.developers?.map((d) => d.name).join(', ') || 'Não informadas';

  const publishersList = game.publishers?.map((p) => p.name).join(', ') || 'Não informadas';

  const hasImage = Boolean(game.background_image) && !imageError;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Banner / Capa Grande */}
      <View style={styles.bannerContainer}>
        {hasImage ? (
          <Image
            source={{ uri: game.background_image! }}
            style={styles.bannerImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`Capa grande do jogo ${game.name}`}
          />
        ) : (
          <View
            style={styles.bannerPlaceholder}
            accessible={true}
            accessibilityRole="image"
            accessibilityLabel={`Sem imagem disponível para ${game.name}`}
          >
            <Ionicons name="game-controller-outline" size={64} color={colors.textMuted} />
            <Text style={styles.bannerPlaceholderText} allowFontScaling={true}>
              Sem capa disponível
            </Text>
          </View>
        )}
      </View>

      {/* Cabeçalho de Título e Ações Rápidas */}
      <View style={styles.headerSection}>
        <Text style={styles.gameTitle} allowFontScaling={true}>
          {game.name}
        </Text>

        <View style={styles.actionRow}>
          {/* Botão de Favorito (Lista de Desejos) */}
          <TouchableOpacity
            style={[styles.actionButton, favorite && styles.actionButtonActive]}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              favorite
                ? `Remover ${game.name} da lista de desejos`
                : `Adicionar ${game.name} à lista de desejos`
            }
            accessibilityState={{ selected: favorite }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={favorite ? colors.error : colors.textPrimary}
              style={styles.actionIcon}
            />
            <Text
              style={[styles.actionButtonText, favorite && styles.actionButtonTextActive]}
              allowFontScaling={true}
            >
              {favorite ? 'Na Lista de Desejos' : 'Adicionar aos Favoritos'}
            </Text>
          </TouchableOpacity>

          {/* Botão Marcar como Jogado */}
          <TouchableOpacity
            style={[styles.actionButton, played && styles.actionButtonPlayedActive]}
            onPress={handleTogglePlayed}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              played
                ? `Desmarcar ${game.name} como jogado`
                : `Marcar ${game.name} como jogado`
            }
            accessibilityState={{ selected: played }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={played ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={20}
              color={played ? colors.success : colors.textPrimary}
              style={styles.actionIcon}
            />
            <Text
              style={[
                styles.actionButtonText,
                played && styles.actionButtonTextPlayedActive,
              ]}
              allowFontScaling={true}
            >
              {played ? 'Jogado' : 'Marcar como Jogado'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Avaliação por Estrelas (visível quando marcado como jogado) */}
        {played && (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingCardTitle} allowFontScaling={true}>
              Sua avaliação pessoal:
            </Text>
            <StarRating
              rating={userRating || 5}
              interactive={true}
              onRatingChange={handleRatingChange}
              size={32}
              showValue={true}
            />
          </View>
        )}
      </View>

      {/* Métricas e Notas */}
      <View style={styles.metricsContainer}>
        {/* Metacritic */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel} allowFontScaling={true}>
            Metacritic
          </Text>
          {game.metacritic !== null && game.metacritic !== undefined ? (
            <View
              style={[
                styles.metacriticBadge,
                { borderColor: getMetacriticColor(game.metacritic) },
              ]}
              accessible={true}
              accessibilityLabel={`Nota Metacritic ${game.metacritic}`}
            >
              <Text
                style={[
                  styles.metacriticScore,
                  { color: getMetacriticColor(game.metacritic) },
                ]}
                allowFontScaling={true}
              >
                {game.metacritic}
              </Text>
            </View>
          ) : (
            <Text style={styles.metricValueMuted} allowFontScaling={true}>
              N/D
            </Text>
          )}
        </View>

        {/* Rating RAWG */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel} allowFontScaling={true}>
            Nota RAWG
          </Text>
          <View style={styles.rawgRatingRow}>
            <Ionicons name="star" size={18} color={colors.star} />
            <Text style={styles.rawgRatingText} allowFontScaling={true}>
              {game.rating > 0 ? `${game.rating.toFixed(1)} / 5` : 'Sem nota'}
            </Text>
          </View>
        </View>

        {/* Data de Lançamento */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel} allowFontScaling={true}>
            Lançamento
          </Text>
          <Text style={styles.metricValue} allowFontScaling={true}>
            {formatDate(game.released)}
          </Text>
        </View>
      </View>

      {/* Informações Técnicas e Metadados */}
      <View style={styles.detailsCard}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel} allowFontScaling={true}>
            Gêneros:
          </Text>
          <Text style={styles.metaValue} allowFontScaling={true}>
            {genresList}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel} allowFontScaling={true}>
            Plataformas:
          </Text>
          <Text style={styles.metaValue} allowFontScaling={true}>
            {platformsList}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel} allowFontScaling={true}>
            Desenvolvedora:
          </Text>
          <Text style={styles.metaValue} allowFontScaling={true}>
            {developersList}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel} allowFontScaling={true}>
            Distribuidora:
          </Text>
          <Text style={styles.metaValue} allowFontScaling={true}>
            {publishersList}
          </Text>
        </View>
      </View>

      {/* Descrição Completa */}
      <View style={styles.descriptionCard}>
        <Text style={styles.sectionTitle} allowFontScaling={true}>
          Sobre o Jogo
        </Text>
        <Text style={styles.descriptionText} allowFontScaling={true}>
          {cleanDescription}
        </Text>
      </View>

      {/* Atribuição da RAWG */}
      <RawgAttribution style={styles.attribution} />
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  bannerContainer: {
    width: width,
    height: 230,
    backgroundColor: colors.surfaceElevated,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  bannerPlaceholderText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  headerSection: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  gameTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    minHeight: 48,
    flex: 1,
    minWidth: 140,
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.error,
  },
  actionButtonPlayedActive: {
    backgroundColor: colors.surface,
    borderColor: colors.success,
  },
  actionIcon: {
    marginRight: spacing.xs,
  },
  actionButtonText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: colors.error,
  },
  actionButtonTextPlayedActive: {
    color: colors.success,
  },
  ratingCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingCardTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  metricValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  metricValueMuted: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  metacriticBadge: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  metacriticScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  rawgRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rawgRatingText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaRow: {
    marginBottom: spacing.sm,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  descriptionCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  attribution: {
    marginTop: spacing.lg,
  },
});
