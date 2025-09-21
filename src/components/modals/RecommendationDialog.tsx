import React from 'react';
import ImpactBadge from '../ui/badges/ImpactBadge';
import './RecommendationDialog.css';

interface RecommendationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation?: {
    title?: string;
    description?: string;
    impact?: string;
    priority?: string;
    timeline?: string;
    [key: string]: any;
  };
}

const RecommendationDialog: React.FC<RecommendationDialogProps> = ({
  isOpen,
  onClose,
  recommendation
}) => {
  if (!isOpen || !recommendation) return null;


  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="recommendation-dialog-backdrop" onClick={handleBackdropClick}>
      <div className="recommendation-dialog">
        <div className="recommendation-dialog-header">
          <div className="dialog-header-left">
            <img 
              src="/fab-illustrations/illustration_binoculas_270.svg" 
              alt="Recommendation" 
            />
            <div className="recommendation-dialog-header-text">Strategic Recommendation Details</div>
          </div>
          <button className="dialog-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="recommendation-dialog-body">
          <div className="recommendation-meta">
            <ImpactBadge impact={recommendation.priority || 'MEDIUM'} />
            <span className="dialog-timeline">{recommendation.timeline || '6-12 MONTHS'}</span>
          </div>

          <h3 className="recommendation-dialog-title">
            {recommendation.title || 'Recommendation'}
          </h3>

          {recommendation.description && (
            <p className="recommendation-dialog-description">
              {recommendation.description}
            </p>
          )}

          {recommendation.impact && (
            <div className="recommendation-dialog-impact">
              <h4 className="impact-section-title">Impact</h4>
              <p className="impact-section-text">{recommendation.impact}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationDialog;