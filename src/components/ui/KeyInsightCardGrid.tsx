import React from 'react';
import KPICard from '../cards/KPICard';
import './KeyInsightCardGrid.css';

export interface KeyInsightData {
  title: string;
  value: string;
  measurement?: string;
  subtitle?: string;
  color?: string;
  backgroundColor?: string;
}

interface KeyInsightCardGridProps {
  insights: KeyInsightData[];
  className?: string;
}

const KeyInsightCardGrid: React.FC<KeyInsightCardGridProps> = ({ insights, className = '' }) => {
  // Dynamic pattern generation based on total cards
  const getRowPattern = (total: number): number[] => {
    if (total === 1) return [1];
    if (total === 2) return [2];
    if (total === 3) return [3];

    const pattern: number[] = [];
    let remaining = total;

    // Fill with 3s as much as possible
    while (remaining > 0) {
      if (remaining % 3 === 0) {
        // Perfect division by 3
        pattern.push(...Array(remaining / 3).fill(3));
        remaining = 0;
      } else if (remaining % 3 === 1) {
        // Remainder 1: we need to convert to 2-2
        if (remaining === 4) {
          pattern.push(2, 2);
          remaining = 0;
        } else if (remaining >= 7) {
          // Add 3s until we have 4 left, then add 2-2
          const threesCount = Math.floor((remaining - 4) / 3);
          pattern.push(...Array(threesCount).fill(3));
          pattern.push(2, 2);
          remaining = 0;
        } else {
          // Should not happen with our logic
          pattern.push(remaining);
          remaining = 0;
        }
      } else if (remaining % 3 === 2) {
        // Remainder 2: add 3s and end with 2
        if (remaining === 2) {
          pattern.push(2);
          remaining = 0;
        } else if (remaining === 5) {
          pattern.push(3, 2);
          remaining = 0;
        } else {
          // Add 3s until we have 2 left
          const threesCount = Math.floor((remaining - 2) / 3);
          pattern.push(...Array(threesCount).fill(3));
          pattern.push(2);
          remaining = 0;
        }
      }
    }

    return pattern;
  };

  if (!insights || insights.length === 0) {
    return null;
  }

  const pattern = getRowPattern(insights.length);

  return (
    <div className={`key-insight-cards-grid ${className}`}>
      {insights.map((insight, index) => {
        // Find which row this card belongs to
        let currentRow = 0;
        let cardPositionInRow = index;
        for (let i = 0; i < pattern.length; i++) {
          if (cardPositionInRow < pattern[i]) {
            currentRow = i;
            break;
          }
          cardPositionInRow -= pattern[i];
        }

        // Determine card class based on cards in current row
        const cardsInRow = pattern[currentRow];
        let cardClass = '';
        if (cardsInRow === 1) {
          cardClass = 'full-width-card';
        } else if (cardsInRow === 2) {
          cardClass = 'half-width-card';
        } else if (cardsInRow === 3) {
          cardClass = 'third-width-card';
        }

        return (
          <div key={index} className={`key-insight-card-wrapper ${cardClass}`}>
            <KPICard
              title={insight.title}
              value={insight.value}
              measurement={insight.measurement || ''}
              subtitle={insight.subtitle || ''}
              color={insight.color || '#008585'}
              backgroundColor={insight.backgroundColor || '#FFF'}
            />
          </div>
        );
      })}
    </div>
  );
};

export default KeyInsightCardGrid;