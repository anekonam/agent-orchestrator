import React from 'react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip,
  LabelList,
  ResponsiveContainer 
} from 'recharts';

interface FunnelChartProps {
  data: any[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map((d: any) => d.value));
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="horizontal" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={70} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              const d: any = payload[0].payload;
              return (
                <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: 10, border: '1px solid #ccc' }}>
                  <p><strong>{d.name}</strong></p>
                  <p>Count: {d.value}</p>
                  <p>Conversion: {d.percentage.toFixed(1)}%</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="value" barSize={40}>
          {data.map((entry: any, i: number) => {
            const width = (entry.value / maxValue) * 100;
            return <Cell key={i} fill={entry.fill} style={{ width: `${width}%` }} />;
          })}
          <LabelList dataKey="value" position="right" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};