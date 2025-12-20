import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { GlucoseReading } from '../../types/glucose';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface TrendChartProps {
  readings: GlucoseReading[];
}

export function TrendChart({ readings }: TrendChartProps) {
  const data = useMemo(() => {
    // Agrupar por data e calcular média diária
    const grouped: Record<string, GlucoseReading[]> = {};
    
    readings.forEach((reading) => {
      const dateKey = format(new Date(reading.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(reading);
    });

    return Object.entries(grouped)
      .map(([date, dayReadings]) => {
        const average =
          dayReadings.reduce((sum, r) => sum + r.value, 0) / dayReadings.length;
        return {
          date: format(new Date(date), 'dd/MM', { locale: ptBR }),
          value: Math.round(average * 10) / 10,
          fullDate: date,
        };
      })
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [readings]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Nenhum dado disponível para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
          label={{ value: 'Glicemia (mg/dL)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: number | undefined) => value !== undefined ? [`${value} mg/dL`, 'Média Diária'] : ['', '']}
        />
        <ReferenceLine y={92} stroke="#ef4444" strokeDasharray="3 3" label="Meta Jejum" />
        <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label="Meta Pós-Prandial" />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#0ea5e9"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

