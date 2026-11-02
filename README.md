# GameLib 🎮 (Inspirado na Steam)

**README gerado por IA**
Aplicativo móvel completo de catálogo e biblioteca de jogos desenvolvido em **React Native** com **Expo** e **TypeScript estrito**, inspirado na interface e paleta de cores da **Steam**.

O GameLib consome a API oficial da [RAWG Video Games Database](https://rawg.io) para apresentar um catálogo dinâmico com mais de 500 mil jogos, busca avançada com filtros, detalhes aprofundados de títulos, gerenciamento de Lista de Desejos (Favoritos) e registro de Jogos Jogados com avaliações pessoais de 1 a 5 estrelas. Todos os dados são salvos localmente e isolados individualmente por usuário autenticado.

---

## 📋 Mapeamento de Requisitos Funcionais (RF01 – RF10)

A tabela abaixo mapeia cada requisito especificado para os respectivos arquivos e módulos que o implementam no código:

| Requisito | Descrição | Arquivos de Implementação |
|---|---|---|
| **Login / Auth** | Cadastro e login locais, SHA-256 com salt aleatório via `expo-crypto`, sessão persistida via `expo-secure-store`, navegação condicional | [`src/context/AuthContext.tsx`](file:///home/enzo/GameLib/src/context/AuthContext.tsx)<br>[`src/storage/secureStorage.ts`](file:///home/enzo/GameLib/src/storage/secureStorage.ts)<br>[`src/utils/crypto.ts`](file:///home/enzo/GameLib/src/utils/crypto.ts)<br>[`src/screens/auth/LoginScreen.tsx`](file:///home/enzo/GameLib/src/screens/auth/LoginScreen.tsx)<br>[`src/screens/auth/RegisterScreen.tsx`](file:///home/enzo/GameLib/src/screens/auth/RegisterScreen.tsx) |
| **RF01** | **Tela Principal (Catálogo)**: Grid de 2 colunas (`FlatList`), rolagem infinita (`onEndReached`), pull-to-refresh, deduplicação por id, guard contra chamadas duplicadas, placeholder de imagem, memoização | [`src/screens/catalog/HomeScreen.tsx`](file:///home/enzo/GameLib/src/screens/catalog/HomeScreen.tsx)<br>[`src/components/GameCard.tsx`](file:///home/enzo/GameLib/src/components/GameCard.tsx)<br>[`src/api/rawg.ts`](file:///home/enzo/GameLib/src/api/rawg.ts) |
| **RF02** | **Navegação**: Native Stack Navigator com Bottom Tabs aninhadas (Biblioteca, Buscar, Favoritos, Jogados, Perfil), tela de Detalhes acima das tabs, título dinâmico com `setOptions` | [`src/navigation/RootNavigator.tsx`](file:///home/enzo/GameLib/src/navigation/RootNavigator.tsx)<br>[`src/navigation/AppStack.tsx`](file:///home/enzo/GameLib/src/navigation/AppStack.tsx)<br>[`src/navigation/BottomTabs.tsx`](file:///home/enzo/GameLib/src/navigation/BottomTabs.tsx)<br>[`src/navigation/AuthStack.tsx`](file:///home/enzo/GameLib/src/navigation/AuthStack.tsx) |
| **RF03** | **Tela de Detalhes**: Requisição `getGameById(id)`, exibição de capa grande, plataformas, gêneros, data de lançamento, desenvolvedoras/distribuidoras, Metacritic, rating RAWG e sanitização de HTML | [`src/screens/details/GameDetailsScreen.tsx`](file:///home/enzo/GameLib/src/screens/details/GameDetailsScreen.tsx)<br>[`src/api/rawg.ts`](file:///home/enzo/GameLib/src/api/rawg.ts)<br>[`src/utils/stripHtml.ts`](file:///home/enzo/GameLib/src/utils/stripHtml.ts)<br>[`src/utils/format.ts`](file:///home/enzo/GameLib/src/utils/format.ts) |
| **RF04** | **Favoritos com Context API**: Botão de coração para favoritar/desfavoritar, `FavoritesContext` com `isFavorite(id)`, `toggleFavorite(game)` e resumo para carregamento instantâneo | [`src/context/FavoritesContext.tsx`](file:///home/enzo/GameLib/src/context/FavoritesContext.tsx)<br>[`src/components/GameCard.tsx`](file:///home/enzo/GameLib/src/components/GameCard.tsx)<br>[`src/screens/details/GameDetailsScreen.tsx`](file:///home/enzo/GameLib/src/screens/details/GameDetailsScreen.tsx) |
| **RF05** | **Tela de Favoritos**: Acessível pela Bottom Tab e pelos botões no Header da Home, lista reativa, remoção direta, estado vazio amigável | [`src/screens/favorites/FavoritesScreen.tsx`](file:///home/enzo/GameLib/src/screens/favorites/FavoritesScreen.tsx)<br>[`src/components/HeaderActionButtons.tsx`](file:///home/enzo/GameLib/src/components/HeaderActionButtons.tsx)<br>[`src/components/EmptyState.tsx`](file:///home/enzo/GameLib/src/components/EmptyState.tsx) |
| **RF06** | **Persistência Separada por Usuário**: AsyncStorage com chaves `@gamelib:favorites:{userId}` e `@gamelib:played:{userId}`, hidratação segura com guard `isHydrated` para evitar sobrescrita | [`src/storage/keys.ts`](file:///home/enzo/GameLib/src/storage/keys.ts)<br>[`src/storage/asyncStorage.ts`](file:///home/enzo/GameLib/src/storage/asyncStorage.ts)<br>[`src/context/FavoritesContext.tsx`](file:///home/enzo/GameLib/src/context/FavoritesContext.tsx)<br>[`src/context/PlayedContext.tsx`](file:///home/enzo/GameLib/src/context/PlayedContext.tsx) |
| **RF07** | **Jogados com Nota**: Toggle "Marcar como jogado", componente `StarRating` de 1 a 5 estrelas editável, tela/aba "Jogados", `PlayedContext` e estatísticas no Perfil | [`src/context/PlayedContext.tsx`](file:///home/enzo/GameLib/src/context/PlayedContext.tsx)<br>[`src/components/StarRating.tsx`](file:///home/enzo/GameLib/src/components/StarRating.tsx)<br>[`src/screens/played/PlayedScreen.tsx`](file:///home/enzo/GameLib/src/screens/played/PlayedScreen.tsx)<br>[`src/screens/profile/ProfileScreen.tsx`](file:///home/enzo/GameLib/src/screens/profile/ProfileScreen.tsx) |
| **RF08** | **Busca e Filtros**: TextInput controlado com botão "Buscar" e `onSubmitEditing`, chips de ordenação (relevância, `-rating`, `-released`), paginação, mensagens para lista vazia | [`src/screens/search/SearchScreen.tsx`](file:///home/enzo/GameLib/src/screens/search/SearchScreen.tsx)<br>[`src/components/SearchBar.tsx`](file:///home/enzo/GameLib/src/components/SearchBar.tsx)<br>[`src/components/FilterChip.tsx`](file:///home/enzo/GameLib/src/components/FilterChip.tsx) |
| **RF09** | **Feedback de UI e Tratamento de Erros**: Indicadores de carregamento (inicial, paginação, busca, auth), `ErrorView` com "Tentar novamente", diferenciação de status (401/403, 429, timeout 10s, sem internet), cancelamento com `AbortController` | [`src/components/ErrorView.tsx`](file:///home/enzo/GameLib/src/components/ErrorView.tsx)<br>[`src/components/LoadingFooter.tsx`](file:///home/enzo/GameLib/src/components/LoadingFooter.tsx)<br>[`src/api/client.ts`](file:///home/enzo/GameLib/src/api/client.ts)<br>[`src/hooks/useFetch.ts`](file:///home/enzo/GameLib/src/hooks/useFetch.ts) |
| **RF10** | **Acessibilidade**: Atributos `accessible`, `accessibilityLabel`, `accessibilityRole`, `accessibilityState`, touch targets >= 44x44 pt com `hitSlop`, suporte a escala de fonte do sistema, contraste mínimo 4.5:1 no tema Steam | [`src/theme/colors.ts`](file:///home/enzo/GameLib/src/theme/colors.ts)<br>[`src/components/GameCard.tsx`](file:///home/enzo/GameLib/src/components/GameCard.tsx)<br>[`src/components/StarRating.tsx`](file:///home/enzo/GameLib/src/components/StarRating.tsx)<br>[`src/components/RawgAttribution.tsx`](file:///home/enzo/GameLib/src/components/RawgAttribution.tsx)<br>[`src/navigation/BottomTabs.tsx`](file:///home/enzo/GameLib/src/navigation/BottomTabs.tsx) |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v18+) e npm instalados
- Expo CLI (`npx expo`)
- Para executar no dispositivo físico: aplicativo **Expo Go** instalado (Android ou iOS)
- Para executar no emulador: **Android Studio** com emulador Android configurado e ativo

### Passo a Passo

1. **Clone ou acesse o repositório:**
   ```bash
   cd GameLib
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure sua chave da RAWG API:**
   - Obtenha sua chave gratuita em [https://rawg.io/apidocs](https://rawg.io/apidocs).
   - Copie o arquivo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   - Abra o arquivo `.env` e preencha a variável:
     ```env
     EXPO_PUBLIC_RAWG_API_KEY=sua_chave_rawg_aqui
     ```
   > ⚠️ **Aviso:** O arquivo `.env` está explicitamente incluído no `.gitignore` para impedir que chaves secretas sejam enviadas ao controle de versão. Nunca insira a chave diretamente no código TypeScript.

4. **Inicie o servidor de desenvolvimento Expo:**
   ```bash
   npx expo start -c
   ```

5. **Executando no Android Studio / Emulador Android:**
   - Abra o **Android Studio**, abra o **Device Manager** e inicie o seu Emulador Android (AVD).
   - No terminal onde o Expo está rodando, pressione a tecla `a` (ou execute `npm run android`). O Expo instalará e iniciará automaticamente o aplicativo no emulador.
---

## 🔗 Atribuição da API RAWG

> Dados fornecidos por [RAWG](https://rawg.io).
> Este aplicativo utiliza a base de dados pública fornecida pela RAWG Video Games Database API sob seus termos de serviço de atribuição.
