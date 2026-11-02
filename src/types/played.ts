export interface PlayedGame {
  id: number;
  name: string;
  background_image: string | null;
  userRating: number; // 1 to 5
  playedAt: string;
}

export type PlayedGameInput = {
  id: number;
  name: string;
  background_image: string | null;
};

export interface PlayedContextType {
  playedGames: PlayedGame[];
  isPlayed: (id: number) => boolean;
  getRating: (id: number) => number;
  togglePlayed: (game: PlayedGameInput, rating?: number) => Promise<void>;
  setRating: (id: number, rating: number) => Promise<void>;
  loading: boolean;
}
