export interface FavoriteGame {
  id: number;
  name: string;
  background_image: string | null;
  rating?: number;
  addedAt: string;
}

export type FavoriteGameInput = {
  id: number;
  name: string;
  background_image: string | null;
  rating?: number;
};

export interface FavoritesContextType {
  favorites: FavoriteGame[];
  isFavorite: (id: number) => boolean;
  toggleFavorite: (game: FavoriteGameInput) => Promise<void>;
  loading: boolean;
}
