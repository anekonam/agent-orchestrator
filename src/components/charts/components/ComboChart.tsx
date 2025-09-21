import React from 'react';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { COLORS } from '../utils/ChartConstants';
import { ChartData, NewChartData, DataPointChartData } from '../utils/ChartInterfaces';
import { ChartTypeDetector } from '../utils/ChartTypeDetector';

interface ComboChartProps {
  data: any[];
  originalChart?: ChartData;
}

export const ComboChart: React.FC<ComboChartProps> = ({ data, originalChart }) => {
  // Determine how to render the combo chart based on the original structure
  if (originalChart && ChartTypeDetector.isNewStructure(originalChart)) {
    const newChart = originalChart as NewChartData;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="y" />
          <YAxis yAxisId="y1" orientation="right" />
          <Tooltip />
          <Legend />
          {newChart.datasets.map((dataset, index) => {
            const color = COLORS[index % COLORS.length];
            if (dataset.type === 'line') {
              return (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={dataset.label || 'value'}
                  stroke={color}
                  yAxisId={dataset.yAxisID || 'y'}
                  strokeWidth={2}
                />
              );
            } else if (dataset.type === 'area') {
              return (
                <Area
                  key={index}
                  type="monotone"
                  dataKey={dataset.label || 'value'}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                  yAxisId={dataset.yAxisID || 'y'}
                />
              );
            } else {
              return (
                <Bar
                  key={index}
                  dataKey={dataset.label || 'value'}
                  fill={color}
                  yAxisId={dataset.yAxisID || 'y'}
                />
              );
            }
          })}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // Handle DataPointChartData structure
  if (originalChart && ChartTypeDetector.isDataPointStructure(originalChart)) {
    const dpChart = originalChart as DataPointChartData;
    const config = dpChart.chart_config;
    
    const allKeys = config?.series ||
      (data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'name' && k !== 'label') : []);

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {allKeys.map((key, i) => {
            const t = config?.series_types?.[key] || 'bar';
            const color = COLORS[i % COLORS.length];
            if (t === 'line') {
              return <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} />;
            } else if (t === 'area') {
              return <Area key={key} type="monotone" dataKey={key} stroke={color} fill={color} fillOpacity={0.3} />;
            } else {
              return <Bar key={key} dataKey={key} fill={color} />;
            }
          })}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // Fallback for simple data
  const dataKeys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== 'name' && typeof data[0][k] === 'number') : [];
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {dataKeys.length > 1 && <Legend />}
        {dataKeys.map((key, i) => (
          <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};