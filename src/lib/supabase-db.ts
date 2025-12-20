import { supabase } from './supabase';
import type { GlucoseReading, RemindersConfig } from '../types/glucose';
import type { GlucoseType } from '../utils/constants';

/**
 * Funções para operações no banco de dados Supabase
 */

// ========== GLUCOSE READINGS ==========

export async function addReadingSupabase(
  reading: Omit<GlucoseReading, 'id'>
): Promise<number> {
  // Tentar getSession primeiro (mais rápido)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = session?.user || undefined;

  // Se não tiver sessão, tentar getUser
  if (!user) {
    const {
      data: { user: userData },
      error: userError,
    } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Erro ao obter usuário:', userError);
      throw new Error(`Usuário não autenticado: ${userError.message}`);
    }
    
    user = userData || undefined;
  }

  if (!user) {
    throw new Error('Usuário não autenticado. Faça login novamente.');
  }

  const { data, error } = await supabase
    .from('glucose_readings')
    .insert({
      user_id: user.id,
      value: reading.value,
      type: reading.type,
      date: reading.date.toISOString(),
      is_normal: reading.isNormal,
      notes: reading.notes || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Erro ao inserir no Supabase:', error);
    throw new Error(`Erro ao salvar: ${error.message} (${error.code || 'unknown'})`);
  }

  return data.id;
}

export async function getAllReadingsSupabase(): Promise<GlucoseReading[]> {
  // Tentar getSession primeiro (mais rápido)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let user = session?.user || undefined;

  // Se não tiver sessão, tentar getUser
  if (!user) {
    const {
      data: { user: userData },
      error: userError,
    } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('getAllReadingsSupabase: Erro ao obter usuário:', userError);
      // Lançar erro para que o hook use fallback local
      throw new Error(`Sessão não encontrada: ${userError.message}`);
    }
    
    user = userData || undefined;
  }

  if (!user) {
    console.warn('getAllReadingsSupabase: Usuário não autenticado');
    // Lançar erro para que o hook use fallback local
    throw new Error('Usuário não autenticado. Use armazenamento local.');
  }

  console.log('getAllReadingsSupabase: Buscando registros para usuário', user.id);

  const { data, error } = await supabase
    .from('glucose_readings')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('getAllReadingsSupabase: Erro ao buscar registros', error);
    console.error('Detalhes do erro:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Erro ao buscar registros: ${error.message} (${error.code || 'unknown'})`);
  }

  console.log('getAllReadingsSupabase: Registros encontrados', data?.length || 0, data);

  const readings: GlucoseReading[] = [];
  
  for (const reading of data || []) {
    try {
      readings.push({
        id: reading.id,
        value: reading.value,
        type: reading.type as GlucoseType,
        date: new Date(reading.date),
        isNormal: reading.is_normal,
        notes: reading.notes || undefined,
      });
    } catch (err) {
      console.error('Erro ao converter registro:', reading, err);
    }
  }

  console.log('getAllReadingsSupabase: Registros convertidos', readings.length);
  return readings;
}

export async function getReadingsByDateRangeSupabase(
  startDate: Date,
  endDate: Date
): Promise<GlucoseReading[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('glucose_readings')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString())
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return (
    data?.map((reading) => ({
      id: reading.id,
      value: reading.value,
      type: reading.type as GlucoseType,
      date: new Date(reading.date),
      isNormal: reading.is_normal,
      notes: reading.notes || undefined,
    })) || []
  );
}

export async function deleteReadingSupabase(id: number): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('glucose_readings')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}

export async function updateReadingSupabase(
  id: number,
  updates: Partial<GlucoseReading>
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const updateData: any = {};

  if (updates.value !== undefined) updateData.value = updates.value;
  if (updates.type !== undefined) updateData.type = updates.type;
  if (updates.date !== undefined) updateData.date = updates.date.toISOString();
  if (updates.isNormal !== undefined) updateData.is_normal = updates.isNormal;
  if (updates.notes !== undefined) updateData.notes = updates.notes || null;

  const { error } = await supabase
    .from('glucose_readings')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }
}

// ========== REMINDERS CONFIG ==========

export async function saveRemindersConfigSupabase(
  config: RemindersConfig
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { error } = await supabase
    .from('reminders_config')
    .upsert(
      {
        user_id: user.id,
        config: config as any,
      },
      {
        onConflict: 'user_id',
      }
    );

  if (error) {
    throw error;
  }
}

export async function getRemindersConfigSupabase(): Promise<RemindersConfig | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('reminders_config')
    .select('config')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Nenhum registro encontrado
      return null;
    }
    throw error;
  }

  return data?.config as RemindersConfig | null;
}

