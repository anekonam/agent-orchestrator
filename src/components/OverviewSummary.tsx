import React from 'react';
import { KeyPoints } from '../types/project';
import './OverviewSummary.css';
import SourcesList from './ui/SourcesList';
import KeyInsightCardGrid, { KeyInsightData } from './ui/KeyInsightCardGrid';

interface OverviewSummaryProps {
  executiveSummary?: string;
  keyInsights?: string[] | KeyPoints[];
  sources?: string[]
}

const OverviewSummary: React.FC<OverviewSummaryProps> = ({
  executiveSummary,
  keyInsights = [],
  sources,
}) => {
  // Separate string insights from KeyPoints objects
  const { stringInsights, keyPointsKPIs } = React.useMemo(() => {
    const strings: string[] = [];
    const keyPoints: KeyPoints[] = [];

    if (keyInsights && keyInsights.length > 0) {
      keyInsights.forEach((insight: any) => {
        if (typeof insight === 'string') {
          strings.push(insight);
        } else if (insight && typeof insight === 'object' && 'label' in insight && 'value' in insight && 'subtext' in insight) {
          // It's a KeyPoints object, treat it as a KPI
          keyPoints.push(insight as KeyPoints);
        }
      });
    }

    return { stringInsights: strings, keyPointsKPIs: keyPoints };
  }, [keyInsights]);

  // Process KeyPoints as KeyInsightData
  const processedInsights = React.useMemo(() => {
    if (keyPointsKPIs.length === 0) {
      return [];
    }

    return keyPointsKPIs.map((kp: KeyPoints): KeyInsightData => {
      return {
        title: kp.label,
        value: kp.value || '0',
        measurement: '',
        subtitle: kp.subtext || '',
        color: '#008585',
        backgroundColor: '#FFF'
      };
    });
  }, [keyPointsKPIs]);

  // Don't render anything if there's no data
  if (!executiveSummary && stringInsights.length === 0 && processedInsights.length === 0) {
    return null;
  }

  return (
    <div className="overview-summary">
      <div className="summary-content">
        {executiveSummary && (
          <div className="executive-summary-section">
            <h2 className="section-title">Executive Summary</h2>
            <p className="summary-text">{executiveSummary}</p>
          </div>
        )}

        <div className="key-insights-section">
          {((stringInsights && stringInsights.length > 0) || processedInsights.length) && (<h3 className="section-title">Key Insights</h3>)}
          {stringInsights && stringInsights.length > 0 && (
            <ul className="insights-list">
              {stringInsights.map((insight, index) => (
                <li key={index} className="insight-item">
                  {insight}
                </li>
              ))}
            </ul>
          )}

          {processedInsights.length > 0 && (
            <KeyInsightCardGrid insights={processedInsights} />
          )}
        </div>
      </div>
      {sources && sources.length > 0 && (
        <div className="overview-summary-footer">
          <SourcesList sources={sources} />
        </div>
      )}
    </div>
  );
};

export default OverviewSummary;