import React from 'react';
import ReportCard from './cards/ReportCard';
import './OverviewPositioning.css';

interface ChartData {
  chart_type?: string;
  type?: string; // Legacy format uses 'type' instead of 'chart_type'
  chart_title?: string;
  chart_subtitle?: string;
  title?: string;
  labels?: string[];
  datasets?: any[];
  table_data?: {
    headers: string[];
    rows: Array<Array<string | number>>;
  };
  data?: any[]; // Legacy format data array
  chart_config?: any;
  insight_details?: string;
  strategic_implication?: string;
  sources?: string[];
  graphyUrl?: string;
}

interface OverviewPositioningProps {
  charts?: ChartData[];
  content?: string;
  title?: string | 'Strategic Positioning';
  onViewInsight?: (reportData: any) => void;
}

const OverviewPositioning: React.FC<OverviewPositioningProps> = ({
  charts = [],
  content,
  title = 'Strategic Positioning',
  onViewInsight
}) => {
  // Return null if no charts data is available
  if (!charts || charts.length === 0) {
    return null;
  }

  const isFullWidthChart = (chart: ChartData) => {
    const chartType = (chart.chart_type || chart.type || '').toLowerCase();
    // Tables should NOT be full width - they should stay at 50%
    if (chartType === 'table') {
      return false;
    }
    return chartType === 'bubble' || 
           chartType === 'pie' || 
           chartType === 'scatter';
  };

  const renderReportCards = () => {
    // No limit on charts anymore - render all provided charts
    const reportCards = charts.map((chart, index) => {
      const icons = [
        '/fab-illustrations/illustration_chart_270.svg',
        '/fab-illustrations/illustration_investment_270.svg',
        '/fab-illustrations/illustration_money_growing_270.svg'
      ];

      return {
        icon: icons[index % icons.length],
        title: chart.chart_title || chart.title || `${chart.chart_type || chart.type || 'Analysis'} Chart`,
        subtitle: chart.chart_subtitle || '',
        graphData: {
          // Pass the entire chart object to preserve all properties
          ...chart,
          // Override with specific mappings if they exist
          chart_type: chart.chart_type || chart.type,
          chart_title: chart.chart_title || chart.title,
          insights: chart.insight_details || '',
          impact: chart.strategic_implication || '',
        },
        sources: chart.sources || [],
        graphyUrl: chart.graphyUrl || '',
        isFullWidth: false, // Will be calculated below
      };
    });

    // Apply layout rules
    let layoutClasses: string[] = [];
    let i = 0;
    
    while (i < reportCards.length) {
      const currentChart = charts[i];
      
      // Check if current chart should be full width
      if (isFullWidthChart(currentChart)) {
        // Full width exception chart
        reportCards[i].isFullWidth = true;
        layoutClasses.push('full-width');
        i++;
        
        // Pairing Rule: Next chart should also be full width
        if (i < reportCards.length) {
          reportCards[i].isFullWidth = true;
          layoutClasses.push('full-width');
          i++;
        }
      } else {
        // Check if we have a pair for half-width
        if (i + 1 < reportCards.length && !isFullWidthChart(charts[i + 1])) {
          // Both can be half-width
          layoutClasses.push('half-width');
          layoutClasses.push('half-width');
          i += 2;
        } else {
          // Odd Standalone Rule: This is a standalone chart in odd order
          reportCards[i].isFullWidth = true;
          layoutClasses.push('full-width');
          i++;
        }
      }
    }

    return (
      <div className="positioning-cards-container dynamic-layout">
        {reportCards.map((card, index) => (
          <div 
            key={index} 
            className={`report-card-wrapper ${layoutClasses[index]}`}
          >
            <ReportCard
              title={card.title}
              graphData={card.graphData}
              graphyUrl={card.graphyUrl}
              sourceImages={card.sources || []}
              onViewInsight={() => onViewInsight && onViewInsight(card)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="overview-positioning">
      <div className="positioning-header">
        <h2 className="positioning-title">{title}</h2>
        {content && (
          <div className="positioning-implications">
            <p className="positioning-text">{content}</p>
          </div>
        )}
      </div>

      <div className="positioning-charts">
        {renderReportCards()}
      </div>
    </div>
  );
};

export default OverviewPositioning;