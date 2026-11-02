import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  CatalogTab: undefined;
  SearchTab: undefined;
  FavoritesTab: undefined;
  PlayedTab: undefined;
  ProfileTab: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  GameDetails: { id: number };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
