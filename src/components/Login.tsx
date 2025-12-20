import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LogIn, UserPlus, AlertCircle, Mail } from 'lucide-react';

const loginSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres'),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .regex(/^[a-zA-Z0-9]+$/, 'A senha deve conter apenas letras e números (alfanumérica)')
    .refine((val) => /[a-zA-Z]/.test(val), 'A senha deve conter pelo menos uma letra')
    .refine((val) => /[0-9]/.test(val), 'A senha deve conter pelo menos um número'),
});

const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres'),
  email: z
    .string()
    .email('Digite um email válido')
    .toLowerCase(),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .regex(/^[a-zA-Z0-9]+$/, 'A senha deve conter apenas letras e números (alfanumérica)')
    .refine((val) => /[a-zA-Z]/.test(val), 'A senha deve conter pelo menos uma letra')
    .refine((val) => /[0-9]/.test(val), 'A senha deve conter pelo menos um número'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function Login() {
  const { login, register: registerUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const result = await login({ name: data.name, password: data.password });

      if (!result.success) {
        setError(result.message || 'Erro ao processar. Tente novamente.');
      } else {
        loginForm.reset();
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (!result.success) {
        setError(result.message || 'Erro ao processar. Tente novamente.');
      } else {
        registerForm.reset();
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">G</span>
          </div>
          <CardTitle className="text-2xl">GlicoGest</CardTitle>
          <CardDescription>
            {isLogin ? 'Faça login para continuar' : 'Crie sua conta para começar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-danger-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de Usuário
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  {...loginForm.register('name')}
                  autoComplete="username"
                />
                {loginForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{loginForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  {...loginForm.register('password')}
                  autoComplete="current-password"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-danger-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  'Processando...'
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 bg-danger-50 border border-danger-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-danger-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de Usuário
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  {...registerForm.register('name')}
                  autoComplete="username"
                />
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-danger-600">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    {...registerForm.register('email')}
                    autoComplete="email"
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-danger-600">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  {...registerForm.register('password')}
                  autoComplete="new-password"
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-danger-600">{registerForm.formState.errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo 6 caracteres, letras e números (alfanumérica)
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
                  'Processando...'
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>
          )}

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
            >
              {isLogin
                ? 'Não tem uma conta? Criar conta'
                : 'Já tem uma conta? Fazer login'}
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

