import React from 'react';
import './SWOTAnalysis.css';
import { SWOTData } from '../types/project';

interface SWOTAnalysisProps {
  swotData?: SWOTData;
}

const SWOTAnalysis: React.FC<SWOTAnalysisProps> = ({ swotData }) => {
  // Return null if no data is provided
  if (!swotData) {
    return null;
  }

  const data = swotData;

  // Check if all SWOT arrays are empty
  const hasStrengths = data.strengths && data.strengths.length > 0;
  const hasWeaknesses = data.weaknesses && data.weaknesses.length > 0;
  const hasOpportunities = data.opportunities && data.opportunities.length > 0;
  const hasThreats = data.threats && data.threats.length > 0;

  // Return null if all sections are empty
  if (!hasStrengths && !hasWeaknesses && !hasOpportunities && !hasThreats) {
    return null;
  }

  const swotSections = [
    {
      title: "Strengths",
      items: data.strengths || [],
      icon: "/fab-illustrations/illustration_success_270.svg",
      className: "strengths"
    },
    {
      title: "Opportunity",
      items: data.opportunities || [],
      icon: "/fab-illustrations/illustration_light_bulb_270.svg",
      className: "opportunities"
    },
    {
      title: "Weakness",
      items: data.weaknesses || [],
      icon: "/fab-illustrations/illustration_device_delinked_270.svg",
      className: "weaknesses"
    },
    {
      title: "Threats",
      items: data.threats || [],
      icon: "/fab-illustrations/illustration_warning_270.svg",
      className: "threats"
    }
  ].filter(section => section.items.length > 0); // Only include sections with data

  // If no sections have data after filtering, return null
  if (swotSections.length === 0) {
    return null;
  }

  return (
    <div className="swot-analysis">
      <h2 className="swot-title">Strategic SWOT Analysis</h2>
      
      <div className="swot-grid">
        {swotSections.map((section, index) => (
          <div key={index} className={`swot-section ${section.className}`}>
            <div className="swot-section-header">
              <img 
                src={section.icon} 
                alt={section.title} 
                className="swot-icon"
              />
              <h3 className="swot-section-title">{section.title}</h3>
            </div>
            
            <ul className="swot-list">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="swot-item">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SWOTAnalysis;