import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { PlayedGame, PlayedGameInput, PlayedContextType } from '../types/played';
import { STORAGE_KEYS } from '../storage/keys';
import { storageGetItem, storageSetItem } from '../storage/asyncStorage';
import { useAuth } from './AuthContext';

const PlayedContext = createContext<PlayedContextType | undefined>(undefined);

interface PlayedProviderProps {
  children: ReactNode;
}

export const PlayedProvider: React.FC<PlayedProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [playedGames, setPlayedGames] = useState<PlayedGame[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const isHydrated = useRef<boolean>(false);

  // Carregamento/hidratação ao trocar de usuário
  useEffect(() => {
    let isMounted = true;
    isHydrated.current = false;

    if (!user) {
      setPlayedGames([]);
      setLoading(false);
      return;
    }

    async function hydrate() {
      setLoading(true);
      try {
        const key = STORAGE_KEYS.playedForUser(user!.id);
        const stored = await storageGetItem<PlayedGame[]>(key, []);
        if (isMounted) {
          setPlayedGames(stored);
          isHydrated.current = true;
        }
      } catch (error) {
        console.error('[PlayedProvider] Erro ao carregar jogos jogados:', error);
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

  const isPlayed = useCallback(
    (id: number): boolean => {
      return playedGames.some((game) => game.id === id);
    },
    [playedGames]
  );

  const getRating = useCallback(
    (id: number): number => {
      const match = playedGames.find((game) => game.id === id);
      return match ? match.userRating : 0;
    },
    [playedGames]
  );

  const togglePlayed = useCallback(
    async (game: PlayedGameInput, rating: number = 5): Promise<void> => {
      if (!user) return;
      if (!isHydrated.current) return;

      const exists = playedGames.some((item) => item.id === game.id);
      let updated: PlayedGame[];

      if (exists) {
        updated = playedGames.filter((item) => item.id !== game.id);
      } else {
        const newPlayed: PlayedGame = {
          id: game.id,
          name: game.name,
          background_image: game.background_image,
          userRating: Math.min(Math.max(Math.round(rating), 1), 5),
          playedAt: new Date().toISOString(),
        };
        updated = [newPlayed, ...playedGames];
      }

      setPlayedGames(updated);
      try {
        const key = STORAGE_KEYS.playedForUser(user.id);
        await storageSetItem(key, updated);
      } catch (error) {
        console.error('[PlayedProvider] Erro ao persistir jogos jogados:', error);
      }
    },
    [user, playedGames]
  );

  const setRating = useCallback(
    async (id: number, rating: number): Promise<void> => {
      if (!user) return;
      if (!isHydrated.current) return;

      const clamped = Math.min(Math.max(Math.round(rating), 1), 5);
      const updated = playedGames.map((item) =>
        item.id === id ? { ...item, userRating: clamped } : item
      );

      setPlayedGames(updated);
      try {
        const key = STORAGE_KEYS.playedForUser(user.id);
        await storageSetItem(key, updated);
      } catch (error) {
        console.error('[PlayedProvider] Erro ao atualizar nota:', error);
      }
    },
    [user, playedGames]
  );

  return (
    <PlayedContext.Provider
      value={{
        playedGames,
        isPlayed,
        getRating,
        togglePlayed,
        setRating,
        loading,
      }}
    >
      {children}
    </PlayedContext.Provider>
  );
};

export function usePlayed(): PlayedContextType {
  const context = useContext(PlayedContext);
  if (!context) {
    throw new Error('usePlayed deve ser utilizado dentro de um PlayedProvider');
  }
  return context;
}
