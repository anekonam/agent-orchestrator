import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  backgroundColor?: string;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, backgroundColor, onClick }) => {
  return (
    <div 
      className="stats-card-new" 
      style={{ 
        backgroundColor: backgroundColor || '#FFF',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <div className="stats-content">
        <span className="stat-title">{title}</span>
        <div className="stat-value">{value}</div>
      </div>
      {icon}
    </div>
  );
};

export default StatsCard;