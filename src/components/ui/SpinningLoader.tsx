import React from 'react';
import './SpinningLoader.css';

interface SpinningLoaderProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  text?: string;
}

const SpinningLoader: React.FC<SpinningLoaderProps> = ({ 
  size = 'medium', 
  className = '',
  text
}) => {
  return (
    <div className={`spinning-loader-container ${className}`}>
      <div className={`spinning-loader spinning-loader-${size}`}>
        <div className="spinning-loader-circle"></div>
      </div>
      {text && (
        <div className="spinning-loader-text">
          {text}
        </div>
      )}
    </div>
  );
};

export default SpinningLoader;