import { ChartData, NewChartData, LegacyChartData, DataPointChartData } from './ChartInterfaces';
import { COLORS } from './ChartConstants';
import { ChartTypeDetector } from './ChartTypeDetector';

export class ChartDataTransformer {
  static transformNewStructureData(chart: NewChartData): any[] {
    if (chart.chart_type === 'combo') {
      const comboData = chart.labels?.map((label, index) => {
        const d: any = { name: label };
        chart.datasets.forEach(ds => {
          const key = ds.label || 'value';
          d[key] = ds.data[index];
        });
        return d;
      }) || [];
      return comboData;
    }

    const dataset = chart.datasets[0];
    if (!dataset) return [];

    if (chart.chart_type === 'scatter') {
      return dataset.data;
    } else if (chart.chart_type === 'waterfall') {
      let cumulative = 0;
      return dataset.data.map((value: any, index: number) => {
        const label = chart.labels?.[index] || `Item ${index}`;
        const isTotal = index === 0 || index === dataset.data.length - 1;
        const prevCumulative = cumulative;

        if (!isTotal) cumulative += value;
        else cumulative = value;

        return {
          name: label,
          value: Math.abs(value),
          fill: value >= 0 ? COLORS[0] : COLORS[1],
          isIncrease: value >= 0,
          isTotal,
          cumulative,
          prevCumulative,
          actualValue: value
        };
      });
    } else if (chart.chart_type === 'funnel') {
      return dataset.data.map((value: any, index: number) => ({
        name: chart.labels?.[index] || `Stage ${index + 1}`,
        value,
        fill: COLORS[index % COLORS.length],
        percentage: (value / dataset.data[0]) * 100
      }));
    } else {
      return dataset.data.map((value: any, index: number) => ({
        name: chart.labels?.[index] || `Item ${index}`,
        value,
        fill: COLORS[index % COLORS.length]
      }));
    }
  }

  static extractLegacyData(chart: LegacyChartData): any[] {
    const dataKey = chart.dataKey || 'value';

    // Check if it has the new format with labels and datasets
    if (chart.labels && chart.datasets && chart.datasets.length > 0) {
      const dataset = chart.datasets[0];
      return chart.labels.map((label, index) => ({
        name: label,
        value: dataset.data[index] || 0,
        fill: Array.isArray(dataset.backgroundColor) 
          ? dataset.backgroundColor[index % dataset.backgroundColor.length] 
          : dataset.backgroundColor || COLORS[index % COLORS.length]
      }));
    }

    // Check if it has table_data structure
    if (chart.table_data) {
      return []; // Table data is handled separately
    }

    // Handle old data array format
    if (chart.data && chart.data.length > 0) {
      // Check for nested data structure
      if (chart.data[0].data && Array.isArray(chart.data[0].data)) {
        const nestedData = chart.data[0].data;
        const dataPoint = nestedData.find(item => item.x === 'data');
        if (dataPoint && typeof dataPoint.y === 'object') {
          return Object.entries(dataPoint.y).map(([key, value]) => ({
            name: key,
            [dataKey]: typeof value === 'number' ? value : (parseFloat(value as any) || 0)
          }));
        }
      }

      // Simple data array format
      return chart.data.map(item => ({
        ...item,
        name: item.label || item.name || 'Unknown',
        [dataKey]: item.value || (item as any)[dataKey] || 0
      }));
    }

    return [];
  }

  static transformDataPointStructure(chart: DataPointChartData): any[] {
    // combo passthrough
    if (chart.chart_type === 'combo' && chart.chart_config?.series) {
      return chart.data;
    }

    // scatter with pills
    if (chart.chart_type === 'scatter') {
      const cfg = chart.chart_config || {};
      const xKey = chart.x_axis || 'x';
      const yKey = chart.y_axis || 'y';
      const labelKey = cfg.label_key || 'label';
      const colorKey = cfg.color_key || 'color';
      const rxKey = cfg.rx_key || 'rx';
      const ryKey = cfg.ry_key || 'ry';

      return chart.data.map((item, i) => ({
        ...item,
        x: Number(item[xKey]),
        y: Number(item[yKey]),
        label: item[labelKey] ?? item.name ?? `Item ${i + 1}`,
        color: COLORS[i % COLORS.length],
        rx: Number(item[rxKey] ?? cfg.default_rx ?? 110),
        ry: Number(item[ryKey] ?? cfg.default_ry ?? 42),
      }));
    }

    // object map case
    if (chart.data && typeof chart.data === 'object' && !Array.isArray(chart.data)) {
      return Object.entries(chart.data as any).map(([key, value]) => ({ name: key, value }));
    }

    return chart.data;
  }

