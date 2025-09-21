import React from 'react';
import StrategicRecommendationCard from './cards/StrategicRecommendationCard';
import './OverviewRecommendations.css';

// Utility function to format recommendation text with proper lists and formatting
const formatRecommendationText = (text: string): React.ReactElement => {
  if (!text || typeof text !== 'string') {
    return <span>{text}</span>;
  }

  // Clean up redundant headers first
  let cleanedText = text
    .replace(/^Strategic Recommendation:\s*/i, '')
    .replace(/^Strategic Implication for FAB:\s*/i, '')
    .replace(/^Recommendation:\s*/i, '')
    .trim();

  // Split text into sections and handle bullet points
  const parts = cleanedText.split(/(?=•|\d+\.|Business Impact:|FAB-Specific Action Plan:|Executive Actions Required:)/);
  
  return (
    <div className="formatted-recommendation">
      {parts.map((part, index) => {
        const trimmedPart = part.trim();
        if (!trimmedPart) return null;

        // Handle section headers
        if (trimmedPart.startsWith('Business Impact:') || 
            trimmedPart.startsWith('FAB-Specific Action Plan:') || 
            trimmedPart.startsWith('Executive Actions Required:')) {
          const [header, ...content] = trimmedPart.split(':');
          return (
            <div key={index} className="recommendation-section">
              <h6 className="section-header">{header}:</h6>
              <div className="section-content">
                {formatRecommendationText(content.join(':'))}
              </div>
            </div>
          );
        }

        // Handle bullet points
        if (trimmedPart.includes('•')) {
          const bulletItems = trimmedPart.split('•').filter(item => item.trim());
          const [intro, ...items] = bulletItems;
          
          return (
            <div key={index} className="bullet-section">
              {intro && intro.trim() && <p className="intro-text">{intro.trim()}</p>}
              <ul className="bullet-list">
                {items.map((item, itemIdx) => (
                  <li key={itemIdx} className="bullet-item">{item.trim()}</li>
                ))}
              </ul>
            </div>
          );
        }

        // Handle numbered lists
        if (/^\d+\./.test(trimmedPart)) {
          const lines = trimmedPart.split('\n').filter(line => line.trim());
          const numberedItems = lines.filter(line => /^\d+\./.test(line.trim()));
          const otherText = lines.filter(line => !/^\d+\./.test(line.trim())).join(' ');
          
          return (
            <div key={index} className="numbered-section">
              {otherText && <p className="intro-text">{otherText}</p>}
              <ol className="numbered-list">
                {numberedItems.map((item, itemIdx) => (
                  <li key={itemIdx} className="numbered-item">
                    {item.replace(/^\d+\.\s*/, '')}
                  </li>
                ))}
              </ol>
            </div>
          );
        }

        // Regular paragraph text
        return <p key={index} className="recommendation-paragraph">{trimmedPart}</p>;
      }).filter(Boolean)}
    </div>
  );
};

interface RecommendationItem {
  title?: string;
  description?: string;
  impact?: string;
  priority?: string;
  timeline?: string;
  [key: string]: any;
}

interface OverviewRecommendationsProps {
  recommendations?: RecommendationItem[] | string[] | any[];
}

const OverviewRecommendations: React.FC<OverviewRecommendationsProps> = ({
  recommendations = []
}) => {
  const processedRecommendations = React.useMemo(() => {
    if (!recommendations || recommendations.length === 0) {
      return [];
    }
    
    const processed = recommendations.map((rec, index) => {
      if (typeof rec === 'string') {
        return {
          title: rec,
          description: '',
          impact: '',
          priority: 'MEDIUM',
          timeline: '6-12 MONTHS'
        };
      }
      return {
        title: rec.title || `Recommendation ${index + 1}`,
        description: rec.description || '',
        impact: rec.impact || '',
        priority: rec.priority || 'MEDIUM',
        timeline: rec.timeline || '6-12 MONTHS',
        ...rec
      };
    });

    // Sort by priority: High > Medium > Low (User Story 11445)
    const priorityOrder: { [key: string]: number } = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    return processed.sort((a, b) => {
      const priorityA = priorityOrder[a.priority.toUpperCase()] || 2;
      const priorityB = priorityOrder[b.priority.toUpperCase()] || 2;
      return priorityB - priorityA; // Sort highest to lowest
    });
  }, [recommendations]);

  // Return null if no recommendations
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  // Check if all recommendations are strings
  const isStringArray = recommendations.every(rec => typeof rec === 'string');

  // Render as bulleted list if all recommendations are strings
  if (isStringArray) {
    return (
      <div className="overview-recommendations">
        <h2 className="section-title">Strategic Recommendations</h2>
        
        <ul className="recommendations-list">
          {recommendations.map((rec, index) => (
            <li key={index} className="recommendation-list-item">
              {formatRecommendationText(rec)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Render as cards for structured recommendations
  return (
    <div className="overview-recommendations">
      <h2 className="section-title">Strategic Recommendations</h2>

      <div className="recommendations-grid">
        {processedRecommendations.map((rec, index) => (
          <StrategicRecommendationCard
            key={index}
            recommendation={{
              id: index,
              title: rec.title,
              description: rec.description || '',
              impact: rec.impact || '',
              priority: rec.priority as 'HIGH' | 'MEDIUM' | 'LOW',
              timeline: rec.timeline,
              ...rec
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default OverviewRecommendations;
