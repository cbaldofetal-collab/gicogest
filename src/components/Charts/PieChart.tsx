import { useMemo } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { GlucoseStats } from '../../types/glucose';

interface PieChartProps {
  stats: GlucoseStats;
}

const COLORS = {
  normal: '#10b981', // Verde para normal
  abnormal: '#ef4444', // Vermelho para alterado
};

export function PieChart({ stats }: PieChartProps) {
  const data = useMemo(() => {
    const total = stats.totalReadings;
    if (total === 0) {
      return [];
    }

    return [
      {
        name: 'Normal',
        value: stats.normalReadings,
        percentage: Math.round((stats.normalReadings / total) * 100),
        color: COLORS.normal,
      },
      {
        name: 'Alterada',
        value: stats.abnormalReadings,
        percentage: Math.round((stats.abnormalReadings / total) * 100),
        color: COLORS.abnormal,
      },
    ];
  }, [stats]);

  if (data.length === 0 || stats.totalReadings === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Nenhum dado disponível para exibir
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value} medições ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => {
            const dataItem = data.find((d) => d.name === value);
            return `${value}: ${dataItem?.value || 0} (${dataItem?.percentage || 0}%)`;
          }}
          iconType="circle"
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

