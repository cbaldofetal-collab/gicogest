/**
 * Valores de normalidade para glicemia em diabetes gestacional
 */
export const GLUCOSE_REFERENCE_VALUES = {
  JEJUM: {
    max: 92, // mg/dL - abaixo de 92
    label: 'Jejum',
  },
  POS_CAFE: {
    max: 140, // mg/dL - até 140
    label: 'Pós-Café',
  },
  POS_ALMOCO: {
    max: 140, // mg/dL - até 140 (1 hora após)
    label: 'Pós-Almoço',
  },
  POS_JANTAR: {
    max: 140, // mg/dL - até 140 (1 hora após)
    label: 'Pós-Jantar',
  },
} as const;

export type GlucoseType = keyof typeof GLUCOSE_REFERENCE_VALUES;

export const GLUCOSE_TYPES: GlucoseType[] = [
  'JEJUM',
  'POS_CAFE',
  'POS_ALMOCO',
  'POS_JANTAR',
];

/**
 * Verifica se um valor de glicemia está dentro da normalidade
 */
export function isGlucoseNormal(type: GlucoseType, value: number): boolean {
  const reference = GLUCOSE_REFERENCE_VALUES[type];
  
  if (type === 'JEJUM') {
    return value < reference.max;
  }
  
  return value <= reference.max;
}


