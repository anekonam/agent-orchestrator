import React from 'react';
import { IconProps } from '../../types/icon';

const RightArrowIcon: React.FC<IconProps> = ({ className, size = 16 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
    >
    <path d="M14.6129 5.2097C14.2206 4.90468 13.6534 4.93241 13.2929 5.29289L13.2097 5.3871C12.9047 5.77939 12.9324 6.34662 13.2929 6.70711L17.5851 11H4L3.88338 11.0067C3.38604 11.0645 3 11.4872 3 12C3 12.5523 3.44772 13 4 13H17.5851L13.2929 17.2929L13.2097 17.3871C12.9047 17.7794 12.9324 18.3466 13.2929 18.7071C13.6834 19.0976 14.3166 19.0976 14.7071 18.7071L20.7071 12.7071L20.7903 12.6129C21.0953 12.2206 21.0676 11.6534 20.7071 11.2929L14.7071 5.29289L14.6129 5.2097Z" fill="currentColor"/>
  </svg>
  );
};

export default RightArrowIcon;