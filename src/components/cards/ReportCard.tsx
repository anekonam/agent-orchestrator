import React, { useState } from 'react';
import ChartVisualization from '../charts/ChartVisualization';
import TableVisualization from '../TableVisualization';
import GraphyVisualization from '../GraphyVisualization';
import SourcesList from '../ui/SourcesList';
import './ReportCard.css';

interface ReportCardProps {
  subtitle?: string;
  title: string;
  graphData: any; // Chart data for ChartVisualization component
  graphyUrl?: string; // Optional Graphy URL
  sourceImages: string[];
  showViewInsight?: boolean;
  onViewInsight?: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
  subtitle,
  title,
  graphData,
  graphyUrl,
  sourceImages,
  showViewInsight = true,
  onViewInsight
}) => {
  const [shouldHideCard, setShouldHideCard] = useState(false);

  // Don't render the card if chart has no meaningful data
  if (shouldHideCard) {
    return null;
  }

  return (
    <div className="report-card">
      <div className="report-card-header">
        <div className="report-card-title">{title}</div>
        {subtitle && (<div className="report-card-subtitle">{subtitle}</div>)}
      </div>
      
      <div className="report-card-content">
        <ChartVisualization 
          chart={graphData} 
          onChartNotRendered={(reason) => {
            console.error(`Chart not rendered in ReportCard: ${reason}`);
            setShouldHideCard(true);
          }}
        />
      </div>
      
      <div className="report-card-footer">
        <div className="report-card-sources-wrapper">
          <SourcesList 
            sources={sourceImages}
            maxVisible={3}
            imageSize="medium"
          />
        </div>
        
        {showViewInsight && (
          <button 
            className="view-insight-button"
            onClick={onViewInsight}
          >
            View Insight
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;