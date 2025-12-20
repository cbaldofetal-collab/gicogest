import type { GlucoseType } from '../utils/constants';

/**
 * Registro de medição de glicemia
 */
export interface GlucoseReading {
  id?: number;
  value: number; // mg/dL
  type: GlucoseType;
  date: Date;
  isNormal: boolean;
  notes?: string;
}

/**
 * Configuração de lembretes
 */
export interface ReminderConfig {
  enabled: boolean;
  time: string; // HH:mm format
}

export interface RemindersConfig {
  jejum: ReminderConfig;
  posCafe: ReminderConfig;
  posAlmoco: ReminderConfig;
  posJantar: ReminderConfig;
}

/**
 * Estatísticas de glicemia
 */
export interface GlucoseStats {
  totalReadings: number;
  normalReadings: number;
  abnormalReadings: number;
  percentageInTarget: number;
  averageValue: number;
  minValue: number;
  maxValue: number;
  byType: {
    [key in GlucoseType]: {
      total: number;
      normal: number;
      abnormal: number;
      percentageNormal: number;
    };
  };
}

