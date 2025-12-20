import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { GlucoseStats } from '../../types/glucose';
import { GLUCOSE_REFERENCE_VALUES } from '../../utils/constants';

interface TimeChartProps {
  stats: GlucoseStats;
}

export function TimeChart({ stats }: TimeChartProps) {
  const data = useMemo(() => {
    return Object.entries(stats.byType).map(([type, typeStats]) => ({
      name: GLUCOSE_REFERENCE_VALUES[type as keyof typeof GLUCOSE_REFERENCE_VALUES].label,
      normal: typeStats.normal,
      abnormal: typeStats.abnormal,
      percentageNormal: Math.round(typeStats.percentageNormal),
    }));
  }, [stats]);

  if (stats.totalReadings === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Nenhum dado disponível para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => {
            if (value === undefined || name === undefined) return ['', ''];
            if (name === 'normal') return [value, 'Dentro da Meta'];
            if (name === 'abnormal') return [value, 'Fora da Meta'];
            return [value, name];
          }}
        />
        <Bar dataKey="normal" stackId="a" fill="#22c55e" name="Dentro da Meta">
          {data.map((_entry, index) => (
            <Cell key={`cell-normal-${index}`} fill="#22c55e" />
          ))}
        </Bar>
        <Bar dataKey="abnormal" stackId="a" fill="#ef4444" name="Fora da Meta">
          {data.map((_entry, index) => (
            <Cell key={`cell-abnormal-${index}`} fill="#ef4444" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

