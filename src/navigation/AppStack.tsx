import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import { BottomTabs } from './BottomTabs';
import { GameDetailsScreen } from '../screens/details/GameDetailsScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.backgroundSecondary,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GameDetails"
        component={GameDetailsScreen}
        options={{
          title: 'Detalhes do Jogo',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  );
};
