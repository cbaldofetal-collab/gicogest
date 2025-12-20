-- Schema do banco de dados GlicoGest para Supabase

-- Tabela de usuários (extensão da auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leituras de glicemia
CREATE TABLE IF NOT EXISTS public.glucose_readings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 20 AND value <= 600),
  type TEXT NOT NULL CHECK (type IN ('JEJUM', 'POS_CAFE', 'POS_ALMOCO', 'POS_JANTAR')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_normal BOOLEAN NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configuração de lembretes
CREATE TABLE IF NOT EXISTS public.reminders_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_id ON public.glucose_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_glucose_readings_date ON public.glucose_readings(date DESC);
CREATE INDEX IF NOT EXISTS idx_glucose_readings_user_date ON public.glucose_readings(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_reminders_config_user_id ON public.reminders_config(user_id);

-- RLS (Row Level Security) - Políticas de segurança

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders_config ENABLE ROW LEVEL SECURITY;

-- Políticas para users
-- Permitir buscar por nome/email para login (sem autenticação)
CREATE POLICY "Anyone can search users by name for login"
  ON public.users FOR SELECT
  USING (true);

-- Permitir atualizar apenas o próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para glucose_readings
CREATE POLICY "Users can view own readings"
  ON public.glucose_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own readings"
  ON public.glucose_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own readings"
  ON public.glucose_readings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own readings"
  ON public.glucose_readings FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para reminders_config
CREATE POLICY "Users can view own reminders config"
  ON public.reminders_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders config"
  ON public.reminders_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders config"
  ON public.reminders_config FOR UPDATE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_reminders_config_updated_at
  BEFORE UPDATE ON public.reminders_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil de usuário automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil quando usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

