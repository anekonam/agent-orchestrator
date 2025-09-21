import React from 'react';
import { KeyPoints } from '../types/project';
import './TabSummary.css';
import SourcesList from './ui/SourcesList';
import KeyInsightCardGrid, { KeyInsightData } from './ui/KeyInsightCardGrid';

interface keyInsightItem {
  label?: string;
  value?: string | number;
  change?: string;
  trend?: string;
  subtext?: string;
  [key: string]: any;
}


interface TabSummaryProps {
  content?: string;
  keyInsights?: (keyInsightItem | KeyPoints)[] | string[];
  sources?: string[];
  title: string;
}

const TabSummary: React.FC<TabSummaryProps> = ({
  content,
  title,
  sources,
  keyInsights = []
}) => {
  // Separate string insights from KPI objects
  const { keyInsightsList, kpiObjects } = React.useMemo(() => {
    if (!keyInsights || keyInsights.length === 0) {
      return { keyInsightsList: [], kpiObjects: [] };
    }

    const strings: string[] = [];
    const objects: any[] = [];

    keyInsights.forEach((keyInsight: any) => {
      if (typeof keyInsight === 'string') {
        strings.push(keyInsight);
      } else if (keyInsight && typeof keyInsight === 'object') {
        // Check if it's a KeyPoints object with label, value, and subtext
        // These should be rendered as KPI cards, not text insights
        if ('label' in keyInsight || 'value' in keyInsight || 'title' in keyInsight) {
          objects.push(keyInsight);
        } else {
          // If it's some other object format, convert to string
          strings.push(JSON.stringify(keyInsight));
        }
      }
    });

    return { keyInsightsList: strings, kpiObjects: objects };
  }, [keyInsights]);

  // Process KPI objects as KeyInsightData
  const processedInsights = React.useMemo((): KeyInsightData[] => {
    if (!kpiObjects || kpiObjects.length === 0) {
      return [];
    }

    return kpiObjects.map((keyInsight: any): KeyInsightData => {
      // Check if it's already in processed format
      if ('title' in keyInsight && !('label' in keyInsight)) {
        return {
          ...keyInsight,
          color: keyInsight.color || '#008585',
          backgroundColor: keyInsight.backgroundColor || '#FFF'
        };
      }

      // Transform raw KPI format
      const valueMatch = keyInsight.value?.toString().match(/^([\d.-]+)\s*(.*)$/);
      const numericValue = valueMatch ? valueMatch[1] : keyInsight.value;
      const unit = valueMatch ? valueMatch[2] : '';

      return {
        title: keyInsight.label || keyInsight.title || 'Metric',
        value: numericValue || keyInsight.value || '0',
        measurement: unit || keyInsight.measurement || '',
        subtitle: keyInsight.subtext || keyInsight.change || keyInsight.trend || keyInsight.subtitle || '',
        color: keyInsight.color || '#008585',
        backgroundColor: keyInsight.backgroundColor || '#FFF'
      };
    });
  }, [kpiObjects]);

  return (
    <div className="tab-summary">
      <div className="summary-content">
        <div className="executive-summary-section">
          <h2 className="section-title">{title}</h2>
          <p className="summary-text">{content}</p>
        </div>
      </div>

      <div className="key-insights-section">
        {((keyInsightsList && keyInsightsList.length > 0) || processedInsights.length > 0) && (<h3 className="section-title">Key Insights</h3>)}
        {keyInsightsList && keyInsightsList.length > 0 && (
          <ul className="insights-list">
            {keyInsightsList.map((insight, index) => (
              <li key={index} className="insight-item">
                {typeof insight === 'string' ? insight : JSON.stringify(insight)}
              </li>
            ))}
          </ul>
        )}

        {processedInsights.length > 0 && (
          <KeyInsightCardGrid insights={processedInsights} />
        )}
      </div>
      {sources && sources.length > 0 && (
        <div className="tab-summary-footer">
          <SourcesList sources={sources}/>
        </div>
        )}
    </div>
  );
};

export default TabSummary;