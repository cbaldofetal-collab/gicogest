import { useState, useEffect, useCallback } from 'react';
import type { GlucoseReading, GlucoseStats } from '../types/glucose';
import type { GlucoseType } from '../utils/constants';
import { isGlucoseNormal } from '../utils/constants';
import {
  addReading as addReadingLocal,
  getAllReadings as getAllReadingsLocal,
  deleteReading as deleteReadingLocal,
  updateReading as updateReadingLocal,
} from '../lib/db';
import {
  addReadingSupabase,
  getAllReadingsSupabase,
  deleteReadingSupabase,
  updateReadingSupabase,
} from '../lib/supabase-db';

// Verificar se Supabase está configurado
const isSupabaseConfigured = () => {
  return !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
};

export function useGlucose() {
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const useSupabase = isSupabaseConfigured();

  // Carregar todos os registros
  const loadReadings = useCallback(async () => {
    try {
      setLoading(true);
      console.log('loadReadings: Iniciando carregamento, useSupabase:', useSupabase);
      
      if (useSupabase) {
        try {
          // Tentar carregar do Supabase
          const supabaseData = await getAllReadingsSupabase();
          console.log('loadReadings: Dados do Supabase carregados', supabaseData.length, 'registros');
          
          // Se conseguiu carregar do Supabase (mesmo que vazio), usar esses dados
          setReadings(supabaseData);
          setError(null);
          
          // Também carregar dados locais para sincronizar (em background)
          try {
            const localData = await getAllReadingsLocal();
            console.log('loadReadings: Dados locais também carregados', localData.length, 'registros');
            
            // Se houver dados locais que não estão no Supabase, adicionar
            if (localData.length > 0 && supabaseData.length === 0) {
              console.log('loadReadings: Usando dados locais (Supabase vazio)');
              setReadings(localData);
            }
          } catch (localErr) {
            console.warn('loadReadings: Erro ao carregar dados locais (não crítico):', localErr);
          }
        } catch (supabaseErr) {
          // Se Supabase falhar, usar dados locais
          console.warn('loadReadings: Erro ao carregar do Supabase, usando dados locais:', supabaseErr);
          const localData = await getAllReadingsLocal();
          console.log('loadReadings: Dados locais carregados (fallback)', localData.length, 'registros');
          setReadings(localData);
          setError(null); // Não mostrar erro se conseguiu carregar localmente
        }
      } else {
        // Sem Supabase, usar apenas local
        const data = await getAllReadingsLocal();
        console.log('loadReadings: Dados locais carregados', data.length, 'registros');
        setReadings(data);
        setError(null);
      }
    } catch (err) {
      console.error('loadReadings: Erro crítico ao carregar', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar registros'));
      setReadings([]); // Garantir que readings seja um array vazio em caso de erro
    } finally {
      setLoading(false);
    }
  }, [useSupabase]);

  // Adicionar novo registro
  const createReading = useCallback(
    async (value: number, type: GlucoseType, date: Date = new Date(), notes?: string) => {
      try {
        const isNormal = isGlucoseNormal(type, value);
        const newReading: Omit<GlucoseReading, 'id'> = {
          value,
          type,
          date,
          isNormal,
          notes,
        };

        if (useSupabase) {
          try {
            console.log('createReading: Salvando no Supabase', newReading);
            const id = await addReadingSupabase(newReading);
            console.log('createReading: Salvo com sucesso, ID:', id);
            // Aguardar um pouco para garantir que o banco processou
            await new Promise(resolve => setTimeout(resolve, 500));
            await loadReadings();
            console.log('createReading: Dados recarregados após salvar');
            return id;
          } catch (supabaseError) {
            // Fallback para local se Supabase falhar
            console.warn('Erro ao salvar no Supabase, usando armazenamento local:', supabaseError);
            const id = await addReadingLocal(newReading);
            await loadReadings();
            return id;
          }
        } else {
          const id = await addReadingLocal(newReading);
          await loadReadings();
          return id;
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao adicionar registro'));
        throw err;
      }
    },
    [loadReadings, useSupabase]
  );

  // Remover registro
  const removeReading = useCallback(
    async (id: number) => {
      try {
        if (useSupabase) {
          try {
            await deleteReadingSupabase(id);
          } catch (supabaseError) {
            console.warn('Erro ao deletar no Supabase, usando local:', supabaseError);
            await deleteReadingLocal(id);
          }
        } else {
          await deleteReadingLocal(id);
        }
        await loadReadings();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao remover registro'));
        throw err;
      }
    },
    [loadReadings, useSupabase]
  );

  // Atualizar registro
  const editReading = useCallback(
    async (id: number, updates: Partial<GlucoseReading>) => {
      try {
        // Recalcular isNormal se value ou type mudaram
        if (updates.value !== undefined || updates.type !== undefined) {
          const reading = readings.find((r) => r.id === id);
          if (reading) {
            const value = updates.value ?? reading.value;
            const type = updates.type ?? reading.type;
            updates.isNormal = isGlucoseNormal(type, value);
          }
        }

        if (useSupabase) {
          try {
            await updateReadingSupabase(id, updates);
          } catch (supabaseError) {
            console.warn('Erro ao atualizar no Supabase, usando local:', supabaseError);
            await updateReadingLocal(id, updates);
          }
        } else {
          await updateReadingLocal(id, updates);
        }
        await loadReadings();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao atualizar registro'));
        throw err;
      }
    },
    [readings, loadReadings, useSupabase]
  );

  // Calcular estatísticas
  const getStats = useCallback((): GlucoseStats => {
    const totalReadings = readings.length;
    const normalReadings = readings.filter((r) => r.isNormal).length;
    const abnormalReadings = totalReadings - normalReadings;
    const percentageInTarget =
      totalReadings > 0 ? (normalReadings / totalReadings) * 100 : 0;

    const values = readings.map((r) => r.value);
    const averageValue =
      values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const minValue = values.length > 0 ? Math.min(...values) : 0;
    const maxValue = values.length > 0 ? Math.max(...values) : 0;

    // Estatísticas por tipo
    const byType: GlucoseStats['byType'] = {
      JEJUM: { total: 0, normal: 0, abnormal: 0, percentageNormal: 0 },
      POS_CAFE: { total: 0, normal: 0, abnormal: 0, percentageNormal: 0 },
      POS_ALMOCO: { total: 0, normal: 0, abnormal: 0, percentageNormal: 0 },
      POS_JANTAR: { total: 0, normal: 0, abnormal: 0, percentageNormal: 0 },
    };

    readings.forEach((reading) => {
      const stats = byType[reading.type];
      stats.total++;
      if (reading.isNormal) {
        stats.normal++;
      } else {
        stats.abnormal++;
      }
      stats.percentageNormal =
        stats.total > 0 ? (stats.normal / stats.total) * 100 : 0;
    });

    return {
      totalReadings,
      normalReadings,
      abnormalReadings,
      percentageInTarget,
      averageValue,
      minValue,
      maxValue,
      byType,
    };
  }, [readings]);

  useEffect(() => {
    loadReadings().catch((err) => {
      console.error('Erro ao carregar leituras no useEffect:', err);
      setError(err instanceof Error ? err : new Error('Erro ao carregar registros'));
    });
  }, [loadReadings]);

  return {
    readings,
    loading,
    error,
    createReading,
    removeReading,
    editReading,
    loadReadings,
    getStats,
  };
}
