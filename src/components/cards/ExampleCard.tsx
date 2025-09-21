import React from 'react';

interface ExampleCardProps {
  icon: string;
  title: string;
  onClick: () => void;
}

const ExampleCard: React.FC<ExampleCardProps> = ({ icon, title, onClick }) => {
  return (
    <div className="example-card" onClick={onClick}>
      <div className="example-icon">
        <img src={icon} alt="" width="48" height="48" />
      </div>
      <p className="example-text">{title}</p>
    </div>
  );
};

export default ExampleCard;