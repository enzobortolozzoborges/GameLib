export const STORAGE_KEYS = {
  USERS: '@gamelib:users',
  favoritesForUser: (userId: string) => `@gamelib:favorites:${userId}`,
  playedForUser: (userId: string) => `@gamelib:played:${userId}`,
};

export const SECURE_KEYS = {
  // Chaves do SecureStore devem conter apenas alfanuméricos, '.', '-' e '_'
  SESSION_USER_ID: 'gamelib_session_user_id',
};
