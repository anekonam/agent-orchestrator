import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ResponsiveContainer 
} from 'recharts';

interface WaterfallChartProps {
  data: any[];
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ data }) => {
  // Transform data for waterfall visualization
  const waterfallData = data.map((item: any) => {
    if (item.isTotal) {
      return { ...item, y: 0, height: item.actualValue };
    } else {
      return { ...item, y: item.prevCumulative, height: item.value };
    }
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload[0]) {
              const d: any = payload[0].payload;
              return (
                <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: 10, border: '1px solid #ccc' }}>
                  <p>{d.name}</p>
                  <p style={{ color: d.fill }}>Value: {d.isIncrease ? '+' : '-'}{d.value}</p>
                  {!d.isTotal && <p>Cumulative: {d.cumulative}</p>}
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="height" stackId="a">
          {waterfallData.map((entry: any, i: number) => <Cell key={i} fill={entry.fill} />)}
        </Bar>
        <Bar dataKey="y" stackId="a" fill="transparent" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};