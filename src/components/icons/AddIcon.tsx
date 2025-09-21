import React from 'react';
import { IconProps } from '../../types/icon';

const AddIcon: React.FC<IconProps> = ({ className, size = 20 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
  <path d="M10.8277 3.23615C10.7796 2.8217 10.4274 2.5 10 2.5C9.53976 2.5 9.16667 2.8731 9.16667 3.33333V9.16667H3.33333L3.23615 9.17227C2.8217 9.22041 2.5 9.57264 2.5 10C2.5 10.4602 2.8731 10.8333 3.33333 10.8333H9.16667V16.6667L9.17227 16.7639C9.22041 17.1783 9.57264 17.5 10 17.5C10.4602 17.5 10.8333 17.1269 10.8333 16.6667V10.8333H16.6667L16.7639 10.8277C17.1783 10.7796 17.5 10.4274 17.5 10C17.5 9.53976 17.1269 9.16667 16.6667 9.16667H10.8333V3.33333L10.8277 3.23615Z" fill="currentColor"/>
</svg>
  );
};

export default AddIcon;