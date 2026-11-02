export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface StoredUser extends User {
  salt: string;
  passwordHash: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}
