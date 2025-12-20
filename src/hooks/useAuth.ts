import { useState, useEffect, useCallback } from 'react';
import type { LoginCredentials, RegisterCredentials, AuthState } from '../types/auth';
import {
  createUser,
  getUserByName,
  getUserByEmail,
  saveSession,
  getSession,
  clearSession,
  getUserById,
} from '../lib/db';
import { hashPassword, verifyPassword, validatePasswordFormat, validateName, validateEmail } from '../lib/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Verificar sessão existente ao carregar
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession();
        if (session) {
          const user = await getUserById(session.userId);
          if (user) {
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      }
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
    checkSession();
  }, []);

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
      try {
        // Validar nome
        const nameValidation = validateName(credentials.name);
        if (!nameValidation.isValid) {
          return { success: false, message: nameValidation.message };
        }

        // Buscar usuário
        const user = await getUserByName(credentials.name);
        if (!user) {
          return { success: false, message: 'Nome de usuário ou senha incorretos' };
        }

        // Verificar senha
        const isValidPassword = await verifyPassword(credentials.password, user.passwordHash);
        if (!isValidPassword) {
          return { success: false, message: 'Nome de usuário ou senha incorretos' };
        }

        // Salvar sessão
        await saveSession(user.id);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        console.error('Erro no login:', error);
        return { success: false, message: 'Erro ao fazer login. Tente novamente.' };
      }
    },
    []
  );

  // Registro (primeiro acesso)
  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<{ success: boolean; message?: string }> => {
      try {
        // Validar nome
        const nameValidation = validateName(credentials.name);
        if (!nameValidation.isValid) {
          return { success: false, message: nameValidation.message };
        }

        // Validar email
        const emailValidation = validateEmail(credentials.email);
        if (!emailValidation.isValid) {
          return { success: false, message: emailValidation.message };
        }

        // Validar senha
        const passwordValidation = validatePasswordFormat(credentials.password);
        if (!passwordValidation.isValid) {
          return { success: false, message: passwordValidation.message };
        }

        // Verificar se nome de usuário já existe
        const existingUserByName = await getUserByName(credentials.name);
        if (existingUserByName) {
          return { success: false, message: 'Este nome de usuário já está em uso' };
        }

        // Verificar se email já existe
        const existingUserByEmail = await getUserByEmail(credentials.email);
        if (existingUserByEmail) {
          return { success: false, message: 'Este email já está cadastrado' };
        }

        // Criar hash da senha
        const passwordHash = await hashPassword(credentials.password);

        // Criar usuário
        const userId = await createUser(credentials.name, credentials.email, passwordHash);

        // Buscar usuário criado
        const user = await getUserById(userId);
        if (!user) {
          return { success: false, message: 'Erro ao criar usuário' };
        }

        // Salvar sessão
        await saveSession(user.id);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } catch (error) {
        console.error('Erro no registro:', error);
        return { success: false, message: 'Erro ao criar conta. Tente novamente.' };
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async () => {
    await clearSession();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
  };
}

