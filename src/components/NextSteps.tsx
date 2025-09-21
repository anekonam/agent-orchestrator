import React from 'react';
import './NextSteps.css';

interface NextStepsProps {
  steps?: string[];
}

const NextSteps: React.FC<NextStepsProps> = ({ steps = [] }) => {
  // Default next steps data
  const defaultSteps: string[] = [
    "Establish a cross-functional task force led by Digital Innovation and IT to initiate the mobile app redesign project within 30 days.",
    "Initiate discussions with fintech partners and begin the open banking integration blueprint within the next 60 days.",
    "Schedule a stakeholder review meeting with customer experience, risk, and technology teams to finalize the AI personalization roadmap within 90 days."
  ];

  // Use provided steps or fallback to default
  const displaySteps = steps && steps.length > 0 ? steps : defaultSteps;

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M15.1521 7.46989C15.4448 7.00155 16.0617 6.85918 16.5301 7.15189C16.9649 7.42369 17.1188 7.97507 16.9042 8.42743L16.8481 8.52989L12.0026 16.2825C11.9243 16.408 11.8234 16.5178 11.705 16.6065C11.2102 16.9777 10.522 16.9088 10.1091 16.4669L10.025 16.3665L7.20006 12.5999C6.86869 12.1581 6.95823 11.5313 7.40006 11.1999C7.8079 10.894 8.37335 10.9468 8.71856 11.3042L8.80006 11.3999L10.9241 14.2329L15.1521 7.46989Z" fill="#008585"/>
    </svg>
  );

  return (
    <div className="next-steps">
      <h2 className="section-title">Recommended Next Steps</h2>
      
      <div className="steps-timeline">
        {displaySteps.map((step, index) => (
          <div key={index} className="step-item">
            <div className="step-indicator">
              <div>
                <CheckIcon />
              </div>
            </div>
            
            <div className="step-content">
              <p className="step-description">{step}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextSteps;