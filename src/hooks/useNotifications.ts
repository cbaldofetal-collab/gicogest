import { useState, useEffect, useCallback } from 'react';
import type { RemindersConfig } from '../types/glucose';
import { getRemindersConfig, saveRemindersConfig } from '../lib/db';
import {
  getRemindersConfigSupabase,
  saveRemindersConfigSupabase,
} from '../lib/supabase-db';

// Verificar se Supabase está configurado
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

export function useNotifications() {
  const [config, setConfig] = useState<RemindersConfig | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);
  const useSupabase = isSupabaseConfigured();

  // Verificar permissão de notificações
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Carregar configuração
  useEffect(() => {
    async function loadConfig() {
      try {
        let savedConfig: RemindersConfig | null = null;

        if (useSupabase) {
          try {
            savedConfig = await getRemindersConfigSupabase();
          } catch (supabaseError) {
            console.warn('Erro ao carregar do Supabase, usando local:', supabaseError);
            savedConfig = await getRemindersConfig();
          }
        } else {
          savedConfig = await getRemindersConfig();
        }

        if (savedConfig) {
          setConfig(savedConfig);
        } else {
          // Configuração padrão
          const defaultConfig: RemindersConfig = {
            jejum: { enabled: true, time: '07:00' },
            posCafe: { enabled: true, time: '09:00' },
            posAlmoco: { enabled: true, time: '13:00' },
            posJantar: { enabled: true, time: '20:00' },
          };
          setConfig(defaultConfig);
        }
      } catch (err) {
        console.error('Erro ao carregar configuração de lembretes:', err);
        // Configuração padrão em caso de erro
        const defaultConfig: RemindersConfig = {
          jejum: { enabled: true, time: '07:00' },
          posCafe: { enabled: true, time: '09:00' },
          posAlmoco: { enabled: true, time: '13:00' },
          posJantar: { enabled: true, time: '20:00' },
        };
        setConfig(defaultConfig);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, [useSupabase]);

  // Solicitar permissão
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações');
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }

    return false;
  }, []);

  // Salvar configuração
  const saveConfig = useCallback(
    async (newConfig: RemindersConfig) => {
      try {
        if (useSupabase) {
          try {
            await saveRemindersConfigSupabase(newConfig);
          } catch (supabaseError) {
            console.warn('Erro ao salvar no Supabase, usando local:', supabaseError);
            await saveRemindersConfig(newConfig);
          }
        } else {
          await saveRemindersConfig(newConfig);
        }
        setConfig(newConfig);
      } catch (err) {
        console.error('Erro ao salvar configuração:', err);
        throw err;
      }
    },
    [useSupabase]
  );

  // Criar notificação
  const showNotification = useCallback(
    (title: string, body: string) => {
      if (permission === 'granted' && 'Notification' in window) {
        new Notification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: 'glicogest-reminder',
        });
      }
    },
    [permission]
  );

  // Agendar lembretes
  useEffect(() => {
    if (!config || permission !== 'granted') return;

    const intervals: number[] = [];

    const scheduleReminder = (
      reminderKey: keyof RemindersConfig,
      label: string
    ) => {
      const reminder = config[reminderKey];
      if (!reminder.enabled) return;

      const [hours, minutes] = reminder.time.split(':').map(Number);
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // Se o horário já passou hoje, agendar para amanhã
      if (reminderTime < now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const msUntilReminder = reminderTime.getTime() - now.getTime();

      const timeoutId = window.setTimeout(() => {
        showNotification('Lembrete GlicoGest', `Hora de medir a glicemia: ${label}`);
        // Agendar para o próximo dia
        scheduleReminder(reminderKey, label);
      }, msUntilReminder);

      intervals.push(timeoutId);
    };

    scheduleReminder('jejum', 'Jejum');
    scheduleReminder('posCafe', 'Pós-Café');
    scheduleReminder('posAlmoco', 'Pós-Almoço');
    scheduleReminder('posJantar', 'Pós-Jantar');

    return () => {
      intervals.forEach((id) => clearTimeout(id));
    };
  }, [config, permission, showNotification]);

  return {
    config,
    permission,
    loading,
    requestPermission,
    saveConfig,
    showNotification,
  };
}
