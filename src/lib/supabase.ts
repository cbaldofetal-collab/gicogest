import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente - você precisará configurar no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase não configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  );
  console.warn('URL:', supabaseUrl || 'NÃO CONFIGURADO');
  console.warn('Key:', supabaseAnonKey ? 'Configurado' : 'NÃO CONFIGURADO');
} else {
  console.log('✅ Supabase configurado:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'glicogest-auth',
  },
});

// Tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
      };
      glucose_readings: {
        Row: {
          id: number;
          user_id: string;
          value: number;
          type: 'JEJUM' | 'POS_CAFE' | 'POS_ALMOCO' | 'POS_JANTAR';
          date: string;
          is_normal: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          value: number;
          type: 'JEJUM' | 'POS_CAFE' | 'POS_ALMOCO' | 'POS_JANTAR';
          date: string;
          is_normal: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          value?: number;
          type?: 'JEJUM' | 'POS_CAFE' | 'POS_ALMOCO' | 'POS_JANTAR';
          date?: string;
          is_normal?: boolean;
          notes?: string | null;
          created_at?: string;
        };
      };
      reminders_config: {
        Row: {
          id: string;
          user_id: string;
          config: {
            jejum: { enabled: boolean; time: string };
            posCafe: { enabled: boolean; time: string };
            posAlmoco: { enabled: boolean; time: string };
            posJantar: { enabled: boolean; time: string };
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          config: {
            jejum: { enabled: boolean; time: string };
            posCafe: { enabled: boolean; time: string };
            posAlmoco: { enabled: boolean; time: string };
            posJantar: { enabled: boolean; time: string };
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          config?: {
            jejum?: { enabled: boolean; time: string };
            posCafe?: { enabled: boolean; time: string };
            posAlmoco?: { enabled: boolean; time: string };
            posJantar?: { enabled: boolean; time: string };
          };
          updated_at?: string;
        };
      };
    };
  };
}

