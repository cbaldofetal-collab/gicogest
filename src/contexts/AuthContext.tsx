import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { LoginCredentials, RegisterCredentials, AuthState } from '../types/auth';
import { supabase } from '../lib/supabase';
import { clearAllLocalData } from '../lib/db';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Converter Supabase User para nosso tipo User
function mapSupabaseUserToUser(supabaseUser: SupabaseUser, profile?: { name: string; email: string } | null) {
  return {
    id: supabaseUser.id,
    name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
    email: supabaseUser.email || '',
    passwordHash: '', // Não armazenamos hash no frontend com Supabase
    createdAt: new Date(supabaseUser.created_at),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Verificar sessão existente ao carregar
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    async function checkSession() {
      try {
        // Timeout de segurança: se demorar mais de 5 segundos, parar de carregar
        timeoutId = setTimeout(() => {
          console.warn('Timeout ao verificar sessão, parando carregamento');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }, 5000);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        clearTimeout(timeoutId);

        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        if (session?.user) {
          try {
            // Buscar perfil do usuário (com timeout)
            const profilePromise = supabase
              .from('users')
              .select('name, email')
              .eq('id', session.user.id)
              .single();

            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 3000)
            );

            let profile = null;
            try {
              const { data, error: profileError } = await Promise.race([
                profilePromise,
                timeoutPromise,
              ]) as any;

              if (profileError && profileError.code !== 'PGRST116') {
                console.warn('Erro ao buscar perfil (não crítico):', profileError);
              } else {
                profile = data;
              }
            } catch (profileErr: any) {
              console.warn('Erro ou timeout ao buscar perfil (não crítico):', profileErr);
              // Continuar mesmo sem perfil
            }

            const user = mapSupabaseUserToUser(session.user, profile);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          } catch (profileErr) {
            console.error('Erro ao processar perfil:', profileErr);
            // Mesmo com erro, autenticar usando apenas dados do auth.user
            const user = mapSupabaseUserToUser(session.user, null);
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
        if (timeoutId) clearTimeout(timeoutId);
      }
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }

    checkSession().catch((err) => {
      console.error('Erro não tratado em checkSession:', err);
      if (timeoutId) clearTimeout(timeoutId);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Ouvir mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('name, email')
              .eq('id', session.user.id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Erro ao buscar perfil no onAuthStateChange:', profileError);
            }

            const user = mapSupabaseUserToUser(session.user, profile);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } catch (profileErr) {
            console.error('Erro ao processar perfil no onAuthStateChange:', profileErr);
            // Mesmo com erro no perfil, definir usuário autenticado
            const user = mapSupabaseUserToUser(session.user, null);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (err) {
        console.error('Erro em onAuthStateChange:', err);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
      try {
        console.log('Login: Iniciando processo de login...');
        
        // No Supabase, usamos email para login, mas podemos buscar por nome também
        // Primeiro, tentamos buscar o usuário pelo nome para obter o email
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('email')
          .eq('name', credentials.name.trim())
          .single();

        if (profileError) {
          console.error('Login: Erro ao buscar perfil:', profileError);
          console.error('Login: Detalhes do erro:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
          });
          
          // Se for erro de RLS, dar mensagem mais específica
          if (profileError.code === '42501' || profileError.message.includes('permission denied')) {
            return { success: false, message: 'Erro de permissão. Verifique as políticas RLS no Supabase.' };
          }
          
          return { success: false, message: 'Nome de usuário ou senha incorretos' };
        }

        if (!userProfile) {
          console.error('Login: Perfil não encontrado para o nome:', credentials.name);
          return { success: false, message: 'Nome de usuário ou senha incorretos' };
        }

        console.log('Login: Perfil encontrado, fazendo signIn...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: userProfile.email,
          password: credentials.password,
        });

        if (error) {
          console.error('Login: Erro no signIn:', error);
          
          // Mensagens de erro mais específicas
          if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            return { 
              success: false, 
              message: 'Email não confirmado. Verifique seu email ou contate o administrador.' 
            };
          }
          
          if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
            return { success: false, message: 'Nome de usuário ou senha incorretos' };
          }
          
          return { success: false, message: `Erro ao fazer login: ${error.message}` };
        }

        console.log('Login: SignIn bem-sucedido, verificando sessão...');
        
        // Aguardar um pouco para garantir que a sessão foi salva
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar se a sessão foi realmente salva
        const {
          data: { session: verifySession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !verifySession) {
          console.error('Login: Sessão não encontrada após login:', sessionError);
          return { success: false, message: 'Erro ao criar sessão. Tente novamente.' };
        }

        console.log('Login: Sessão verificada, buscando perfil...');
        
        if (data.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', data.user.id)
            .single();

          const user = mapSupabaseUserToUser(data.user, profile);
          console.log('Login: Usuário mapeado, atualizando estado:', user);
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          console.log('Login: Estado atualizado com sucesso');
        }

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
        // Verificar se email já existe
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', credentials.email.trim().toLowerCase())
          .single();

        if (existingUser) {
          return { success: false, message: 'Este email já está cadastrado' };
        }

        // Verificar se nome já existe
        const { data: existingName } = await supabase
          .from('users')
          .select('id')
          .eq('name', credentials.name.trim())
          .single();

        if (existingName) {
          return { success: false, message: 'Este nome de usuário já está em uso' };
        }

        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
          options: {
            data: {
              name: credentials.name.trim(),
            },
            emailRedirectTo: undefined, // Não redirecionar para confirmação
          },
        });

        if (authError) {
          return { success: false, message: authError.message || 'Erro ao criar conta. Tente novamente.' };
        }

        if (authData.user) {
          // O trigger no banco cria o perfil automaticamente, mas vamos atualizar o nome
          const { error: updateError } = await supabase
            .from('users')
            .update({ name: credentials.name.trim() })
            .eq('id', authData.user.id);

          if (updateError) {
            console.error('Erro ao atualizar perfil:', updateError);
          }

          const { data: profile } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', authData.user.id)
            .single();

          const user = mapSupabaseUserToUser(authData.user, profile);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        }

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
    try {
      // Limpar sessão do Supabase
      await supabase.auth.signOut();
      
      // Limpar dados locais (IndexedDB)
      await clearAllLocalData();
      
      // Limpar localStorage do Supabase
      const supabaseStorageKey = 'glicogest-auth';
      if (typeof window !== 'undefined') {
        // Limpar todas as chaves relacionadas ao Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.includes('supabase') || key === supabaseStorageKey) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Atualizar estado
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      console.log('Logout realizado com sucesso - dados limpos');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpar o estado
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
