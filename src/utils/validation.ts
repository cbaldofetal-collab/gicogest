import { z } from 'zod';
import { GLUCOSE_REFERENCE_VALUES } from './constants';
import type { GlucoseType } from './constants';

/**
 * Schema de validação para registro de glicemia
 */
export const glucoseReadingSchema = z.object({
  value: z
    .number()
    .min(20, 'Valor muito baixo (mínimo 20 mg/dL)')
    .max(600, 'Valor muito alto (máximo 600 mg/dL)'),
  type: z.enum(['JEJUM', 'POS_CAFE', 'POS_ALMOCO', 'POS_JANTAR']),
  date: z.date(),
  notes: z.string().optional(),
});

export type GlucoseReadingFormData = z.infer<typeof glucoseReadingSchema>;

/**
 * Valida um valor de glicemia baseado no tipo
 */
export function validateGlucoseValue(
  type: GlucoseType,
  value: number
): { isValid: boolean; message?: string } {
  const reference = GLUCOSE_REFERENCE_VALUES[type];
  
  if (value < 20 || value > 600) {
    return {
      isValid: false,
      message: 'Valor fora do range esperado (20-600 mg/dL)',
    };
  }
  
  if (type === 'JEJUM' && value >= reference.max) {
    return {
      isValid: false,
      message: `Valor acima da meta para jejum (meta: < ${reference.max} mg/dL)`,
    };
  }
  
  if (type !== 'JEJUM' && value > reference.max) {
    return {
      isValid: false,
      message: `Valor acima da meta para ${reference.label.toLowerCase()} (meta: ≤ ${reference.max} mg/dL)`,
    };
  }
  
  return { isValid: true };
}

