import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ListRenderItemInfo,
  ScrollView,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, AppStackParamList } from '../../types/navigation';
import { Game } from '../../types/game';
import { searchGames } from '../../api/rawg';
import { parseApiError, ApiError, getRawgApiKey } from '../../api/client';
import { useFavorites } from '../../context/FavoritesContext';
import { SearchBar } from '../../components/SearchBar';
import { FilterChip } from '../../components/FilterChip';
import { GameCard } from '../../components/GameCard';
import { EmptyState } from '../../components/EmptyState';
import { ErrorView } from '../../components/ErrorView';
import { LoadingFooter } from '../../components/LoadingFooter';
import { colors, spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'SearchTab'>,
  NativeStackScreenProps<AppStackParamList>
>;

type OrderingOption = '' | '-rating' | '-released';

export const SearchScreen: React.FC<Props> = ({ navigation }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [ordering, setOrdering] = useState<OrderingOption>('');
  const [results, setResults] = useState<Game[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(
    async (searchTerm: string, orderValue: OrderingOption, pageNum: number = 1) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) return;

      const apiKey = getRawgApiKey();
      if (!apiKey) {
        setError({
          type: 'MISSING_KEY',
          message:
            'Chave da API RAWG não configurada. Defina EXPO_PUBLIC_RAWG_API_KEY no arquivo .env.',
        });
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (pageNum === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const data = await searchGames(
          trimmed,
          pageNum,
          orderValue || undefined,
          20,
          controller.signal
        );

        if (!controller.signal.aborted) {
          if (pageNum === 1) {
            setResults(data.results);
            setActiveQuery(trimmed);
            setHasSearched(true);
          } else {
            setResults((prev) => {
              const existingIds = new Set(prev.map((g) => g.id));
              const unique = data.results.filter((g) => !existingIds.has(g.id));
              return [...prev, ...unique];
            });
          }
          setPage(pageNum);
          setHasNextPage(Boolean(data.next));
        }
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        const parsed = parseApiError(err);
        setError(parsed);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    []
  );

  const handleSubmit = () => {
    if (!query.trim()) return;
    performSearch(query, ordering, 1);
  };

  const handleClear = () => {
    setQuery('');
  };

  const handleSelectOrdering = (newOrdering: OrderingOption) => {
    setOrdering(newOrdering);
    if (activeQuery.trim()) {
      performSearch(activeQuery, newOrdering, 1);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore || loading || !hasNextPage || !activeQuery.trim()) return;
    performSearch(activeQuery, ordering, page + 1);
  };

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

  return (
    <View style={styles.container}>
      {/* Barra de Busca */}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSubmit}
        onClear={handleClear}
        isLoading={loading}
      />

      {/* Chips de Filtro/Ordenação */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <FilterChip
            label="Relevância"
            selected={ordering === ''}
            onPress={() => handleSelectOrdering('')}
            accessibilityLabel="Ordenar por relevância"
          />
          <FilterChip
            label="Melhores avaliados"
            selected={ordering === '-rating'}
            onPress={() => handleSelectOrdering('-rating')}
            accessibilityLabel="Ordenar por melhores avaliados"
          />
          <FilterChip
            label="Mais recentes"
            selected={ordering === '-released'}
            onPress={() => handleSelectOrdering('-released')}
            accessibilityLabel="Ordenar por lançamentos mais recentes"
          />
        </ScrollView>
      </View>

      {/* Conteúdo Principal */}
      {loading ? (
        <View
          style={styles.centerContainer}
          accessible={true}
          accessibilityRole="progressbar"
          accessibilityLabel="Buscando jogos..."
        >
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : error ? (
        <ErrorView
          title={error.type === 'MISSING_KEY' ? 'Configuração' : 'Erro na Busca'}
          message={error.message}
          onRetry={handleSubmit}
          isKeyError={error.type === 'MISSING_KEY' || error.type === 'INVALID_KEY'}
        />
      ) : !hasSearched ? (
        <EmptyState
          icon="search-outline"
          title="Buscar no Acervo"
          description="Digite o nome de uma franquia ou jogo para pesquisar em mais de 500.000 títulos na RAWG."
        />
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={<LoadingFooter loading={loadingMore} />}
          ListEmptyComponent={
            <EmptyState
              icon="alert-circle-outline"
              title="Nenhum jogo encontrado"
              description={`Nenhum resultado encontrado para "${activeQuery}". Tente verificar a ortografia ou buscar outros termos.`}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersWrapper: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
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
