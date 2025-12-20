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
          
          // O Supabase processa automaticamente o hash quando detecta na URL
          // Tentar obter a sessão primeiro para garantir que o hash foi processado
          let attempts = 0;
          const maxAttempts = 5;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session && session.user) {
              console.log('ResetPassword: Sessão encontrada, usuário autenticado');
              setLoading(false);
              return;
            }
            
            // Tentar getUser como fallback
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (user && !userError) {
              console.log('ResetPassword: Usuário encontrado via getUser');
              setLoading(false);
              return;
            }
            
            attempts++;
            console.log(`ResetPassword: Tentativa ${attempts}/${maxAttempts} - aguardando processamento do hash...`);
          }
          
          // Se chegou aqui, não conseguiu processar o hash
          console.error('ResetPassword: Não foi possível processar o hash após várias tentativas');
          setError('Não foi possível processar o link de recuperação. Por favor, solicite um novo link.');
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

      // Verificar se há um usuário autenticado (o hash já foi processado)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Erro ao verificar usuário:', userError);
        setError('Sessão inválida. Por favor, use o link do email novamente.');
        setSubmitting(false);
        return;
      }

      // Atualizar a senha usando o Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        console.error('Erro ao atualizar senha:', updateError);
        
        // Traduzir mensagens de erro comuns do Supabase
        let errorMessage = updateError.message || 'Erro ao atualizar senha. Tente novamente.';
        
        if (updateError.message?.includes('New password should be different from the old password')) {
          errorMessage = 'A nova senha deve ser diferente da senha atual. Por favor, escolha uma senha diferente.';
        } else if (updateError.message?.includes('Password should be at least')) {
          errorMessage = 'A senha deve ter no mínimo 6 caracteres.';
        } else if (updateError.message?.includes('invalid') || updateError.message?.includes('expired')) {
          errorMessage = 'Link de recuperação inválido ou expirado. Por favor, solicite um novo link.';
        }
        
        setError(errorMessage);
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      form.reset();

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado. Tente novamente.');
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

