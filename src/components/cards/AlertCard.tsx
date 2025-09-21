import React from 'react';
import Badge from '../ui/badges/Badge';
import ImpactBadge from '../ui/badges/ImpactBadge';
import './AlertCard.css';

export interface Alert {
  id: number;
  title: string;
  description: string;
  badge: string;
  badgeType: 'anomaly' | 'opportunity' | 'risk' | 'trend';
  impact: string;
  timeAgo: string;
  icon: string;
  aiConfidence: number; // 0–100
}

interface AlertCardProps {
  alert: Alert;
  onClick?: (alert: Alert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(alert);
    }
  };

  return (
    <div className="alert-card" onClick={handleClick}>
      <div className="alert-icon">
        {alert.icon.startsWith('/') ? (
          <img src={alert.icon} alt="" width={32} height={32} />
        ) : (
          alert.icon
        )}
      </div>
      <div className="alert-content">
        <div className="alert-header">
          <h3 className="alert-title">{alert.title}</h3>
          <div className="alert-badges">
            <Badge 
              value={alert.badge}
              className={`alert-badge ${alert.badgeType}`}
            />
            <ImpactBadge impact={alert.impact} />
          </div>
        </div>
        <p className="alert-description">{alert.description}</p>
        {alert.aiConfidence !== undefined && (
  <div className="alert-confidence">
    <span className="confidence-label">AI Confidence:</span>
    <div className="confidence-bar">
      <div
        className="confidence-fill"
        style={{ width: `${alert.aiConfidence}%` }}
      />
    </div>
    <span className="confidence-value">{alert.aiConfidence}%</span>
  </div>
)}
        <span className="alert-time">{alert.timeAgo}</span>
      </div>
    </div>
  );
};

export default AlertCard;