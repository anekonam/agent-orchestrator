import React from 'react';
import { BadgeProps } from '../../../types/badge';
import './Badge.css';

const Badge: React.FC<BadgeProps> = ({ value, className }) => {
  return (
    <span className={`badge ${className || ''}`}>
      {value}
    </span>
  );
};

export default Badge;