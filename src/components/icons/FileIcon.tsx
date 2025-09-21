import React from 'react';
import { IconProps } from '../../types/icon';

const FileIcon: React.FC<IconProps> = ({ className, size = 20 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
    <path d="M11 17C11 16.4477 11.4477 16 12 16H20C20.5523 16 21 16.4477 21 17C21 17.5523 20.5523 18 20 18H12C11.4477 18 11 17.5523 11 17Z" fill="currentColor"/>
    <path d="M12 20C11.4477 20 11 20.4477 11 21C11 21.5523 11.4477 22 12 22H20C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20H12Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M7 3C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V27C5 27.5304 5.21071 28.0391 5.58579 28.4142C5.96086 28.7893 6.46957 29 7 29H25C25.5304 29 26.0391 28.7893 26.4142 28.4142C26.7893 28.0391 27 27.5304 27 27V11C27 10.7348 26.8946 10.4804 26.7071 10.2929L19.7071 3.29289C19.5196 3.10536 19.2652 3 19 3H7ZM18 5L7 5L7 27H25V12H19C18.4477 12 18 11.5523 18 11V5ZM23.5858 9.99998L20 6.41421V9.99998H23.5858Z" fill="currentColor"/>
  </svg>

  );
};

export default FileIcon;