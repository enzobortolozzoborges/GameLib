import axios, { AxiosError } from 'axios';

export const RAWG_BASE_URL = 'https://api.rawg.io/api';
export const API_TIMEOUT_MS = 10000;

export function getRawgApiKey(): string {
  const key = process.env.EXPO_PUBLIC_RAWG_API_KEY;
  return key ? key.trim() : '';
}

export const rawgClient = axios.create({
  baseURL: RAWG_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
  },
});

export interface ApiError {
  type: 'MISSING_KEY' | 'INVALID_KEY' | 'RATE_LIMIT' | 'TIMEOUT' | 'NETWORK' | 'UNKNOWN';
  message: string;
  statusCode?: number;
}

export function parseApiError(error: unknown): ApiError {
  const currentKey = getRawgApiKey();
  if (!currentKey) {
    return {
      type: 'MISSING_KEY',
      message:
        'Chave da API RAWG não configurada. Defina EXPO_PUBLIC_RAWG_API_KEY no arquivo .env para carregar o catálogo de jogos.',
    };
  }

  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{ detail?: string; error?: string }>;

    // Timeout
    if (axiosErr.code === 'ECONNABORTED' || axiosErr.message.includes('timeout')) {
      return {
        type: 'TIMEOUT',
        message: 'A requisição demorou muito para responder (tempo limite de 10s excedido). Verifique sua conexão.',
      };
    }

    // Sem rede / falha de conexão
    if (!axiosErr.response) {
      return {
        type: 'NETWORK',
        message: 'Não foi possível conectar aos servidores da RAWG. Verifique sua conexão com a internet.',
      };
    }

    const status = axiosErr.response.status;

    // Chave inválida ou não autorizada
    if (status === 401 || status === 403) {
      return {
        type: 'INVALID_KEY',
        statusCode: status,
        message:
          'Chave de API inválida ou não autorizada. Verifique sua chave da RAWG no arquivo .env.',
      };
    }

    // Rate limit
    if (status === 429) {
      return {
        type: 'RATE_LIMIT',
        statusCode: status,
        message:
          'Muitas requisições enviadas à API da RAWG (limite de taxa atingido). Aguarde alguns instantes e tente novamente.',
      };
    }

    return {
      type: 'UNKNOWN',
      statusCode: status,
      message:
        axiosErr.response.data?.detail ||
        axiosErr.response.data?.error ||
        `Erro no servidor da RAWG (código ${status}). Tente novamente.`,
    };
  }

  return {
    type: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao carregar os dados.',
  };
}
