import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyProjectState from '../../emptyState/EmptyProjectState';
import ProjectCard from '../../cards/ProjectCard';
import StatsCard from '../../cards/StatsCard';
import AlertCard, { Alert } from '../../cards/AlertCard';
import StrategicRecommendationCard, { StrategicRecommendation } from '../../cards/StrategicRecommendationCard';
import TotalProjectsIcon from '../../icons/TotalProjectsIcon';
import SearchIcon from '../../icons/SearchIcon';
import AddIcon from '../../icons/AddIcon';
import RefreshIcon from '../../icons/RefreshIcon';
import DeleteModal from '../../modals/DeleteModal';
// import DisabledExportModal from '../../modals/DisabledExportModal';
import RenameProjectDialog from '../../modals/RenameProjectDialog';
import Toast from '../../ui/Toast';
import { Project } from '../../../types/project';

interface DashboardHomeViewProps {
  projects: Project[];
  onCreateProject: () => void;
  onViewProject: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
  onRenameProject?: (project: Project, newName: string) => Promise<void>;
  triggerDeleteProject?: Project | null;
  onDeleteProjectTriggered?: () => void;
}

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  projects,
  onCreateProject,
  onViewProject,
  onDeleteProject,
  onRenameProject,
  triggerDeleteProject,
  onDeleteProjectTriggered
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [projectToExport, setProjectToExport] = useState<Project | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [toastAction, setToastAction] = useState<{ label: string; action: () => void } | undefined>(undefined);
  const [timeRange, setTimeRange] = useState('Past Month');
  const [sortBy, setSortBy] = useState('');
  const [filterBy, setFilterBy] = useState('');
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  }));
  const [lastCheckedTime, setLastCheckedTime] = useState('Just now');

  // Get dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    const userName = 'Kat'; // This could come from user context/props
    
    if (hour < 12) {
      return `Good Morning, ${userName}!`;
    } else if (hour < 17) {
      return `Good Afternoon, ${userName}!`;
    } else {
      return `Good Evening, ${userName}!`;
    }
  };

  // Mock data for Market Intelligence Alerts
  const marketAlerts: Alert[] = [
    {
      id: 1,
      title: 'Social Banking Trend Acceleration',
      description: 'Gen Z adoption of social payment features increased 89% QoQ across MENA region',
      badge: 'Trend',
      badgeType: 'trend',
      impact: 'HIGH IMPACT',
      timeAgo: '1 hour ago',
      icon: '/fab-illustrations/illustration_chart_270.svg',
      aiConfidence: 92
    },
    {
      id: 2,
      title: 'Regulatory Changes - UK Market',
      description: 'New FCA guidelines may impact digital-only banking entry requirements',
      badge: 'Risk',
      badgeType: 'risk',
      impact: 'MEDIUM IMPACT',
      timeAgo: '1 hour ago',
      icon: '/fab-illustrations/illustration_documents_270.svg',
      aiConfidence: 87
    },
    {
      id: 3,
      title: 'ESG Investment Surge',
      description: 'Sustainable finance products see 67% increase in customer preference',
      badge: 'Opportunity',
      badgeType: 'opportunity',
      impact: 'MEDIUM IMPACT',
      timeAgo: '2 hours ago',
      icon: '/fab-illustrations/illustration_carbon_impact_270.svg',
      aiConfidence: 78
    },
    {
      id: 4,
      title: 'Cryptocurrency Integration Demands',
      description: 'Survey shows 73% of UAE millennials expect crypto services from traditional banks',
      badge: 'Opportunity',
      badgeType: 'opportunity',
      impact: 'HIGH IMPACT',
      timeAgo: '3 hours ago',
      icon: '/fab-illustrations/illustration_money_growing_270.svg',
      aiConfidence: 95
    },
    {
      id: 5,
      title: 'AI-Powered Customer Service Adoption',
      description: 'Competitors launching advanced chatbot services with 24/7 multi-language support',
      badge: 'Anomaly',
      badgeType: 'anomaly',
      impact: 'MEDIUM IMPACT',
      timeAgo: '4 hours ago',
      icon: '/fab-illustrations/illustration_chat_to_us_270.svg',
      aiConfidence: 83
    },
    {
      id: 6,
      title: 'Open Banking API Standards Update',
      description: 'Central Bank announces new requirements for API security and data sharing protocols',
      badge: 'Trend',
      badgeType: 'trend',
      impact: 'HIGH IMPACT',
      timeAgo: '5 hours ago',
      icon: '/fab-illustrations/illustration_open_banking_270.svg',
      aiConfidence: 90
    }
  ];

  const handleAlertClick = (alert: Alert) => {
    console.log('Alert clicked:', alert);
    // Handle alert click - could open a modal, navigate to details, etc.
  };

  const handleRefreshStatus = () => {
    setLastSyncTime(new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: true 
    }));
    setLastCheckedTime('Just now');
    // In a real app, this would trigger a status check
    console.log('Refreshing system status...');
  };

  // Mock data for Strategic Recommendations
  const strategicRecommendations: StrategicRecommendation[] = [
    {
      id: 1,
      title: 'Integrate with Leading Financial Platforms',
      description: 'Establish integration partnerships with popular financial apps and trading platforms to increase user convenience, leading to higher transaction volumes.',
      impact: 'Increases user confidence and promotes wider acceptance, leading to higher transaction volumes and improved market positioning.',
      priority: 'HIGH',
      timeline: '2-3 MONTHS'
    },
    {
      id: 2,
      title: 'Enhance User Education and Resources',
      description: 'Develop comprehensive educational materials and workshops aimed at different user segments to foster understanding of the dirhem stablecoin.',
      impact: 'Develop comprehensive educational materials and workshops aimed at different user segments to foster better understanding.',
      priority: 'MEDIUM',
      timeline: '6-12 MONTHS'
    },
    {
      id: 3,
      title: 'Expand International Market Presence',
      description: 'Target key international markets with high remittance flows to the UAE, establishing strategic partnerships with local financial institutions.',
      impact: 'Capture significant market share in remittance corridors, potentially increasing transaction volume by 40% within 18 months.',
      priority: 'HIGH',
      timeline: '12-18 MONTHS'
    },
    {
      id: 4,
      title: 'Implement Advanced Security Features',
      description: 'Deploy cutting-edge security protocols including multi-signature wallets and biometric authentication to ensure maximum protection of user assets.',
      impact: 'Reduces security incidents by 95% and increases institutional investor confidence, leading to higher adoption rates.',
      priority: 'HIGH',
      timeline: '3-6 MONTHS'
    },
    {
      id: 5,
      title: 'Launch Mobile-First Banking Solution',
      description: 'Develop a comprehensive mobile banking application with seamless dirhem integration, targeting younger demographics and tech-savvy users.',
      impact: 'Capture 25% of the mobile banking market share within the first year, driving significant user growth.',
      priority: 'MEDIUM',
      timeline: '9-12 MONTHS'
    }
  ];


  // Determine which recommendations to display
  const recommendationsToDisplay = showAllRecommendations 
    ? strategicRecommendations 
    : strategicRecommendations.slice(0, 2);
  
  const remainingRecommendationsCount = strategicRecommendations.length - 2;

  // Handle triggered delete from parent component
  useEffect(() => {
    if (triggerDeleteProject && onDeleteProjectTriggered) {
      setProjectToDelete(triggerDeleteProject);
      setDeleteModalOpen(true);
      onDeleteProjectTriggered();
    }
  }, [triggerDeleteProject, onDeleteProjectTriggered]);

  // Reset showAllProjects when search, sort, or filter changes
  useEffect(() => {
    setShowAllProjects(false);
  }, [searchQuery, sortBy, filterBy]);

  const handleExportProject = (project: Project) => {
    setProjectToExport(project);
    setExportModalOpen(true);
  };

  const handleExportConfirm = async (options: any, error?: string) => {
    
    // Show appropriate toast based on export result
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
      // Show success toast for PowerPoint
      setToastMessage('PowerPoint presentation exported successfully');
      setToastType('success');
      setToastVisible(true);
    }
    
    setExportModalOpen(false);
    setProjectToExport(null);
  };

  const handleExportCancel = () => {
    setExportModalOpen(false);
    setProjectToExport(null);
  };

  const handleRenameProject = (project: Project) => {
    setProjectToRename(project);
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!projectToRename || !onRenameProject) return;

    try {
      await onRenameProject(projectToRename, newName);
      setToastMessage('Project has been renamed successfully!');
      setToastType('success');
      setToastAction(undefined);
      setToastVisible(true);
      setRenameDialogOpen(false);
      setProjectToRename(null);
    } catch (error) {
      setToastMessage('Renaming project was unsuccessful due to a technical issue.');
      setToastType('error');
      setToastAction({
        label: 'Retry',
        action: () => {
          setToastVisible(false);
          setRenameDialogOpen(true);
        }
      });
      setToastVisible(true);
    }
  };

  const handleRenameCancel = () => {
    setRenameDialogOpen(false);
    setProjectToRename(null);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete || !onDeleteProject) return;
    
    setIsDeleting(true);
    try {
      await onDeleteProject(projectToDelete);
      setDeleteModalOpen(false);
      const deletedProjectName = projectToDelete.name;
      setProjectToDelete(null);
      setToastMessage(`"${deletedProjectName}" has been successfully deleted`);
      setToastType('success');
      setToastVisible(true);
    } catch (error) {
      console.error('Failed to delete project:', error);
      setToastMessage('Failed to delete project. Please try again.');
      setToastType('error');
      setToastVisible(true);
      setDeleteModalOpen(false);
      // Keep projectToDelete so we can retry
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setProjectToDelete(null);
    setIsDeleting(false);
  };

  const handleRetryDelete = () => {
    if (projectToDelete) {
      setToastVisible(false);
      setDeleteModalOpen(true);
    }
  };


  // Apply search filter
  let filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply filter by type
  if (filterBy && filterBy !== 'All Projects') {
    filteredProjects = filteredProjects.filter((project) => {
      const projectType = project.metadata?.project_type || 'Strategy Project';
      if (filterBy === 'Market Intelligence') {
        return projectType.toLowerCase().includes('market') || projectType.toLowerCase().includes('intelligence');
      } else if (filterBy === 'Strategy') {
        return projectType.toLowerCase().includes('strategy');
      } else if (filterBy === 'Risk Analysis') {
        return projectType.toLowerCase().includes('risk');
      }
      return true;
    });
  }

  // Apply sorting (default to Last Updated if no sort selected)
  filteredProjects = [...filteredProjects].sort((a, b) => {
    const sortOption = sortBy || 'Last Updated'; // Default to Last Updated
    switch (sortOption) {
      case 'Last Updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'Name':
        return a.name.localeCompare(b.name);
      case 'Created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  // Determine which projects to display
  const projectsToDisplay = showAllProjects 
    ? filteredProjects 
    : filteredProjects.slice(0, 4);
  
  const remainingProjectsCount = filteredProjects.length - 4;

    return (
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-top">
            <div className="header-greeting">
              <h2 className="greeting-text">{getGreeting()}</h2>
              <p className="greeting-subtitle">Here what has been happening...</p>
            </div>
            <div className="header-actions">
              <button 
                className="refresh-btn" 
                onClick={handleRefreshStatus}
                title="Refresh"
              >
                <RefreshIcon size={20} />
              </button>
              <div className="time-range-container">
                <label className="time-range-label">Timeframe</label>
                <select 
                  className="time-range-selector" 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="Past Month">Past Month</option>
                  <option value="Past Week">Past Week</option>
                  <option value="Past Year">Past Year</option>
                </select>
              </div>
              { projects.length > 0 && (
                <button className="create-btn" onClick={onCreateProject}>
                  <AddIcon size={20} /> Create New Project
                </button>
              )}
            </div>
          </div>
  
          <div className="stats-cards-row">
            <StatsCard 
              title="Total Projects" 
              value={projects.length}
              icon={<TotalProjectsIcon />}
              backgroundColor="#E4ECF9"
              onClick={() => navigate('/dashboard')}
            />
            <StatsCard 
              title="Critical Alerts" 
              value={2}
              icon={<img src="/fab-illustrations/illustration_warning_270.svg" alt="Alerts" width={70} height={70} />}
              backgroundColor="#F7F0F2"
            />
            <StatsCard 
              title="New Insights" 
              value={2}
              icon={<img src="/fab-illustrations/illustration_notification_270.svg" alt="Insights" width={70} height={70} />}
              backgroundColor="#E8F3F5"
            />
            <StatsCard 
              title="Recommendations" 
              value={13}
              icon={<img src="/fab-illustrations/illustration_done_270.svg" alt="Recommendations" width={70} height={70} />}
              backgroundColor="#F7F0E9"
            />
          </div>
        </header>

        <div className="dashboard-main-content">
          <div className="dashboard-column dashboard-column-left">
            <section className="market-intelligence-section">
              <div className="section-header">
                <h2 className="section-title">Market Intelligence Alerts</h2>
                <p className="section-subtitle">Critical market movements and opportunities</p>
              </div>
              
              <div className="alerts-list">
                {(showAllAlerts ? marketAlerts : marketAlerts.slice(0, 3)).map((alert) => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onClick={handleAlertClick}
                  />
                ))}
              </div>
              
              {marketAlerts.length > 3 && !showAllAlerts && (
                <button 
                  className="show-more-link"
                  onClick={() => setShowAllAlerts(true)}
                >
                  Show More Alerts ({marketAlerts.length - 3})
                </button>
              )}
              {showAllAlerts && marketAlerts.length > 3 && (
                <button 
                  className="show-more-link"
                  onClick={() => setShowAllAlerts(false)}
                >
                  Show Less
                </button>
              )}
            </section>

            <div className="section-divider"></div>
      
            <section className="projects-section">
              <div className="projects-header">
                <h2 className="section-title">
                  All Projects • {projects.length}
                </h2>
                <div className="projects-controls">
                  <div className="dropdown-wrapper">
                    <select 
                      className="project-dropdown"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="" disabled hidden>Sort By</option>
                      <option value="Last Updated">Last Updated</option>
                      <option value="Name">Name</option>
                      <option value="Created">Created</option>
                    </select>
                    {sortBy && (
                      <button 
                        className="clear-dropdown-btn"
                        onClick={() => setSortBy('')}
                        aria-label="Clear sort"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div className="dropdown-wrapper">
                    <select 
                      className="project-dropdown"
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                    >
                      <option className="placeholder" value="" disabled hidden>Filter By</option>
                      <option value="All Projects">All Projects</option>
                      <option value="Market Intelligence">Market Intelligence</option>
                      <option value="Strategy">Strategy</option>
                      <option value="Risk Analysis">Risk Analysis</option>
                    </select>
                    {filterBy && (
                      <button 
                        className="clear-dropdown-btn"
                        onClick={() => setFilterBy('')}
                        aria-label="Clear filter"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {projects.length > 0 && (
                <div className="search-container">
                  <SearchIcon className="search-icon" size={16} />
                  <input
                    className="search-input"
                    type="text"
                    placeholder="What's on your mind?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
      
              {filteredProjects.length === 0 && projects.length === 0 ? (
                <EmptyProjectState onCreateProject={onCreateProject} />
              ) : filteredProjects.length === 0 ? (
                <div className="no-results">No projects found matching your search.</div>
              ) : (
                <>
                  <div className="projects-stack">
                    {projectsToDisplay.map((project) => (
                      <ProjectCard
                        key={project.project_id}
                        project={project}
                        onClick={() => onViewProject(project)}
                        onExport={handleExportProject}
                        onRename={handleRenameProject}
                        onDelete={handleDeleteProject}
                      />
                    ))}
                  </div>
                  {remainingProjectsCount > 0 && !showAllProjects && (
                    <button 
                      className="show-more-link"
                      onClick={() => setShowAllProjects(true)}
                    >
                      Show More Projects ({remainingProjectsCount})
                    </button>
                  )}
                  {showAllProjects && filteredProjects.length > 4 && (
                    <button 
                      className="show-more-link"
                      onClick={() => setShowAllProjects(false)}
                    >
                      Show Less
                    </button>
                  )}
                </>
              )}
            </section>
          </div>
          <div className="dashboard-column dashboard-column-right">
            <section className="strategic-recommendations-section">
              <div className="section-header">
                <h2 className="section-title">Strategic Recommendations</h2>
                <p className="section-subtitle">AI-powered recommendations for strategic impact</p>
              </div>
              
              <div className="recommendations-stack">
                {recommendationsToDisplay.map((recommendation) => (
                  <StrategicRecommendationCard
                    key={recommendation.id}
                    recommendation={recommendation}
                  />
                ))}
              </div>

              {remainingRecommendationsCount > 0 && !showAllRecommendations && (
                <button 
                  className="show-more-link"
                  onClick={() => setShowAllRecommendations(true)}
                >
                  Show All Recommendations ({remainingRecommendationsCount})
                </button>
              )}
              {showAllRecommendations && strategicRecommendations.length > 2 && (
                <button 
                  className="show-more-link"
                  onClick={() => setShowAllRecommendations(false)}
                >
                  Show Less
                </button>
              )}
            </section>

            <div className="section-divider"></div>

            <section className="system-status-section">
              <div className="section-header">
                <h2 className="section-title">System Status</h2>
                <p className="section-subtitle">All systems operational</p>
              </div>
              
              <div className="status-container">
                <div className="status-list">
                  <div className="status-item">
                    <div className="status-item-header">
                      <span className="status-name">Market Intelligence</span>
                      <div className="status-indicator-small status-operational"></div>
                    </div>
                  </div>

                  <div className="status-item">
                    <div className="status-item-header">
                      <span className="status-name">Strategy Agent</span>
                      <div className="status-indicator-small status-operational"></div>
                    </div>
                  </div>

                  <div className="status-item">
                    <div className="status-item-header">
                      <span className="status-name">Data Sync</span>
                      <div className="status-indicator-small status-operational"></div>
                    </div>
                  </div>
                  
                  <div className="status-item">
                    <div className="status-item-header">
                      <span className="status-name">Last updated: {lastSyncTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          project={projectToDelete}
          isDeleting={isDeleting}
        />

        <RenameProjectDialog
          isOpen={renameDialogOpen}
          onClose={handleRenameCancel}
          onRename={handleRenameConfirm}
          projectName={projectToRename?.name || ''}
        />

        {/* <DisabledExportModal
          isOpen={exportModalOpen}
          onClose={handleExportCancel}
          projectName={projectToExport?.name}
        /> */}

        <Toast
          message={toastMessage}
          isVisible={toastVisible}
          onClose={() => setToastVisible(false)}
          type={toastType}
          actionLabel={toastAction?.label}
          onAction={toastAction?.action}
        />
      </main>
    );
  };
  
  export default DashboardHomeView;