import React from 'react';
import ChartVisualization from '../charts/ChartVisualization';
import TableVisualization from '../TableVisualization';
import RightArrowIcon from '../icons/RightArrowIcon';
import SourcesList from '../ui/SourcesList';
import './TabSummaryCard.css';
import GraphyVisualization from '../GraphyVisualization';

interface TabSummaryCardProps {
  tabName?: string;
  tabId?: string; // Tab ID for navigation
  title: string;
  graphData: any;
  graphyUrl?: string; // Made optional
  graphImage?: string; // New prop for image - takes precedence over graphyUrl
  lastUpdated: string;
  sourceImages: string[];
  onTabClick?: () => void;
  useEllipses?: boolean; // Pass through to ChartVisualization for scatter charts
  isTable?: boolean; // Force render as table
  showViewInsight?: boolean;
  onViewInsight?: () => void;
}

const TabSummaryCard: React.FC<TabSummaryCardProps> = ({
  tabName,
  tabId,
  title,
  graphData,
  graphyUrl,
  graphImage,
  lastUpdated,
  sourceImages,
  onTabClick,
  useEllipses,
  isTable,
  showViewInsight = false,
  onViewInsight
}) => {
  // Check if graphData indicates it's a table
  const isTableData = isTable || 
    (graphData && (
      graphData.type === 'table' || 
      graphData.chart_type === 'table' ||
      (Array.isArray(graphData) && graphData.length > 0 && typeof graphData[0] === 'object' && !graphData[0].chart_type)
    ));

  // Convert graphData to table format if needed
  const getTableData = () => {
    // If graphData already has the correct structure
    if (graphData && graphData.headers && graphData.data) {
      return graphData;
    }
    
    // If graphData has chart_type: 'table' with data array
    if (graphData && graphData.chart_type === 'table' && graphData.data) {
      const dataArray = Array.isArray(graphData.data) ? graphData.data : [graphData.data];
      if (dataArray.length > 0) {
        const headers = Object.keys(dataArray[0]);
        const data = dataArray.map((row: any) => headers.map(header => row[header]));
        return {
          title: '',
          headers,
          data
        };
      }
    }
    
    // If graphData is an array of objects, convert it
    if (Array.isArray(graphData) && graphData.length > 0) {
      const headers = Object.keys(graphData[0]);
      const data = graphData.map(row => headers.map(header => row[header]));
      return {
        title: '',
        headers,
        data
      };
    }
    
    // Default fallback
    return {
      title: title || 'Data Table',
      headers: [],
      data: []
    };
  };
  return (
    <div className="tab-summary-card">
      { tabName && (
        <button 
          className="tab-summary-button" 
          onClick={tabId ? onTabClick : undefined}
          style={{ cursor: tabId ? 'pointer' : 'default' }}
        >
          <span className="tab-name">{tabName}</span>
          {tabId && <RightArrowIcon size={16} className="tab-arrow" />}
        </button>
      )}
      
      <h3 className="tab-summary-title">{title}</h3>
      
      <div className={`tab-summary-chart ${
        !(graphImage && graphImage.trim() !== '') && !isTableData ? 'with-chart' : ''
      } ${isTableData ? 'with-table' : ''}`}>
        {
          graphImage && graphImage.trim() !== '' ? (
            <img 
              src={graphImage} 
              alt={title}
              className="tab-summary-image"
            />
          ) : isTableData ? (
            <TableVisualization table={getTableData()} />
          ) : (graphyUrl && graphyUrl.trim() !== '' ? (
            <GraphyVisualization graphyUrl={graphyUrl}/>
          ) : (
            <ChartVisualization chart={graphData} useEllipses={useEllipses} />
          ))
        }
      </div>
      
      {/* Hide footer for table chart types */}
      {!isTableData && (
        <div className="tabcard-summary-footer">
          <div className="last-updated">
            <span className="last-updated-label">Last Updated</span>
            <span className="last-updated-date">{lastUpdated}</span>
          </div>
          
          <span className="footer-divider">|</span>
          
          <SourcesList 
            sources={sourceImages}
            maxVisible={3}
            imageSize="small"
          />
          
          {showViewInsight && (
            <button 
              className="view-insight-button"
              onClick={onViewInsight}
            >
              View Insight
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TabSummaryCard;