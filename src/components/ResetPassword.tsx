import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'A senha deve ter no mínimo 6 caracteres')
      .regex(/^[a-zA-Z0-9]+$/, 'A senha deve conter apenas letras e números (alfanumérica)')
      .refine((val) => /[a-zA-Z]/.test(val), 'A senha deve conter pelo menos uma letra')
      .refine((val) => /[0-9]/.test(val), 'A senha deve conter pelo menos um número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    // Processar o hash de recuperação do Supabase
    const processHash = async () => {
      try {
        const hash = window.location.hash;
        const searchParams = new URLSearchParams(window.location.search);
        
        console.log('ResetPassword: Processando hash...', { hash: hash.substring(0, 50) + '...' });
        
        // Verificar se há erros na URL (link expirado, inválido, etc.)
        const error = searchParams.get('error') || (hash.includes('error=') ? hash.split('error=')[1]?.split('&')[0] : null);
        const errorCode = searchParams.get('error_code') || (hash.includes('error_code=') ? hash.split('error_code=')[1]?.split('&')[0] : null);
        
        if (error || errorCode) {
          console.error('ResetPassword: Erro na URL:', { error, errorCode });
          
          let errorMessage = 'Link de recuperação inválido ou expirado.';
          
          if (errorCode === 'otp_expired' || error?.includes('expired')) {
            errorMessage = 'O link de recuperação expirou. Por favor, solicite um novo link.';
          } else if (errorCode === 'access_denied' || error?.includes('access_denied')) {
            errorMessage = 'Acesso negado. O link pode ter sido usado ou expirado. Solicite um novo link.';
          }
          
          setError(errorMessage);
          setLoading(false);
          return;
        }
        
        if (hash.includes('access_token') && hash.includes('type=recovery')) {
          console.log('ResetPassword: Hash de recuperação detectado, processando...');
          
          // Extrair o access_token do hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            console.log('ResetPassword: Token encontrado no hash, configurando sessão...');
            
            // Configurar a sessão manualmente usando o token com timeout
            try {
              const setSessionPromise = supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout ao configurar sessão')), 10000);
              });
              
              const { data: { session }, error: sessionError } = await Promise.race([
                setSessionPromise,
                timeoutPromise,
              ]) as any;
              
              console.log('ResetPassword: Resultado do setSession:', { 
                hasSession: !!session, 
                hasUser: !!session?.user,
                error: sessionError?.message 
              });
              
              if (sessionError) {
                console.error('ResetPassword: Erro ao configurar sessão:', sessionError);
                // Mesmo com erro, permitir continuar - o token pode ser válido
                console.log('ResetPassword: Continuando mesmo com erro de sessão...');
              }
              
              if (session && session.user) {
                console.log('ResetPassword: Sessão configurada com sucesso, usuário:', session.user.email);
                setLoading(false);
                return;
              }
              
              // Se não conseguiu sessão, verificar se consegue obter usuário
              const { data: { user }, error: userError } = await supabase.auth.getUser();
              if (user && !userError) {
                console.log('ResetPassword: Usuário obtido via getUser após setSession');
                setLoading(false);
                return;
              }
              
              // Se chegou aqui, não conseguiu sessão nem usuário, mas permite continuar
              console.log('ResetPassword: Não conseguiu confirmar sessão, mas permitindo continuar');
              setLoading(false);
              return;
            } catch (setSessionError: any) {
              console.error('ResetPassword: Erro ao setSession:', setSessionError);
              // Mesmo com erro ou timeout, permitir continuar
              console.log('ResetPassword: Continuando mesmo com erro/timeout de setSession...');
              setLoading(false);
              return;
            }
          } else {
            console.error('ResetPassword: accessToken não encontrado no hash');
            setError('Link de recuperação inválido. Por favor, solicite um novo link.');
            setLoading(false);
            return;
          }
          
          // Fallback: tentar obter a sessão (caso o Supabase já tenha processado)
          let attempts = 0;
          const maxAttempts = 3;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
              console.log('ResetPassword: Sessão encontrada, usuário autenticado');
              setLoading(false);
              return;
            }
            
            attempts++;
            console.log(`ResetPassword: Tentativa ${attempts}/${maxAttempts} - aguardando processamento do hash...`);
          }
          
          // Se chegou aqui, não conseguiu processar o hash
          console.error('ResetPassword: Não foi possível processar o hash após várias tentativas');
          // Mesmo assim, permitir que o usuário tente atualizar a senha
          // O Supabase pode processar o hash quando tentar atualizar
          console.log('ResetPassword: Permitindo continuar mesmo sem sessão confirmada');
          setLoading(false);
        } else {
          console.error('ResetPassword: Hash de recuperação não encontrado na URL');
          setError('Link de recuperação inválido ou expirado. Por favor, solicite um novo link.');
          setLoading(false);
        }
      } catch (err) {
        console.error('ResetPassword: Erro ao processar hash:', err);
        setError('Erro ao processar link de recuperação. Tente novamente.');
        setLoading(false);
      }
    };

    processHash();
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setSubmitting(true);
      setError(null);
      
      console.log('ResetPassword: Iniciando atualização de senha...');

      // Adicionar timeout para evitar travamento
      const updatePasswordPromise = (async () => {
        // Processar o hash novamente antes de atualizar (caso não tenha sido processado)
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            console.log('ResetPassword: Processando hash antes de atualizar senha...');
            try {
              // Tentar setSession com timeout curto
              const setSessionPromise = supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
              });
              
              const sessionTimeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout')), 5000);
              });
              
              await Promise.race([setSessionPromise, sessionTimeout]).catch(() => {
                console.log('ResetPassword: setSession demorou, mas continuando...');
              });
            } catch (err) {
              console.log('ResetPassword: Erro ao processar hash, mas continuando...', err);
            }
          }
        }

        console.log('ResetPassword: Tentando atualizar senha diretamente...');

        // Verificar conectividade primeiro
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          await fetch('https://xlwholcjpfahxgzbxhsu.supabase.co/rest/v1/', {
            method: 'HEAD',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          console.log('ResetPassword: Conectividade com Supabase OK');
        } catch (healthError) {
          console.warn('ResetPassword: Problema de conectividade com Supabase:', healthError);
          throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.');
        }

        // Atualizar a senha diretamente - o Supabase processa o token automaticamente
        console.log('ResetPassword: Chamando updateUser...');
        const updatePromise = supabase.auth.updateUser({
          password: data.password,
        });
        
        const updateTimeout = new Promise((_, reject) => {
          setTimeout(() => {
            console.error('ResetPassword: Timeout após 30 segundos');
            reject(new Error('Timeout: A atualização está demorando muito. Isso pode indicar:\n1. Problema de conexão com o servidor\n2. Token expirado (solicite um novo link)\n3. Problema temporário no Supabase\n\nPor favor, verifique sua conexão e tente novamente. Se o problema persistir, solicite um novo link de recuperação.'));
          }, 30000);
        });
        
        const result = await Promise.race([
          updatePromise,
          updateTimeout,
        ]) as any;
        
        const { error: updateError } = result || {};

        if (updateError) {
          console.error('ResetPassword: Erro ao atualizar senha:', updateError);
          
          // Traduzir mensagens de erro comuns do Supabase
          let errorMessage = updateError.message || 'Erro ao atualizar senha. Tente novamente.';
          
          if (updateError.message?.includes('New password should be different from the old password')) {
            errorMessage = 'A nova senha deve ser diferente da senha atual. Por favor, escolha uma senha diferente.';
          } else if (updateError.message?.includes('Password should be at least')) {
            errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
          } else if (updateError.message?.includes('invalid') || updateError.message?.includes('expired')) {
            errorMessage = 'Link de recuperação inválido ou expirado. Por favor, solicite um novo link.';
          }
          
          throw new Error(errorMessage);
        }

        console.log('ResetPassword: Senha atualizada com sucesso!');
        return true;
      })();
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: A atualização está demorando muito. Verifique sua conexão e tente novamente.')), 30000);
      });
      
      await Promise.race([updatePasswordPromise, timeoutPromise]);
      
      setSuccess(true);
      form.reset();

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err: any) {
      console.error('ResetPassword: Erro inesperado:', err);
      const errorMessage = err?.message || 'Erro inesperado. Tente novamente.';
      setError(errorMessage);
    } finally {
      // Garantir que sempre desativa o estado de loading
      console.log('ResetPassword: Finalizando submit, desativando loading...');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Verificando link de recuperação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-success-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Senha Atualizada!</CardTitle>
            <CardDescription>Redirecionando para o login...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>Digite sua nova senha abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 bg-danger-50 border border-danger-200 rounded-md">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-danger-800">{error}</p>
                </div>
                <div className="mt-3 text-center">
                  <a
                    href="/"
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium"
                  >
                    ← Voltar para o login e solicitar um novo link
                  </a>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua nova senha"
                {...form.register('password')}
                autoComplete="new-password"
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-danger-600">{form.formState.errors.password.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Mínimo 6 caracteres, letras e números (alfanumérica)
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite novamente sua nova senha"
                {...form.register('confirmPassword')}
                autoComplete="new-password"
              />
              {form.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger-600">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                'Atualizando...'
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Atualizar Senha
                </>
              )}
            </Button>

            <div className="text-center">
              <a
                href="/"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

