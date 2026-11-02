import * as SecureStore from 'expo-secure-store';
import { SECURE_KEYS } from './keys';

export async function saveSessionUserId(userId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(SECURE_KEYS.SESSION_USER_ID, userId);
  } catch (error) {
    console.error('[saveSessionUserId] Erro ao gravar sessão segura:', error);
    throw error;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(SECURE_KEYS.SESSION_USER_ID);
  } catch (error) {
    console.error('[getSessionUserId] Erro ao ler sessão segura:', error);
    return null;
  }
}

export async function clearSessionUserId(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEYS.SESSION_USER_ID);
  } catch (error) {
    console.error('[clearSessionUserId] Erro ao limpar sessão segura:', error);
  }
}
