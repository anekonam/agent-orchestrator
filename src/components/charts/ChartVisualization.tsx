import React, { useEffect } from 'react';
import TableVisualization from '../TableVisualization';
import { ChartTypeDetector } from './utils/ChartTypeDetector';
import { ChartDataTransformer } from './utils/ChartDataTransformer';
import { ChartData } from './utils/ChartInterfaces';

// Import individual chart components
import { PieChart } from './components/PieChart';
import { BarChart } from './components/BarChart';
import { LineChart } from './components/LineChart';
import { AreaChart } from './components/AreaChart';
import { ScatterChart } from './components/ScatterChart';
import { RadarChart } from './components/RadarChart';
import { WaterfallChart } from './components/WaterfallChart';
import { FunnelChart } from './components/FunnelChart';
import { ComboChart } from './components/ComboChart';

import './ChartVisualization.css';

interface ChartVisualizationProps {
  chart: ChartData;
  useEllipses?: boolean;
  onChartNotRendered?: (reason: string) => void;
}

const ChartVisualization: React.FC<ChartVisualizationProps> = ({ chart, useEllipses = false, onChartNotRendered }) => {
  // Validation logic - determine if chart should be rendered
  const getValidationError = (): string | null => {
    if (!chart) {
      return 'No chart data provided';
    }

    // Check for empty data
    const isNewStructure = ChartTypeDetector.isNewStructure(chart);
    const isDataPointStructure = ChartTypeDetector.isDataPointStructure(chart);
    
    if (isNewStructure && (!chart.datasets || chart.datasets.length === 0)) {
      return 'No datasets available';
    }

    // Check if all data values are 0 in new structure
    if (isNewStructure && chart.datasets) {
      const allZeros = chart.datasets.every(dataset => {
        if (Array.isArray(dataset.data)) {
          return dataset.data.every(value => value === 0 || value === null || value === undefined);
        }
        return false;
      });
      
      if (allZeros) {
        return 'All data values are zero';
      }
    }

    if (isDataPointStructure && (!chart.data || chart.data.length === 0)) {
      return 'No data points available';
    }

    // Check if all data values are 0 in data point structure
    if (isDataPointStructure && chart.data) {
      const allZeros = chart.data.every(point => 
        point.value === 0 || point.value === null || point.value === undefined
      );
      
      if (allZeros) {
        return 'All data values are zero';
      }
    }

    if (!isNewStructure && !isDataPointStructure && ChartTypeDetector.isLegacyStructure(chart)) {
      const legacyChart = chart as any;
      if (!legacyChart.data && !legacyChart.table_data && !legacyChart.labels) {
        return 'No legacy chart data available';
      }
    }

    return null;
  };

  const validationError = getValidationError();
  
  // Get chart type and title for normalized data check
  const chartType = ChartTypeDetector.getChartType(chart);
  const chartTitle = ChartTypeDetector.getChartTitle(chart);
  const normalizedType = ChartTypeDetector.normalizeChartType(chartType);
  
  // Transform data for regular charts
  const normalizedData = ChartDataTransformer.transformForChart(chart);

  // All useEffect calls must be at the top level, before any early returns
  useEffect(() => {
    if (validationError) {
      onChartNotRendered?.(validationError);
    }
  }, [validationError, onChartNotRendered]);

  useEffect(() => {
    if (!validationError && (!normalizedData || normalizedData.length === 0)) {
      onChartNotRendered?.(`No normalized data available for chart: ${chartTitle || 'unknown'}`);
    }
  }, [validationError, normalizedData, chartTitle, onChartNotRendered]);

  // Early return if validation fails
  if (validationError) {
    return null;
  }

  // Handle table charts
  if (ChartTypeDetector.isTableChart(chart)) {
    const tableData = ChartDataTransformer.transformForTable(chart);
    if (tableData) {
      return (
        <div className="chart-visualization">
          {chartTitle && <h4 className="chart-title">{chartTitle}</h4>}
          <div className="chart-container">
            <TableVisualization table={tableData} />
          </div>
        </div>
      );
    }
    return <div className="chart-error">No table data available</div>;
  }

  // Early return if no normalized data
  if (!normalizedData || normalizedData.length === 0) {
    return null;
  }

  // Render the appropriate chart component
  const renderChart = () => {
    switch (normalizedType) {
      case 'pie':
        return <PieChart data={normalizedData} />;
      case 'bar':
        return <BarChart data={normalizedData} />;
      case 'line':
        return <LineChart data={normalizedData} />;
      case 'area':
        return <AreaChart data={normalizedData} />;
      case 'scatter':
        const chartConfig = ChartTypeDetector.isDataPointStructure(chart) ? (chart as any).chart_config : {};
        return <ScatterChart data={normalizedData} chartConfig={chartConfig} useEllipses={useEllipses} />;
      case 'radar':
        return <RadarChart data={normalizedData} originalChart={chart} />;
      case 'waterfall':
        return <WaterfallChart data={normalizedData} />;
      case 'funnel':
        return <FunnelChart data={normalizedData} />;
      case 'combo':
        return <ComboChart data={normalizedData} originalChart={chart} />;
      default:
        // Fallback to bar chart for unsupported types
        console.warn(`Chart type "${normalizedType}" is not supported, falling back to bar chart`);
        return <BarChart data={normalizedData} />;
    }
  };

  return (
    <div className="chart-visualization">
      {chartTitle && <h4 className="chart-title">{chartTitle}</h4>}
      <div className="chart-container">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartVisualization;