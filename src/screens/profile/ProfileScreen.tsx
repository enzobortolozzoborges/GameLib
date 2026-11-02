import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { usePlayed } from '../../context/PlayedContext';
import { RawgAttribution } from '../../components/RawgAttribution';
import { formatDate } from '../../utils/format';
import { colors, spacing, typography } from '../../theme';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const { playedGames } = usePlayed();

  const totalFavorites = favorites.length;
  const totalPlayed = playedGames.length;

  const averageRating =
    totalPlayed > 0
      ? (
          playedGames.reduce((acc, curr) => acc + curr.userRating, 0) / totalPlayed
        ).toFixed(1)
      : '0.0';

  const handleLogout = () => {
    Alert.alert(
      'Encerrar Sessão',
      'Tem certeza de que deseja sair da sua conta na GameLib?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho do Perfil */}
      <View style={styles.headerCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial} allowFontScaling={true}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>

        <Text style={styles.userName} allowFontScaling={true}>
          {user?.name || 'Gamer'}
        </Text>
        <Text style={styles.userEmail} allowFontScaling={true}>
          {user?.email || ''}
        </Text>

        {user?.createdAt && (
          <Text style={styles.memberSince} allowFontScaling={true}>
            Membro desde {formatDate(user.createdAt.split('T')[0])}
          </Text>
        )}
      </View>

      {/* Estatísticas da Biblioteca */}
      <View style={styles.statsCard}>
        <Text style={styles.sectionTitle} allowFontScaling={true}>
          Estatísticas da Coleção
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="heart" size={24} color={colors.error} />
            <Text style={styles.statValue} allowFontScaling={true}>
              {totalFavorites}
            </Text>
            <Text style={styles.statLabel} allowFontScaling={true}>
              Desejos
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Ionicons name="game-controller" size={24} color={colors.accent} />
            <Text style={styles.statValue} allowFontScaling={true}>
              {totalPlayed}
            </Text>
            <Text style={styles.statLabel} allowFontScaling={true}>
              Jogados
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Ionicons name="star" size={24} color={colors.star} />
            <Text style={styles.statValue} allowFontScaling={true}>
              {averageRating}
            </Text>
            <Text style={styles.statLabel} allowFontScaling={true}>
              Média
            </Text>
          </View>
        </View>
      </View>

      {/* Informações da Aplicação */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle} allowFontScaling={true}>
          Sobre a GameLib
        </Text>
        <Text style={styles.infoDescription} allowFontScaling={true}>
          Aplicativo de catálogo de jogos desenvolvido em React Native e Expo com TypeScript,
          integrado à API oficial da RAWG. Suporta autenticação local com criptografia SHA-256 e
          salt, persistência separada por usuário para lista de desejos e registro de jogos jogados
          com notas por estrelas.
        </Text>
      </View>

      {/* Botão de Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Encerrar sessão e sair da conta"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="log-out-outline" size={22} color={colors.error} style={styles.logoutIcon} />
        <Text style={styles.logoutText} allowFontScaling={true}>
          Sair da Conta
        </Text>
      </TouchableOpacity>

      {/* Atribuição da RAWG */}
      <RawgAttribution style={styles.attribution} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.huge,
  },
  headerCard: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.background,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  memberSince: {
    ...typography.caption,
    color: colors.textMuted,
  },
  statsCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginVertical: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  infoCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  infoDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorBackground,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    paddingVertical: spacing.md,
    minHeight: 48,
    marginBottom: spacing.md,
  },
  logoutIcon: {
    marginRight: spacing.sm,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
    fontWeight: '700',
  },
  attribution: {
    marginTop: spacing.sm,
  },
});
