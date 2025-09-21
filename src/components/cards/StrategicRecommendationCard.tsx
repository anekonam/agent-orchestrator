import React, { useState } from 'react';
import RecommendationDialog from '../modals/RecommendationDialog';
import ImpactBadge from '../ui/badges/ImpactBadge';
import './StrategicRecommendationCard.css';

export interface StrategicRecommendation {
  id?: string | number;
  title: string;
  description: string;
  impact: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  timeline: string;
  [key: string]: any;
}

interface StrategicRecommendationCardProps {
  recommendation: StrategicRecommendation;
  onClick?: (recommendation: StrategicRecommendation) => void;
}

const StrategicRecommendationCard: React.FC<StrategicRecommendationCardProps> = ({
  recommendation,
  onClick
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    setIsDialogOpen(true);
    // Also call onClick if provided for any additional handling
    if (onClick) {
      onClick(recommendation);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Format description text (simplified version)
  const formatDescription = (text: string): string => {
    if (!text || typeof text !== 'string') return text;
    
    // Clean up redundant headers
    return text
      .replace(/^Strategic Recommendation:\s*/i, '')
      .replace(/^Strategic Implication for FAB:\s*/i, '')
      .replace(/^Recommendation:\s*/i, '')
      .trim();
  };

  return (
    <>
      <div className="strategic-recommendation-card">
        <div className="recommendation-header">
          <ImpactBadge impact={recommendation.priority} />
          <div className="timeline-badge">{recommendation.timeline}</div>
        </div>

        <div className="recommendation-title">{recommendation.title}</div>

        {recommendation.description && (
          <div className="recommendation-description">
            {formatDescription(recommendation.description)}
          </div>
        )}

        {recommendation.impact && (
          <div className="recommendation-impact">
            <span className="impact-label">Impact</span>
            <p className="impact-text">{recommendation.impact}</p>
          </div>
        )}

        <button
          className="view-recommendation-btn"
          onClick={handleClick}
        >
          View Recommendation
        </button>
      </div>

      <RecommendationDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        recommendation={recommendation}
      />
    </>
  );
};

export default StrategicRecommendationCard;