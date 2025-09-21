import React from 'react';
import './GraphyVisualization.css';

// Default Graphy visualization URL
const DEFAULT_GRAPHY_URL = 'https://visualize.graphy.app/view/65025549-784f-4720-abbc-6a4ac5ca3880';

interface GraphyVisualizationProps {
  graphyUrl?: string; // Optional URL to a specific Graphy visualization
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
}

const GraphyVisualization: React.FC<GraphyVisualizationProps> = ({ 
  graphyUrl,
  width = '100%', 
  height = 900,
  theme = 'light' 
}) => {
  // Use provided URL or fall back to default
  const url = graphyUrl || DEFAULT_GRAPHY_URL;
  
  return (
    <div className="graphy-visualization">
      <iframe
        src={url}
        width={width}
        height={height}
        frameBorder="0"
        title="Graphy Visualization"
        className="graphy-chart-iframe"
        allow="fullscreen"
      />
    </div>
  );
};

export default GraphyVisualization;