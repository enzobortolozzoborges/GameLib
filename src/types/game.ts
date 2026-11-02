export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface PlatformInfo {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Company {
  id: number;
  name: string;
  slug?: string;
}

export interface Game {
  id: number;
  name: string;
  background_image: string | null;
  rating: number;
  rating_top?: number;
  metacritic: number | null;
  released: string | null;
  genres?: Genre[];
  platforms?: PlatformInfo[];
}

export interface GameDetails extends Game {
  description_raw: string | null;
  description: string | null;
  developers?: Company[];
  publishers?: Company[];
  website?: string | null;
  playtime?: number;
}

export interface RawgPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type GameOrdering = '' | '-rating' | '-released' | '-added';
