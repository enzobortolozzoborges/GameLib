import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, AppStackParamList } from '../../types/navigation';
import { Game } from '../../types/game';
import { getGames, validateApiKey } from '../../api/rawg';
import { parseApiError, ApiError, getRawgApiKey } from '../../api/client';
import { useFavorites } from '../../context/FavoritesContext';
import { GameCard } from '../../components/GameCard';
import { ErrorView } from '../../components/ErrorView';
import { LoadingFooter } from '../../components/LoadingFooter';
import { EmptyState } from '../../components/EmptyState';
import { HeaderActionButtons } from '../../components/HeaderActionButtons';
import { colors, spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'CatalogTab'>,
  NativeStackScreenProps<AppStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const [games, setGames] = useState<Game[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Configura os botões de atalho no cabeçalho (Favoritos e Jogados)
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderActionButtons
          onPressFavorites={() => navigation.navigate('FavoritesTab')}
          onPressPlayed={() => navigation.navigate('PlayedTab')}
        />
      ),
    });
  }, [navigation]);

  // Carregamento inicial com validação da chave RAWG
  const loadInitialGames = useCallback(async () => {
    // Se a chave não estiver configurada no .env, exibe mensagem clara
    const apiKey = getRawgApiKey();
    if (!apiKey) {
      setError({
        type: 'MISSING_KEY',
        message:
          'Chave da API RAWG não configurada. Defina EXPO_PUBLIC_RAWG_API_KEY no arquivo .env.',
      });
      setLoadingInitial(false);
      setRefreshing(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setError(null);

    try {
      // Validação rápida da chave
      await validateApiKey(controller.signal);

      // Carrega a primeira página com ordenação popular (-added)
      const data = await getGames(1, 20, '-added', controller.signal);
      if (!controller.signal.aborted) {
        setGames(data.results);
        setPage(1);
        setHasNextPage(Boolean(data.next));
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      const parsed = parseApiError(err);
      setError(parsed);
    } finally {
      if (!controller.signal.aborted) {
        setLoadingInitial(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadInitialGames();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadInitialGames]);

  // Pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadInitialGames();
  }, [loadInitialGames]);

  // Paginação por rolagem infinita
  const handleLoadMore = useCallback(async () => {
    // Guards contra requisições duplicadas ou fim da paginação
    if (loadingMore || loadingInitial || !hasNextPage || refreshing) {
      return;
    }

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const data = await getGames(nextPage, 20, '-added');
      setGames((prev) => {
        // Deduplicação estrita por id
        const existingIds = new Set(prev.map((g) => g.id));
        const uniqueNewGames = data.results.filter((g) => !existingIds.has(g.id));
        return [...prev, ...uniqueNewGames];
      });
      setPage(nextPage);
      setHasNextPage(Boolean(data.next));
    } catch (err: unknown) {
      console.error('[HomeScreen] Falha ao carregar próxima página:', err);
      // Não trava a lista se falhar uma página incremental
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loadingInitial, hasNextPage, refreshing, page]);

  // Render do GameCard memorizado com useCallback
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Game>) => {
      const favorite = isFavorite(item.id);

      return (
        <GameCard
          imagem={item.background_image}
          nome={item.name}
          favorito={favorite}
          rating={item.rating}
          metacritic={item.metacritic}
          onPress={() => navigation.navigate('GameDetails', { id: item.id })}
          onToggleFavorite={() =>
            toggleFavorite({
              id: item.id,
              name: item.name,
              background_image: item.background_image,
              rating: item.rating,
            })
          }
        />
      );
    },
    [isFavorite, toggleFavorite, navigation]
  );

  const keyExtractor = useCallback((item: Game) => String(item.id), []);

  if (loadingInitial) {
    return (
      <View
        style={styles.centerContainer}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando catálogo de jogos"
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <ErrorView
        title={error.type === 'MISSING_KEY' ? 'Configuração Necessária' : 'Erro ao Carregar'}
        message={error.message}
        onRetry={loadInitialGames}
        isKeyError={error.type === 'MISSING_KEY' || error.type === 'INVALID_KEY'}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={games}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={<LoadingFooter loading={loadingMore} />}
        ListEmptyComponent={
          <EmptyState
            icon="game-controller-outline"
            title="Nenhum jogo encontrado"
            description="Não encontramos jogos no momento. Puxe para baixo para recarregar."
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
