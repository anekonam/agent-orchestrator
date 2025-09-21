import React from 'react';

interface FileUploadIconProps {
  size?: number;
  className?: string;
}

const FileUploadIcon: React.FC<FileUploadIconProps> = ({ size = 72, className }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 72 72" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M8.99976 4.5H38.9998L62.9998 28.5V67.5H25.8748C16.555 67.5 8.99976 59.9448 8.99976 50.625V4.5Z" 
        fill="url(#paint0_linear_3779_77983)"
      />
      <path 
        d="M63 28.5L39 4.5V28.5H63Z" 
        fill="url(#paint1_linear_3779_77983)"
      />
      <circle 
        cx="24.5924" 
        cy="51.5926" 
        r="15.5926" 
        fill="#013DA6"
      />
      <rect 
        x="33.2446" 
        y="49.3486" 
        width="5.26376" 
        height="17.3046" 
        transform="rotate(90 33.2446 49.3486)" 
        fill="white"
      />
      <rect 
        x="27.2241" 
        y="60.6328" 
        width="5.26376" 
        height="17.3046" 
        transform="rotate(-180 27.2241 60.6328)" 
        fill="white"
      />
      <defs>
        <linearGradient 
          id="paint0_linear_3779_77983" 
          x1="28.9813" 
          y1="67.5" 
          x2="28.9813" 
          y2="4.5" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B6B5EC"/>
          <stop offset="0.470883" stopColor="#80ADF2"/>
          <stop offset="1" stopColor="#4FA7FF"/>
        </linearGradient>
        <linearGradient 
          id="paint1_linear_3779_77983" 
          x1="39.3125" 
          y1="56.875" 
          x2="40.1109" 
          y2="2.7565" 
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#67ABF7"/>
          <stop offset="0.233641" stopColor="#003DA6"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default FileUploadIcon;