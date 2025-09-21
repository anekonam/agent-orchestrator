import { ChartData, NewChartData, LegacyChartData, DataPointChartData } from './ChartInterfaces';
import { chartTypeMap } from './ChartConstants';

export class ChartTypeDetector {
  static isNewStructure(chart: ChartData): chart is NewChartData {
    return 'chart_type' in chart && 'datasets' in chart && !('type' in chart);
  }

  static isDataPointStructure(chart: ChartData): chart is DataPointChartData {
    return 'chart_type' in chart && 'data' in chart && !('datasets' in chart) && !('type' in chart);
  }

  static isLegacyStructure(chart: ChartData): chart is LegacyChartData {
    return !this.isNewStructure(chart) && !this.isDataPointStructure(chart);
  }

  static getChartType(chart: ChartData): string {
    if (this.isNewStructure(chart) || this.isDataPointStructure(chart)) {
      return chart.chart_type;
    }
    return (chart as LegacyChartData).type || 'bar';
  }

  static getChartTitle(chart: ChartData): string {
    if (this.isNewStructure(chart) || this.isDataPointStructure(chart)) {
      return chart.chart_title;
    }
    return (chart as LegacyChartData).title || '';
  }

  static normalizeChartType(chartType: string): string {
    const normalized = (chartType || 'bar').toLowerCase();
    return chartTypeMap[normalized] || 'bar';
  }

  static hasTableData(chart: ChartData): boolean {
    if (this.isLegacyStructure(chart)) {
      const legacy = chart as LegacyChartData;
      return !!legacy.table_data;
    }
    return false;
  }

  static isTableChart(chart: ChartData): boolean {
    const chartType = this.getChartType(chart);
    const normalizedType = this.normalizeChartType(chartType);
    return normalizedType === 'table' || this.hasTableData(chart);
  }
}