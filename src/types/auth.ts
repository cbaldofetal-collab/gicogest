export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Hash da senha, não a senha em texto plano
  createdAt: Date;
}

export interface LoginCredentials {
  name: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