  static transformForChart(chart: ChartData): any[] {
    if (ChartTypeDetector.isDataPointStructure(chart)) {
      return this.transformDataPointStructure(chart as DataPointChartData);
    } else if (ChartTypeDetector.isNewStructure(chart)) {
      return this.transformNewStructureData(chart as NewChartData);
    } else {
      return this.extractLegacyData(chart as LegacyChartData);
    }
  }

  static transformForTable(chart: ChartData): { headers: string[]; data: any[][]; title: string; metadata?: any } | null {
    const chartTitle = ChartTypeDetector.getChartTitle(chart);
    
    // Handle direct table data structure (chart_type: "table" with data array)
    // This handles the case where we have a chart with chart_type: "table" and data array
    if ('chart_type' in chart && 
        (chart as any).chart_type === 'table' && 
        'data' in chart && 
        Array.isArray((chart as any).data) && 
        (chart as any).data.length > 0) {
      const dataArray = (chart as any).data;
      const headers = Object.keys(dataArray[0]);
      const rows = dataArray.map((item: any) => 
        headers.map(header => item[header] !== undefined && item[header] !== null ? String(item[header]) : '-')
      );
      return {
        title: chartTitle || '',
        headers,
        data: rows,
        metadata: {}
      };
    }
    
    if (ChartTypeDetector.isLegacyStructure(chart)) {
      const legacyChart = chart as LegacyChartData;
      
      if (legacyChart.table_data) {
        return {
          title: chartTitle || '',
          headers: legacyChart.table_data.headers,
          data: legacyChart.table_data.rows,
          metadata: legacyChart.metadata
        };
      } else if (legacyChart.data && Array.isArray(legacyChart.data) && legacyChart.data.length > 0) {
        const headers = Object.keys(legacyChart.data[0]);
        const rows = legacyChart.data.map((item: any) => 
          headers.map(header => item[header] !== undefined ? item[header] : '')
        );
        return {
          title: chartTitle || '',
          headers,
          data: rows,
          metadata: legacyChart.metadata
        };
      }
    }
    
    if (ChartTypeDetector.isDataPointStructure(chart)) {
      const dpChart = chart as DataPointChartData;
      const data = Array.isArray(dpChart.data) ? dpChart.data : [dpChart.data];
      if (data && data.length > 0) {
        const keys = Array.from(new Set(data.flatMap(item => Object.keys(item))));
        const headers = keys.map(k => k.replace(/_/g, ' ').replace(/^./, s => s.toUpperCase()));
        const rows = data.map(row => keys.map(k => row[k] !== undefined ? String(row[k]) : '-'));
        return {
          title: '',
          headers,
          data: rows,
          metadata: {}
        };
      }
    }
    
    if (ChartTypeDetector.isNewStructure(chart)) {
      const newChart = chart as NewChartData;
      
      // Check if this is a table with object data in datasets[0].data (new table structure)
      if (newChart.chart_type === 'table' && 
          newChart.datasets && 
          newChart.datasets.length > 0 && 
          newChart.datasets[0].data && 
          Array.isArray(newChart.datasets[0].data) && 
          newChart.datasets[0].data.length > 0 && 
          typeof newChart.datasets[0].data[0] === 'object') {
        
        // New table structure: use data array with objects
        const dataArray = newChart.datasets[0].data;
        
        // Extract headers from the keys of the first object
        const headers = Object.keys(dataArray[0]);
        
        // Extract rows: each object becomes a row
        const rows = dataArray.map((item: any) => {
          return headers.map(header => {
            const value = item[header];
            return value !== undefined && value !== null ? String(value) : '-';
          });
        });
        
        return {
          title: '',
          headers,
          data: rows,
          metadata: {}
        };
      } else if (newChart.labels && newChart.datasets && newChart.datasets.length > 0) {
        // Existing structure: use labels and datasets
        const headers = ['Label', ...newChart.datasets.map(ds => ds.label)];
        const rows = newChart.labels.map((label, i) => [
          label,
          ...newChart.datasets.map(ds => ds.data[i] !== undefined ? String(ds.data[i]) : '-')
        ]);
        return {
          title: '',
          headers,
          data: rows,
          metadata: {}
        };
      }
    }
    
    return null;
  }
}