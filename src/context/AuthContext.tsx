import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, StoredUser, AuthContextType } from '../types/auth';
import { STORAGE_KEYS } from '../storage/keys';
import { storageGetItem, storageSetItem } from '../storage/asyncStorage';
import {
  saveSessionUserId,
  getSessionUserId,
  clearSessionUserId,
} from '../storage/secureStorage';
import {
  generateSalt,
  hashPassword,
  verifyPassword,
} from '../utils/crypto';
import {
  validateEmail,
  validatePassword,
  validateName,
} from '../utils/validation';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restaura a sessão persistida ao inicializar o app
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const savedUserId = await getSessionUserId();
        if (savedUserId) {
          const users = await storageGetItem<StoredUser[]>(STORAGE_KEYS.USERS, []);
          const matchedUser = users.find((u) => u.id === savedUserId);
          if (matchedUser && isMounted) {
            setUser({
              id: matchedUser.id,
              name: matchedUser.name,
              email: matchedUser.email,
              createdAt: matchedUser.createdAt,
            });
          }
        }
      } catch (error) {
        console.error('[AuthProvider] Erro ao restaurar sessão:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Validações locais
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error };
      }

      if (!password || password.trim().length === 0) {
        return { success: false, error: 'A senha é obrigatória.' };
      }

      try {
        const users = await storageGetItem<StoredUser[]>(STORAGE_KEYS.USERS, []);
        const normalizedEmail = email.trim().toLowerCase();
        const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

        if (!found) {
          return { success: false, error: 'Credenciais incorretas. Verifique o e-mail e a senha.' };
        }

        const isMatch = await verifyPassword(password, found.salt, found.passwordHash);
        if (!isMatch) {
          return { success: false, error: 'Credenciais incorretas. Verifique o e-mail e a senha.' };
        }

        // Salva ID da sessão no SecureStore e atualiza estado
        await saveSessionUserId(found.id);
        const loggedUser: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          createdAt: found.createdAt,
        };
        setUser(loggedUser);
        return { success: true };
      } catch (error) {
        console.error('[AuthProvider] Erro no login:', error);
        return { success: false, error: 'Erro ao processar login. Tente novamente.' };
      }
    },
    []
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      // Validações
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        return { success: false, error: nameValidation.error };
      }

      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return { success: false, error: emailValidation.error };
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.error };
      }

      try {
        const users = await storageGetItem<StoredUser[]>(STORAGE_KEYS.USERS, []);
        const normalizedEmail = email.trim().toLowerCase();

        const alreadyExists = users.some((u) => u.email.toLowerCase() === normalizedEmail);
        if (alreadyExists) {
          return { success: false, error: 'Este e-mail já está cadastrado.' };
        }

        // Gera salt criptográfico e calcula hash SHA-256
        const salt = await generateSalt();
        const passwordHash = await hashPassword(password, salt);

        const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const newUser: StoredUser = {
          id: newUserId,
          name: name.trim(),
          email: normalizedEmail,
          salt,
          passwordHash,
          createdAt: new Date().toISOString(),
        };

        const updatedUsers = [...users, newUser];
        await storageSetItem(STORAGE_KEYS.USERS, updatedUsers);

        // Inicia a sessão automaticamente após o cadastro
        await saveSessionUserId(newUserId);
        const loggedUser: User = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        };
        setUser(loggedUser);
        return { success: true };
      } catch (error) {
        console.error('[AuthProvider] Erro no cadastro:', error);
        return { success: false, error: 'Erro ao cadastrar usuário. Tente novamente.' };
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await clearSessionUserId();
      setUser(null);
    } catch (error) {
      console.error('[AuthProvider] Erro no logout:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
