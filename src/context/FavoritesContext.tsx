import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { FavoriteGame, FavoriteGameInput, FavoritesContextType } from '../types/favorites';
import { STORAGE_KEYS } from '../storage/keys';
import { storageGetItem, storageSetItem } from '../storage/asyncStorage';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isHydrated = useRef<boolean>(false);

  // Hidratação ao trocar ou autenticar usuário
  useEffect(() => {
    let isMounted = true;
    isHydrated.current = false;

    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    async function hydrate() {
      setLoading(true);
      try {
        const key = STORAGE_KEYS.favoritesForUser(user!.id);
        const stored = await storageGetItem<FavoriteGame[]>(key, []);
        if (isMounted) {
          setFavorites(stored);
          isHydrated.current = true;
        }
      } catch (error) {
        console.error('[FavoritesProvider] Erro ao carregar favoritos:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const isFavorite = useCallback(
    (id: number): boolean => {
      return favorites.some((game) => game.id === id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (game: FavoriteGameInput): Promise<void> => {
      if (!user) return;
      if (!isHydrated.current) return;

      const exists = favorites.some((item) => item.id === game.id);
      let updated: FavoriteGame[];

      if (exists) {
        updated = favorites.filter((item) => item.id !== game.id);
      } else {
        const newFav: FavoriteGame = {
          id: game.id,
          name: game.name,
          background_image: game.background_image,
          rating: game.rating,
          addedAt: new Date().toISOString(),
        };
        updated = [newFav, ...favorites];
      }

      setFavorites(updated);
      try {
        const key = STORAGE_KEYS.favoritesForUser(user.id);
        await storageSetItem(key, updated);
      } catch (error) {
        console.error('[FavoritesProvider] Erro ao persistir favoritos:', error);
      }
    },
    [user, favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites deve ser utilizado dentro de um FavoritesProvider');
  }
  return context;
}
