import Dexie, { type Table } from 'dexie';
import type { GlucoseReading, RemindersConfig } from '../types/glucose';
import type { User } from '../types/auth';

/**
 * Database class usando Dexie.js para IndexedDB
 */
class GlucoseDatabase extends Dexie {
  readings!: Table<GlucoseReading, number>;
  reminders!: Table<{ id: string; config: RemindersConfig }, string>;
  users!: Table<User, string>;
  session!: Table<{ id: string; userId: string; expiresAt: number }, string>;

  constructor() {
    super('GlicoGestDB');
    
    this.version(1).stores({
      readings: '++id, date, type, value',
      reminders: 'id',
    });

    this.version(2).stores({
      readings: '++id, date, type, value',
      reminders: 'id',
      users: 'id, name',
      session: 'id',
    });

    this.version(3).stores({
      readings: '++id, date, type, value',
      reminders: 'id',
      users: 'id, name, email',
      session: 'id',
    });
  }
}

export const db = new GlucoseDatabase();

/**
 * Funções auxiliares para operações no banco
 */
export async function addReading(reading: Omit<GlucoseReading, 'id'>): Promise<number> {
  // Converter Date para timestamp para armazenamento
  const readingToStore = {
    ...reading,
    date: reading.date instanceof Date ? reading.date.getTime() : reading.date,
  };
  return await db.readings.add(readingToStore as any);
}

export async function getAllReadings(): Promise<GlucoseReading[]> {
  const readings = await db.readings.orderBy('date').reverse().toArray();
  // Converter timestamps de volta para Date
  return readings.map((reading) => ({
    ...reading,
    date: reading.date instanceof Date ? reading.date : new Date(reading.date as any),
  }));
}

export async function getReadingsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<GlucoseReading[]> {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const readings = await db.readings
    .where('date')
    .between(start, end, true, true)
    .sortBy('date');
  // Converter timestamps de volta para Date
  return readings.map((reading) => ({
    ...reading,
    date: reading.date instanceof Date ? reading.date : new Date(reading.date as any),
  }));
}

export async function deleteReading(id: number): Promise<void> {
  await db.readings.delete(id);
}

export async function updateReading(
  id: number,
  updates: Partial<GlucoseReading>
): Promise<void> {
  await db.readings.update(id, updates);
}

export async function saveRemindersConfig(config: RemindersConfig): Promise<void> {
  await db.reminders.put({ id: 'main', config });
}

export async function getRemindersConfig(): Promise<RemindersConfig | null> {
  const result = await db.reminders.get('main');
  return result?.config || null;
}

// Funções de autenticação
export async function createUser(name: string, email: string, passwordHash: string): Promise<string> {
  const userId = crypto.randomUUID();
  const user: User = {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    createdAt: new Date(),
  };
  await db.users.add(user);
  return userId;
}

export async function getUserByName(name: string): Promise<User | undefined> {
  return await db.users.where('name').equals(name.trim()).first();
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return await db.users.where('email').equals(email.trim().toLowerCase()).first();
}

export async function getUserById(id: string): Promise<User | undefined> {
  return await db.users.get(id);
}

export async function saveSession(userId: string): Promise<void> {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 dias
  await db.session.put({ id: 'current', userId, expiresAt });
}

export async function getSession(): Promise<{ userId: string; expiresAt: number } | null> {
  const session = await db.session.get('current');
  if (!session) return null;
  
  // Verificar se a sessão expirou
  if (session.expiresAt < Date.now()) {
    await db.session.delete('current');
    return null;
  }
  
  return session;
}

export async function clearSession(): Promise<void> {
  await db.session.delete('current');
}

