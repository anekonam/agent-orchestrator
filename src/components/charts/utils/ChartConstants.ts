// Chart color palette
export const COLORS = [
  '#2F80ED', // category_1
  '#008C8C', // category_2
  '#00B2CC', // category_3
  '#009E60', // category_4
  '#50C878', // category_5
  '#A8E06C', // category_6
  '#FFD700', // category_7
  '#FFB000', // category_8
  '#FB7427', // category_9
  '#E14F6A', // category_10
  '#A73AB0', // category_11
  '#4E3089', // category_12
  '#2767EC', // category_13
  '#0198ED', // category_14
  '#01C6EF', // category_15
  '#6A5ACD', // category_16
  '#A78BFA', // category_17
  '#190470', // category_18
  '#4CAF50', // category_19
  '#2E7D32', // category_20
  '#295EB9', // category_21
  '#3E94CA', // category_22
  '#AAAAAA', // category_23
  '#BDC4D1', // category_24
  '#00CCB1', // category_25
  '#0C80CD', // category_26
];

// Map variations to standard types
export const chartTypeMap: Record<string, string> = {
  'piechart': 'pie',
  'pie': 'pie',
  'barchart': 'bar',
  'bar': 'bar',
  'linechart': 'line',
  'linegraph': 'line',
  'line': 'line',
  'areachart': 'area',
  'area': 'area',
  'waterfall': 'waterfall',
  'scatter': 'scatter',
  'funnel': 'funnel',
  'radar': 'radar',
  'table': 'table',
  'combo': 'combo'
};

// Define supported chart types with their variations
export type ChartType =
  | 'piechart' | 'pie'
  | 'barchart' | 'bar'
  | 'linechart' | 'linegraph' | 'line'
  | 'areachart' | 'area'
  | 'waterfall'
  | 'scatter'
  | 'funnel'
  | 'radar'
  | 'table'
  | 'combo';