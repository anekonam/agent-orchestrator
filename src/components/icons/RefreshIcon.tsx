import React from 'react';
import { IconProps } from '../../types/icon';

const RefreshIcon: React.FC<IconProps> = ({ className, size = 24 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_4481_12004)">
        <path opacity="0.2" d="M15.75 9H20.25V4.5L15.75 9Z" fill="#003DA6"/>
        <path opacity="0.2" d="M8.25 15H3.75V19.5L8.25 15Z" fill="#003DA6"/>
        <path d="M15.75 9H20.25V4.5L15.75 9Z" stroke="#003DA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.25 15H3.75V19.5L8.25 15Z" stroke="#003DA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17.9998 18.0002C17.9998 18.0002 15.7498 20.2502 11.9998 20.2502C9.28109 20.2502 7.16984 18.8439 5.76172 17.4883" stroke="#003DA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6C6 6 8.25 3.75 12 3.75C14.7188 3.75 16.83 5.15625 18.2381 6.51188" stroke="#003DA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_4481_12004">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default RefreshIcon;