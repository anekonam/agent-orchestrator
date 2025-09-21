import React from 'react';
import { 
  RadarChart as RechartsRadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { COLORS } from '../utils/ChartConstants';
import { ChartData, NewChartData } from '../utils/ChartInterfaces';
import { ChartTypeDetector } from '../utils/ChartTypeDetector';

interface RadarChartProps {
  data: any[];
  originalChart?: ChartData;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, originalChart }) => {
  // For radar charts, we need to handle the data differently
  // If we have the original chart structure with datasets, use that
  let radarData = data;
  let dataKeys: string[] = [];

  if (originalChart && ChartTypeDetector.isNewStructure(originalChart)) {
    const newChart = originalChart as NewChartData;
    const datasets = newChart.datasets || [];
    
    // Transform to radar format
    radarData = newChart.labels?.map((label, index) => {
      const point: any = { name: label };
      datasets.forEach(ds => { 
        point[ds.label] = ds.data[index]; 
      });
      return point;
    }) || [];
    
    dataKeys = datasets.map(ds => ds.label);
  } else {
    // Try to extract data keys from the first data point
    if (data.length > 0) {
      dataKeys = Object.keys(data[0]).filter(key => key !== 'name' && typeof data[0][key] === 'number');
    }
  }

  // If we still don't have proper data keys, use 'value' as default
  if (dataKeys.length === 0) {
    dataKeys = ['value'];
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadarChart data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        {dataKeys.map((key, i) => {
          const strokeColor = COLORS[i % COLORS.length];
          const fillColor = COLORS[i % COLORS.length];
          return (
            <Radar 
              key={key} 
              name={key} 
              dataKey={key} 
              stroke={strokeColor} 
              fill={fillColor} 
              fillOpacity={0.3} 
            />
          );
        })}
        <Tooltip />
        {dataKeys.length > 1 && <Legend />}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};