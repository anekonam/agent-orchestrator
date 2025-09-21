import React from 'react';
import { IconProps } from '../../types/icon';

const DoubleCheckIcon: React.FC<IconProps> = ({ className = '', size = 13 }) => {
  const width = size;
  const height = Math.round(size * 6 / 13); // Maintain aspect ratio
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 13 6" 
      fill="none"
      className={className}
    >
      <path 
        d="M7.99318 1.09743C8.23883 0.846375 8.23883 0.43934 7.99318 0.188289C7.74753 -0.0627628 7.34925 -0.0627628 7.1036 0.188289L2.93547 4.44802L1.07382 2.54553C0.828157 2.29448 0.429876 2.29449 0.184229 2.54555C-0.0614176 2.79661 -0.0614086 3.20364 0.184249 3.45469L2.4907 5.81172C2.73636 6.06276 3.13463 6.06276 3.38028 5.81171L7.99318 1.09743Z" 
        fill="currentColor"
      />
      <path 
        d="M12.8158 1.09743C13.0614 0.846375 13.0614 0.43934 12.8158 0.188289C12.5701 -0.0627628 12.1718 -0.0627628 11.9262 0.188289L7.75805 4.44802L6.97765 3.65049C6.73199 3.39945 6.33371 3.39946 6.08806 3.65051C5.84242 3.90157 5.84242 4.3086 6.08808 4.55965L7.31328 5.81172C7.55893 6.06276 7.95721 6.06276 8.20286 5.81171L12.8158 1.09743Z" 
        fill="currentColor"
      />
    </svg>
  );
};

export default DoubleCheckIcon;