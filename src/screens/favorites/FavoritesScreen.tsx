import React, { useCallback } from 'react';
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
import { FavoriteGame } from '../../types/favorites';
import { useFavorites } from '../../context/FavoritesContext';
import { GameCard } from '../../components/GameCard';
import { EmptyState } from '../../components/EmptyState';
import { colors, spacing } from '../../theme';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'FavoritesTab'>,
  NativeStackScreenProps<AppStackParamList>
>;

export const FavoritesScreen: React.FC<Props> = ({ navigation }) => {
  const { favorites, toggleFavorite, loading } = useFavorites();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FavoriteGame>) => {
      return (
        <GameCard
          imagem={item.background_image}
          nome={item.name}
          favorito={true}
          rating={item.rating}
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
    [toggleFavorite, navigation]
  );

  const keyExtractor = useCallback((item: FavoriteGame) => String(item.id), []);

  if (loading) {
    return (
      <View
        style={styles.centerContainer}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando lista de desejos"
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="heart-dislike-outline"
            title="Sua lista de desejos está vazia"
            description="Explore o catálogo ou use a busca para encontrar jogos e adicioná-los aos seus favoritos."
            actionLabel="Explorar Catálogo"
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});
