import { rawgClient, getRawgApiKey } from './client';
import { Game, GameDetails, RawgPaginatedResponse } from '../types/game';

/**
 * Valida a chave da API RAWG executando uma requisição leve com page_size=1.
 * Retorna true se a chave for válida e responder com sucesso.
 */
export async function validateApiKey(signal?: AbortSignal): Promise<boolean> {
  const apiKey = getRawgApiKey();
  if (!apiKey) {
    return false;
  }

  const response = await rawgClient.get<RawgPaginatedResponse<Game>>('/games', {
    params: {
      key: apiKey,
      page_size: 1,
    },
    signal,
  });

  return response.status === 200;
}

/**
 * Busca a lista paginada de jogos para o catálogo principal.
 * Utiliza ordering=-added por padrão para priorizar jogos populares com capas de alta qualidade.
 */
export async function getGames(
  page: number = 1,
  pageSize: number = 20,
  ordering: string = '-added',
  signal?: AbortSignal
): Promise<RawgPaginatedResponse<Game>> {
  const apiKey = getRawgApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const response = await rawgClient.get<RawgPaginatedResponse<Game>>('/games', {
    params: {
      key: apiKey,
      page,
      page_size: pageSize,
      ordering,
    },
    signal,
  });

  return response.data;
}

/**
 * Executa a busca textual de jogos na API da RAWG com suporte a filtros de ordenação e paginação.
 */
export async function searchGames(
  query: string,
  page: number = 1,
  ordering?: string,
  pageSize: number = 20,
  signal?: AbortSignal
): Promise<RawgPaginatedResponse<Game>> {
  const apiKey = getRawgApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const params: Record<string, string | number> = {
    key: apiKey,
    search: query.trim(),
    page,
    page_size: pageSize,
  };

  if (ordering && ordering.trim().length > 0) {
    params.ordering = ordering;
  }

  const response = await rawgClient.get<RawgPaginatedResponse<Game>>('/games', {
    params,
    signal,
  });

  return response.data;
}

/**
 * Busca os detalhes completos de um jogo específico por ID.
 */
export async function getGameById(
  id: number | string,
  signal?: AbortSignal
): Promise<GameDetails> {
  const apiKey = getRawgApiKey();
  if (!apiKey) {
    throw new Error('MISSING_API_KEY');
  }

  const response = await rawgClient.get<GameDetails>(`/games/${id}`, {
    params: {
      key: apiKey,
    },
    signal,
  });

  return response.data;
}
