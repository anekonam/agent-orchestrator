import React from 'react';

interface EditIconProps {
  size?: number;
  className?: string;
  color?: string;
}

const EditIcon: React.FC<EditIconProps> = ({ size = 32, className = '', color = '#222325' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 33 32"
      fill="none"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.07441 28C10.4013 28 11.6739 27.4729 12.6122 26.5347L27.6896 11.4572C28.9922 10.1546 28.9922 8.0427 27.6896 6.7401L25.9264 4.97695C24.6238 3.67435 22.5119 3.67435 21.2093 4.97695L6.13204 20.0542C5.19367 20.9925 4.6665 22.2652 4.6665 23.5922V25.7207C4.6665 26.9795 5.68697 28 6.94578 28H9.07441ZM22.4116 12.964L19.7029 10.2553L8.0176 21.9399C7.57937 22.3781 7.33317 22.9724 7.33317 23.5922V25.3333H9.07441C9.69407 25.3333 10.2884 25.0872 10.7266 24.6491L22.4116 12.964ZM21.5883 8.36949L23.0951 6.86235C23.3563 6.60137 23.7797 6.60144 24.0408 6.86257L25.8039 8.62572C26.0651 8.88692 26.0651 9.31042 25.8039 9.57163L24.2972 11.0784L21.5883 8.36949Z"
        fill={color}
      />
    </svg>
  );
};

export default EditIcon;