// Chart data structure interfaces

export interface Dataset {
  label: string;
  data: any[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean;
  type?: string;
  yAxisID?: string;
}

export interface NewChartData {
  chart_type: string;
  chart_title: string;
  labels?: string[];
  datasets: Dataset[];
}

// DataPoint chart format (combo charts, complex scatter)
export interface DataPointChartData {
  chart_type: 'combo' | 'scatter' | 'bar' | 'line' | 'pie';
  chart_title: string;
  data: Array<{ [key: string]: any }>;
  chart_config?: {
    series?: string[];
    series_types?: { [key: string]: 'bar' | 'line' | 'area' };
    x_label?: string;
    y_label?: string;
    x_domain?: [number, number];
    y_domain?: [number, number];
    label_key?: string;
    color_key?: string;
    rx_key?: string;
    ry_key?: string;
    default_rx?: number;
    default_ry?: number;
    x_ref_line?: number;
    y_ref_line?: number;
    quadrant_labels?: {
      topLeft?: string;
      topRight?: string;
      bottomLeft?: string;
      bottomRight?: string;
    };
    pointStyle?: 'circle' | 'cross';
  };
  x_axis?: string;
  y_axis?: string;
  size?: string;
}

// Legacy interface for backward compatibility
export interface LegacyChartData {
  type: string;
  title: string;
  data?: Array<{
    label?: string;
    name?: string;
    value?: number;
    data?: Array<{ x: string; y: any }>;
    [key: string]: any;
  }>;
  labels?: string[];
  datasets?: Dataset[];
  table_data?: {
    headers: string[];
    rows: Array<Array<string | number>>;
  };
  sources?: string[];
  insight_details?: string;
  strategic_implication?: string;
  xAxis?: string | null;
  yAxis?: string | null;
  metadata?: any;
  color?: string;
  useMultipleColors?: boolean;
  dataKey?: string;
  valueLabel?: string;
}

export type ChartData = NewChartData | LegacyChartData | DataPointChartData;