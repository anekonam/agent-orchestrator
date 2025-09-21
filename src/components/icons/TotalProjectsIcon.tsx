import React from 'react';
import { IconProps } from '../../types/icon';

const TotalProjectsIcon: React.FC<IconProps> = ({ className, width = 54, height = 32 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 54 32" 
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_2962_9442)">
        <path d="M9.98723 18.0525H31.4404C36.2618 18.0525 40.1703 14.144 40.1703 9.32263C40.1703 4.50124 36.2618 0.592773 31.4404 0.592773H9.41883C4.59744 0.592773 0.688972 4.50124 0.688972 9.32263C0.688059 10.0245 0.76939 10.9255 1.08101 11.9188C1.77278 14.1221 3.20019 15.512 4.04183 16.1937C4.20541 16.3263 4.28856 16.5337 4.25841 16.742C4.20541 17.1012 4.07107 17.5992 3.72656 18.089C3.45058 18.4802 3.11794 18.7561 2.79445 18.9508C2.3951 19.1902 2.51116 19.7979 2.9699 19.8811C3.36102 19.9523 3.80149 19.9898 4.28217 19.9615C6.16284 19.8509 8.21165 18.8704 9.05512 18.3285C9.33384 18.1494 9.65643 18.0516 9.98815 18.0516L9.98723 18.0525Z" fill="url(#paint0_linear_2962_9442)"/>
        <path d="M44.0129 29.3997H22.5597C17.7383 29.3997 13.8298 25.4912 13.8298 20.6698C13.8298 15.8484 17.7383 11.9399 22.5597 11.9399H44.5813C49.4027 11.9399 53.3111 15.8484 53.3111 20.6698C53.312 21.3716 53.2307 22.2727 52.9191 23.266C52.2273 25.4693 50.7999 26.8592 49.9583 27.5409C49.7947 27.6734 49.7115 27.8809 49.7417 28.0892C49.7947 28.4484 49.929 28.9464 50.2735 29.4362C50.5495 29.8273 50.8821 30.1033 51.2056 30.298C51.605 30.5374 51.4889 31.1451 51.0302 31.2282C50.6391 31.2995 50.1986 31.337 49.7179 31.3087C47.8373 31.1981 45.7884 30.2175 44.945 29.6756C44.6663 29.4965 44.3437 29.3987 44.0119 29.3987L44.0129 29.3997Z" fill="url(#paint1_linear_2962_9442)"/>
        <path d="M22.7114 29.1274C18.0344 29.1274 14.2429 25.3359 14.2429 20.6589C14.2429 15.9819 18.0344 12.1904 22.7114 12.1904H44.0741C48.7511 12.1904 22.7114 29.1283 22.7114 29.1283V29.1274Z" fill="url(#paint2_linear_2962_9442)"/>
        <path d="M36.5761 11.7516C39.7709 11.9398 39.8129 11.8009 39.95 9.33081C39.95 4.6538 36.1585 0.862305 31.4815 0.862305H10.1188C-12.261 12.9258 36.5761 11.7525 36.5761 11.7525V11.7516Z" fill="url(#paint3_linear_2962_9442)"/>
      </g>
      <defs>
        <linearGradient id="paint0_linear_2962_9442" x1="20.4296" y1="0.592773" x2="20.4296" y2="19.971" gradientUnits="userSpaceOnUse">
          <stop stopColor="#81ACF8"/>
          <stop offset="0.14" stopColor="#7C95EE"/>
          <stop offset="0.36" stopColor="#7677E1"/>
          <stop offset="0.59" stopColor="#7262D7"/>
          <stop offset="0.8" stopColor="#6F55D1"/>
          <stop offset="1" stopColor="#6F51D0"/>
        </linearGradient>
        <linearGradient id="paint1_linear_2962_9442" x1="30.8139" y1="9.61277" x2="37.0707" y2="34.7097" gradientUnits="userSpaceOnUse">
          <stop offset="0.3" stopColor="#81ACF8"/>
          <stop offset="0.44" stopColor="#80A7F5"/>
          <stop offset="0.59" stopColor="#7D98EF"/>
          <stop offset="0.76" stopColor="#7881E5"/>
          <stop offset="0.93" stopColor="#7160D6"/>
          <stop offset="1" stopColor="#6F51D0"/>
        </linearGradient>
        <linearGradient id="paint2_linear_2962_9442" x1="25.8289" y1="7.93946" x2="36.1324" y2="34.7815" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="0.05" stopColor="#F4E7FD" stopOpacity="0.87"/>
          <stop offset="0.15" stopColor="#DFB9FA" stopOpacity="0.61"/>
          <stop offset="0.25" stopColor="#CE92F7" stopOpacity="0.39"/>
          <stop offset="0.33" stopColor="#C074F5" stopOpacity="0.22"/>
          <stop offset="0.41" stopColor="#B75EF4" stopOpacity="0.1"/>
          <stop offset="0.48" stopColor="#B151F3" stopOpacity="0.03"/>
          <stop offset="0.53" stopColor="#AF4DF3" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="paint3_linear_2962_9442" x1="26.6972" y1="-3.74232" x2="19.3088" y2="15.5049" gradientUnits="userSpaceOnUse">
          <stop stopColor="white"/>
          <stop offset="0.55" stopColor="#AF4DF3" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="clip0_2962_9442">
          <rect width="52.6222" height="30.7253" fill="white" transform="translate(0.688965 0.592773)"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default TotalProjectsIcon;