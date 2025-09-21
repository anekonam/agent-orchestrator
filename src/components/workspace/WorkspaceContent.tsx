import React, { useState, useEffect, useRef } from 'react';
import RefreshIcon from '../icons/RefreshIcon';
import ExportIcon from '../icons/ExportIcon';
// import DisabledExportModal from '../modals/DisabledExportModal';
import ReportDialogDetails from '../modals/ReportDialogDetails';
import ChartVisualization from '../charts/ChartVisualization';
import TableVisualization from '../TableVisualization';
import KPICard from '../cards/KPICard';
import OverviewSummary from '../OverviewSummary';
import OverviewPositioning from '../OverviewPositioning';
import OverviewRecommendations from '../OverviewRecommendations';
import SWOTAnalysis from '../SWOTAnalysis';
import NextSteps from '../NextSteps';
import Toast from '../ui/Toast';
import { Project } from '../../types/project';
import { StreamingQueryResponse } from '../../services/streamingApi';
import './WorkspaceContent.css';
import TabSummary from '../TabSummary';

interface WorkspaceContentProps {
  project: Project;
  streamResult?: StreamingQueryResponse;
  isStreaming?: boolean;
  isFollowUpQuery?: boolean;
  onSyncProject?: () => void;
  isSyncing?: boolean;
  syncProgress?: number;
}

