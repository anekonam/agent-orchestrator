import React from 'react';
import './ImpactBadge.css';

export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';

interface ImpactBadgeProps {
  impact: string;
  className?: string;
}

const ImpactBadge: React.FC<ImpactBadgeProps> = ({ impact, className = '' }) => {
  const getImpactClass = (impactText: string): string => {
    const upperImpact = impactText.toUpperCase();
    if (upperImpact.includes('HIGH')) return 'high-impact';
    if (upperImpact.includes('LOW')) return 'low-impact';
    return 'medium-impact';
  };

  const formatImpactLabel = (impactText: string): string => {
    const upperImpact = impactText.toUpperCase();
    
    // If already contains "IMPACT", return as is
    if (upperImpact.includes('IMPACT')) {
      return upperImpact;
    }
    
    // Otherwise, add "IMPACT" suffix
    if (upperImpact.includes('HIGH')) return 'HIGH IMPACT';
    if (upperImpact.includes('MEDIUM')) return 'MEDIUM IMPACT';
    if (upperImpact.includes('LOW')) return 'LOW IMPACT';
    
    // Default: return original with IMPACT
    return `${upperImpact} IMPACT`;
  };

  return (
    <div className={`impact-badge ${getImpactClass(impact)} ${className}`}>
      {formatImpactLabel(impact)}
    </div>
  );
};

export default ImpactBadge;