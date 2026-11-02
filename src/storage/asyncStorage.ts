import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storageGetItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[storageGetItem] Erro ao ler a chave "${key}":`, error);
    return fallback;
  }
}

export async function storageSetItem<T>(key: string, value: T): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`[storageSetItem] Erro ao salvar a chave "${key}":`, error);
    throw error;
  }
}

export async function storageRemoveItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`[storageRemoveItem] Erro ao remover a chave "${key}":`, error);
    throw error;
  }
}