const WorkspaceContent: React.FC<WorkspaceContentProps> = ({ project, streamResult, isStreaming = false, isFollowUpQuery = false, onSyncProject, isSyncing = false, syncProgress = 0 }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const contentBodyRef = useRef<HTMLDivElement>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');



  // Typing effect for the streaming text
  useEffect(() => {
    // Determine the text to display based on state
    let text = '';
    if (isSyncing) {
      text = 'Syncing Dashboard...';
    } else if (streamResult?.status === 'pending_approval' && streamResult?.executionPlan) {
      text = 'Waiting Approval...';
    } else {
      text = 'Conducting Analysis...';
    }

    if ((!isStreaming && !isSyncing) || isFollowUpQuery) {
      setTypedText('');
      return;
    }

    let index = 0;
    let typeInterval: NodeJS.Timeout;
    let retypeTimeout: NodeJS.Timeout;

    const startTyping = () => {
      index = 0;
      setTypedText('');

      typeInterval = setInterval(() => {
        if (index < text.length) {
          setTypedText(text.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          // Wait 2 seconds, then retype
          retypeTimeout = setTimeout(() => {
            if (isStreaming || isSyncing) startTyping();
          }, 2000);
        }
      }, 60); // 60ms per character for slower typing
    };

    startTyping();

    return () => {
      clearInterval(typeInterval);
      clearTimeout(retypeTimeout);
    };
  }, [isStreaming, isSyncing, isFollowUpQuery, streamResult?.status, streamResult?.executionPlan]);

  const handleSyncProject = () => {
    if (onSyncProject) {
      onSyncProject();
    }
  };

  // Show/hide toast based on syncing state
  useEffect(() => {
    if (isSyncing) {
      setToastMessage('Syncing project data...');
      setToastType('info');
      setToastVisible(true);
    } else if (toastMessage === 'Syncing project data...') {
      // Hide the toast when syncing completes
      setToastVisible(false);
    }
  }, [isSyncing]);

  const handleExport = () => {
    setIsExportDialogOpen(true);
  };

  // Get the last sync time - use streamResult.endTime if available, otherwise fall back to project.updated_at
  const getLastSyncTime = () => {
    if (streamResult?.endTime) {
      return new Date(streamResult.endTime);
    }
    return new Date(project.updated_at);
  };

  const handleExportDialogClose = () => {
    setIsExportDialogOpen(false);
  };

  const handleExportConfirm = async (options: any, error?: string) => {

    if (error) {
      // Show error toast
      setToastMessage(error);
      setToastType('error');
      setToastVisible(true);
    } else if (options.format === 'pdf') {
      // Show success toast for PDF
      setToastMessage('PDF report exported successfully');
      setToastType('success');
      setToastVisible(true);
    } else if (options.format === 'powerpoint') {
      // PowerPoint not yet implemented
      setToastMessage('PowerPoint export coming soon');
      setToastType('info');
      setToastVisible(true);
    }
  };

  // Helper function to get areas with fallback
  const getAreas = () => {
    // Primary: Check direct areas property (new structure)
    // Fallback: Check structured_response.areas (legacy structure)
    return streamResult?.structured_response?.areas || streamResult?.areas || {};
  };

  // Generate dynamic tabs based on structured response areas
  const getDynamicTabs = () => {
    const tabsList = [];

    // Always add Overview tab first if it's not already present
    const overviewTab = {
      id: 'overview',
      label: 'Overview',
      originalKey: 'Overview'
    };

    const areas = getAreas();
    if (areas && Object.keys(areas).length > 0) {
      const areaNames = Object.keys(areas);

      // Check if Overview already exists in the areas
      const hasOverview = areaNames.some(name =>
        name.toLowerCase() === 'overview' ||
        name.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-') === 'overview'
      );

      // Add Overview tab if it doesn't exist
      if (!hasOverview) {
        tabsList.push(overviewTab);
      }

      // Add all area tabs
      const areaTabs = areaNames.map(areaName => ({
        id: areaName.toLowerCase().replace(/\s+/g, '-').replace(/_/g, '-'),
        label: areaName.replace(/_/g, ' '),
        originalKey: areaName // Store the original key for data lookup
      }));

      tabsList.push(...areaTabs);
    } else {
      // If no areas at all, just add Overview tab
      tabsList.push(overviewTab);
    }

    return tabsList;
  };

  const tabs = getDynamicTabs();


  // Helper function to render area content dynamically
  const renderAreaContent = (areaName: string, areaData: any) => {
    if (!areaData) return <p>No data available for this area.</p>;

    let tabTitle = 'Strategic Positioning';
    switch (areaName) {
      case 'Market':
        tabTitle = 'Market Outlook';
        break;
      case 'Trends':
        tabTitle = 'Trend Analysis';
        break;
      case 'Competitor':
        tabTitle = 'Competitive Landscape';
        break;
      case 'Customer Insights':
      case 'Customer':
        tabTitle = 'Customer Segmentation ';
        break;
      case 'Technology':
        tabTitle = 'Technology Landscape';
        break;

      default:
        break;
    }

    return (
      <div className="area-content">
        {/* Render content if available */}
        {areaData.content && (
          <TabSummary
            content={areaData.content}
            title={areaName}
            keyInsights={areaData.key_points}
            sources={areaData.sources}
          />
        )}

        {/* Show Strategic Positioning with report cards */}
        <OverviewPositioning
          charts={areaData?.charts}
          title={tabTitle}
          content=''
          onViewInsight={handleViewInsight}
        />

        {/* Show Strategic Recommendations */}
        <OverviewRecommendations
          recommendations={areaData?.recommendations}
        />

      </div>
    );
  };

  const handleViewInsight = (reportData: any) => {
    setSelectedReport(reportData);
    setIsReportDialogOpen(true);
  };

  const handleCloseReportDialog = () => {
    setIsReportDialogOpen(false);
    setSelectedReport(null);
  };

  const renderTabContent = () => {
    if (activeTab === 'overview') {
      const areas = getAreas();
      const overviewArea = areas?.Overview;

      return (
        <div className="tab-content">
          {streamResult ? (
            <div className="analysis-results">
              {/* Show OverviewSummary with executive summary and key insights */}
              <OverviewSummary
                executiveSummary={overviewArea?.summary}
                keyInsights={overviewArea?.key_points}
                sources={overviewArea?.sources}
              />

              {/* Show Strategic Positioning with report cards */}
              <OverviewPositioning
                charts={overviewArea?.charts}
                content={overviewArea?.content}
                onViewInsight={handleViewInsight}
              />

              {/* Show Strategic Recommendations */}
              <OverviewRecommendations
                recommendations={streamResult?.structured_response?.recommendations}
              />

              {/* Show SWOT Analysis */}
              <SWOTAnalysis
                swotData={streamResult?.structured_response?.swot_analysis}
              />

              {/* Show Next Steps */}
              <NextSteps
                steps={streamResult?.structured_response?.next_steps}
              />

              {/* Footer disclaimer */}
              <div className="content-footer">
                This feature is powered by AI. Outputs may contain inaccuracies. Please verify critical information before use.
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    // Handle dynamic area tabs
    const activeTabInfo = tabs.find(tab => tab.id === activeTab);
    const areaName = activeTabInfo?.label;
    const originalKey = activeTabInfo?.originalKey;

    const areas = getAreas();
    if (areaName && originalKey && areas?.[originalKey]) {
      const areaData = areas[originalKey];
      return (
        <div className="tab-content">
          {renderAreaContent(areaName, areaData)}

          {/* Footer disclaimer */}
          <div className="content-footer">
            This feature is powered by AI. Outputs may contain inaccuracies. Please verify critical information before use.
          </div>
        </div>
      );
    }

    // Fallback for tabs without data
    return (
      <div className="tab-content">
        <h3>{tabs.find(tab => tab.id === activeTab)?.label || 'Content'}</h3>
        <p>This section will be populated when analysis data is available.</p>

        {/* Footer disclaimer */}
        <div className="content-footer">
          This feature is powered by AI. Outputs may contain inaccuracies. Please verify critical information before use.
        </div>
      </div>
    );
  };

  return (
    <div className="content-panel">
      <div className="content-header">
        <div className="project-info">
          <h1 className="project-title">{project.name}</h1>
          {/* <p className="project-subtitle" title={project.description || undefined}>
            {project.description}
          </p> */}
          <p className="project-last-updated">
            Dashboard last synced {getLastSyncTime().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })} | {getLastSyncTime().toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="header-actions">
          {!isStreaming && (
            <>
              <button
                className="action-btn"
                onClick={handleSyncProject}
                disabled={isSyncing || !onSyncProject}
                title={
                  isSyncing
                    ? 'Syncing in progress...'
                    : isStreaming
                      ? (streamResult?.status === 'pending_approval' && streamResult?.executionPlan
                        ? 'Waiting for approval...'
                        : 'Query in progress...')
                      : 'Re-run initial query to refresh data'
                }
              >
                <RefreshIcon size={16} />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </button>
              <button
                className="action-btn"
                onClick={handleExport}
                disabled={isSyncing || !onSyncProject}
              >
                <ExportIcon size={16} />
                Export
              </button>
            </>
          )}
        </div>
      </div>

      {!isStreaming && streamResult?.structured_response && (
        <div className="content-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                // Smooth scroll to top of content body
                if (contentBodyRef.current) {
                  contentBodyRef.current.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }
              }}
            >
              <div className="tab-label">
                {tab.label}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="content-body" ref={contentBodyRef}>
        {
          (isStreaming && !isFollowUpQuery) || isSyncing ? (
            <div className="streaming-content">
              <div className="streaming-message">
                {isSyncing && (
                  <div className="sync-progress-container">
                    <div className="sync-progress-bar-wrapper">
                      <div className="sync-progress-bar">
                        <div
                          className="sync-progress-fill"
                          style={{ width: `${syncProgress}%` }}
                        />
                      </div>
                      <span className="sync-progress-percentage">{syncProgress}%</span>
                    </div>
                  </div>
                )}
                <div className="typing-text">
                  {typedText}
                </div>
              </div>
            </div>
          ) :
            ((streamResult?.structured_response || (isStreaming && isFollowUpQuery)) && (renderTabContent()))
        }
      </div>


      {/* <DisabledExportModal
        isOpen={isExportDialogOpen}
        onClose={handleExportDialogClose}
        projectName={project.name}
      /> */}

      {selectedReport && (
        <ReportDialogDetails
          isOpen={isReportDialogOpen}
          onClose={handleCloseReportDialog}
          title={selectedReport.title}
          subtitle={selectedReport.subtitle}
          graphData={selectedReport.graphData}
          sourceImages={selectedReport.sources || selectedReport.sourceImages || []}
        />
      )}

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        type={toastType}
      />
    </div>
  );
};

export default WorkspaceContent;