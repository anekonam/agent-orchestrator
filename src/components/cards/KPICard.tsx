import React from 'react';
import './KPICard.css';

interface KeyMetricCardProps {
  color: string;
  title: string;
  value: string | number;
  measurement?: string;
  subtitle?: string;
  backgroundColor?: string;
}

const KeyMetricCard: React.FC<KeyMetricCardProps> = ({
  color,
  title,
  value,
  measurement,
  subtitle,
  backgroundColor
}) => {
  // Determine background color based on the provided color
  const getBackgroundColor = () => {
    // If color is a hex code, create a lighter version
    if (color.startsWith('#')) {
      // Convert to a lighter shade by adding opacity
      return `${color}15`; // Adds 15% opacity for light background
    }
    // Otherwise return a default light version
    return '#F5F5F5';
  };

  // Check if value is numeric/short (good for large font)
  const isNumericOrShort = (val: string | number): boolean => {
    const valStr = String(val).trim();
    // Check if it's a number with common suffixes/prefixes
    const numericPattern = /^[\$£€¥]?[\d,]+\.?\d*[%MBKkmb]?$/;
    // Check if it's short text (5 words or fewer, 20 characters or fewer)
    const isShort = valStr.split(' ').length <= 5 && valStr.length <= 20;
    // Check if it's a simple rating or status
    const isRating = /^(High|Medium|Low|Critical|\d+\/\d+|\d+\.\d+\/\d+)$/i.test(valStr);
    
    return numericPattern.test(valStr) || isRating || (isShort && !valStr.includes(','));
  };

  return (
    <div 
      className="metric-card"
      style={{ backgroundColor: backgroundColor || getBackgroundColor() }}
    >
      <div className="metric-card-label">{title}</div>
      <div className="metric-card-value-container">
        <span 
          className={`metric-main-value ${isNumericOrShort(value) ? 'metric-value-large' : ''}`} 
          style={{ color }}
        >
          {value}
        </span>
        {measurement && (
          <span className="metric-unit" style={{ color }}>
            {measurement}
          </span>
        )}
      </div>
      {subtitle && (
        <div className="metric-subtitle">{subtitle}</div>
      )}
    </div>
  );
};

export default KeyMetricCard;

// Export backward compatibility alias
export { KeyMetricCard as KPICard };