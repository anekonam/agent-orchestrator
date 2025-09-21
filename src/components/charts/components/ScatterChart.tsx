import React from 'react';
import { 
  ScatterChart as RechartsScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { PillShape } from '../shapes/PillShape';

interface ScatterChartProps {
  data: any[];
  chartConfig?: any;
  useEllipses?: boolean;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({ data, chartConfig = {}, useEllipses = false }) => {
  const xDomain = chartConfig.x_domain || [0, 100];
  const yDomain = chartConfig.y_domain || [0, 100];
  const xLabel = chartConfig.x_label || 'X';
  const yLabel = chartConfig.y_label || 'Y';
  
  const xRefLine = chartConfig.x_ref_line || null;
  const yRefLine = chartConfig.y_ref_line || null;
  const quadrantLabels = chartConfig.quadrant_labels || null;
  const pointStyle = chartConfig.pointStyle || 'circle';

  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No scatter plot data available</p>
      </div>
    );
  }

  const renderPoint = (props: any) => {
    const { cx, cy, fill, payload } = props;
    
    if (useEllipses) {
      return <PillShape {...props} />;
    }

    return (
      <g>
        {pointStyle === 'cross' ? (
          <>
            <line 
              x1={cx - 5} 
              y1={cy - 5} 
              x2={cx + 5} 
              y2={cy + 5}
              stroke={payload.color || fill || "#8884d8"}
              strokeWidth={2}
              strokeOpacity={0.8}
              strokeLinecap="round"
            />
            <line 
              x1={cx - 5} 
              y1={cy + 5} 
              x2={cx + 5} 
              y2={cy - 5}
              stroke={payload.color || fill || "#8884d8"}
              strokeWidth={2}
              strokeOpacity={0.8}
              strokeLinecap="round"
            />
          </>
        ) : (
          <circle 
            cx={cx} 
            cy={cy} 
            r={7}
            fill={payload.color || fill || "#8884d8"} 
            fillOpacity={0.8}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={1}
          />
        )}
        <text
          x={cx + 12}
          y={cy}
          fill="#374151"
          fontSize={11}
          fontWeight={500}
          textAnchor="start"
        >
          {(payload.label || payload.name || '').split('\n').map((line: string, index: number) => (
            <tspan
              key={index}
              x={cx + 12}
              dy={index === 0 ? -4 : 12}
            >
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsScatterChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 40 }}>
        <CartesianGrid stroke="#334155" strokeOpacity={0.25} />
        <XAxis
          type="number"
          dataKey="x"
          domain={xDomain}
          tick={{ fill: "#94A3B8" }}
          label={{ 
            value: xLabel, 
            position: "insideBottom", 
            offset: -10,
            style: { textAnchor: 'middle' },
            fill: "#94A3B8" 
          }}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={yDomain}
          tick={{ fill: "#94A3B8" }}
          label={{ 
            value: yLabel, 
            angle: -90, 
            position: "insideLeft",
            style: { textAnchor: 'middle' },
            fill: "#94A3B8" 
          }}
        />
        
        {xRefLine && (
          <ReferenceLine 
            x={xRefLine} 
            stroke="#94A3B8" 
            strokeDasharray="6 6"
            strokeOpacity={0.5}
          />
        )}
        {yRefLine && (
          <ReferenceLine 
            y={yRefLine} 
            stroke="#94A3B8" 
            strokeDasharray="6 6"
            strokeOpacity={0.5}
          />
        )}
        
        {quadrantLabels && xRefLine && yRefLine && (
          <>
            {Object.entries(quadrantLabels).map(([position, label]) => {
              const positions: Record<string, { x: string; y: string; fill: string }> = {
                topLeft: { x: "20%", y: "15%", fill: "#3B82F6" },
                topRight: { x: "85%", y: "15%", fill: "#16A34A" },
                bottomLeft: { x: "20%", y: "75%", fill: "#EF4444" },
                bottomRight: { x: "85%", y: "75%", fill: "#F59E0B" }
              };
              
              const pos = positions[position];
              if (!pos || !label) return null;
              
              return (
                <text
                  key={position}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  fill={pos.fill}
                  fontSize={12}
                  fontWeight={600}
                  opacity={0.8}
                >
                  {(label as string).split('\n').map((line: string, index: number) => (
                    <tspan
                      key={index}
                      x={pos.x}
                      dy={index === 0 ? 0 : 14}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            })}
          </>
        )}
        
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p: any = payload[0].payload;
            return (
              <div style={{ background: "#0B1220", color: "#E2E8F0", padding: 10, borderRadius: 8 }}>
                <div style={{ fontWeight: 700 }}>{p.label}</div>
                <div>X: {p.x}</div>
                <div>Y: {p.y}</div>
              </div>
            );
          }}
        />
        <Scatter 
          data={data as any[]} 
          shape={renderPoint}
          fill="#8884d8"
        />
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};