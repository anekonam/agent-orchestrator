import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../styles/dashboard.css';
import HomeIcon from '../components/icons/HomeIcon';
import AddIcon from '../components/icons/AddIcon';
import DashboardHomeView from '../components/views/dashboard/DashboardHomeView';
import NewDashboardView from '../components/views/dashboard/NewDashboardView';
import DashboardWorkspaceView from '../components/views/dashboard/DashboardWorkspaceView';
import SpinningLoader from '../components/ui/SpinningLoader';
import Toast from '../components/ui/Toast';
import { Project } from '../types/project';
import { projectsAPI, CreateProjectRequest } from '../services/azureProjectsApi';
import DashboardProjectsView from '../components/views/dashboard/DashboardProjectsView';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('error');
  const [lastCreatedProject, setLastCreatedProject] = useState<Project | null>(null);
  const [triggerDeleteProject, setTriggerDeleteProject] = useState<Project | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  // Load projects from API
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsList = await projectsAPI.listProjects({ status: 'active', limit: 100 });
      setProjects(projectsList);
    } catch (err) {
      console.error('Error loading projects:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      showToast('Something went wrong. Failed to fetch projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load projects when component mounts
  useEffect(() => {
    loadProjects();
  }, []);

  // Reload projects when navigating to dashboard home
  useEffect(() => {
    if (location.pathname === '/dashboard' || location.pathname === '/') {
      loadProjects();
    }
  }, [location.pathname]);

  // Effect to handle URL changes and load project data
  useEffect(() => {
    if (id) {
      const loadProject = async () => {
        setProjectLoading(true);
        setProjectError(null);
        setSelectedProject(undefined); // Clear previous project
        
        try {
          const project = await projectsAPI.getProject(id);
          setSelectedProject(project);
        } catch (err) {
          console.error('Error loading project:', err);
                    
          // Always redirect to dashboard home on project loading error
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000); // Small delay to let user see the toast
          
          setProjectError('Failed to load project');
        } finally {
          setProjectLoading(false);
        }
      };
      
      loadProject();
    } else {
      setSelectedProject(undefined);
      setProjectError(null);
      setProjectLoading(false);
    }
  }, [id, navigate]); // Removed projects dependency as we no longer use it as fallback

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleCreateClick = () => {
    navigate('/dashboard/create');
  };

  const handleViewProject = (project: Project) => {
    navigate(`/dashboard/project/${project.project_id}`);
  };

  const handleCreateProject = () => {
    navigate('/dashboard/create');
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      const createRequest: CreateProjectRequest = {
        name: projectData.name || 'New Project',
        description: projectData.description || '',
        initial_query: projectData.initial_query || '',
        metadata: projectData.metadata || {}
      };
      
      const newProject = await projectsAPI.createProject(createRequest);
      
      // Store the created project for undo functionality
      setLastCreatedProject(newProject);
      
      // Refresh projects list
      const updatedProjects = await projectsAPI.listProjects({ status: 'active', limit: 100 });
      setProjects(updatedProjects);
      
      // Show success toast
      showToast(`"${newProject.name}" has been successfully created`, 'success');
      
      // Navigate to home instead of the project to show the toast
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating project:', err);
      showToast('Something went wrong. Failed to create new project', 'error');
      // Go back to home on error
      handleBackToHome();
    }
  };

  const handleCreateProjectWithQuestion = async (question: string, attachedFiles: File[]) => {
    try {
      // Create project with initial question
      const createRequest: CreateProjectRequest = {
        name: `${question.substring(0, 50)}${question.length > 50 ? '...' : ''}`,
        description: question,
        initial_query: question,
        metadata: {
          attachedFiles: attachedFiles.map(f => ({ name: f.name, size: f.size, type: f.type }))
        }
      };
      
      const newProject = await projectsAPI.createProject(createRequest);
      
      // Store the created project for undo functionality
      setLastCreatedProject(newProject);
      
      // Refresh projects list
      const updatedProjects = await projectsAPI.listProjects({ status: 'active', limit: 100 });
      setProjects(updatedProjects);
      
      // Navigate to the new project with flag to auto-submit query only after successful creation
      navigate(`/dashboard/project/${newProject.project_id}`, {
        state: {
          initialQuestion: question,
          initialAttachments: attachedFiles,
          autoSubmitQuery: true // Flag to indicate automatic query submission
        }
      });
    } catch (err) {
      console.error('Error creating project with question:', err);
      showToast('Something went wrong. Failed to create new project', 'error');
      handleBackToHome();
      throw err; // Re-throw so the calling component can handle the error
    }
  };

  const handleRenameProject = async (project: Project, newName: string) => {
    try {
      await projectsAPI.updateProject(project.project_id, { name: newName });
      // Refresh projects list
      const updatedProjects = await projectsAPI.listProjects({ status: 'active', limit: 100 });
      setProjects(updatedProjects);
    } catch (err) {
      console.error('Error renaming project:', err);
      throw err; // Re-throw so the component can handle the error state
    }
  };

  const handleDeleteProject = async (project: Project) => {
    try {
      await projectsAPI.deleteProject(project.project_id);
      // Refresh projects list
      const updatedProjects = await projectsAPI.listProjects({ status: 'active', limit: 100 });
      setProjects(updatedProjects);

      // Clear the last created project if it was deleted
      if (lastCreatedProject && lastCreatedProject.project_id === project.project_id) {
        setLastCreatedProject(null);
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err; // Re-throw so the modal can handle the error state
    }
  };

  const handleUndoCreateProject = () => {
    if (lastCreatedProject) {
      setToastVisible(false);
      // Navigate to home first if not already there
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
      // Trigger the delete modal for the last created project
      setTriggerDeleteProject(lastCreatedProject);
    }
  };

  const renderCurrentView = () => {
    const path = location.pathname;
    
    if (loading) {
      return (
        <div className="dashboard-content">
          <div className="dashboard-loading">
            <SpinningLoader size="large" text="Loading dashboard..." />
          </div>
        </div>
      );
    }

    // Remove error state - let the home page load with empty projects

    if (path === '/dashboard/create') {
      return (
        <NewDashboardView
          isCreating={true}
          onBack={handleBackToHome}
          onSave={handleSaveProject}
          onCreateWithQuestion={handleCreateProjectWithQuestion}
        />
      );
    } else if (path.startsWith('/dashboard/project/')) {
      // Handle project loading states
      if (projectLoading) {
        return (
          <div className="dashboard-content">
            <div className="dashboard-loading">
              <SpinningLoader size="large" text="Loading project..." />
            </div>
          </div>
        );
      }
      
      if (!selectedProject) {
        // This case should rarely be hit since errors now redirect automatically
        return (
          <div className="dashboard-content">
            <div className="dashboard-loading">
              <SpinningLoader size="large" text="Redirecting..." />
            </div>
          </div>
        );
      }
      
      return (
        <DashboardWorkspaceView
          project={selectedProject}
        />
      );
    } else if (path ==='/dashboard/home'){
      return (
        <DashboardHomeView
          projects={projects}
          onCreateProject={handleCreateProject}
          onViewProject={handleViewProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          triggerDeleteProject={triggerDeleteProject}
          onDeleteProjectTriggered={() => setTriggerDeleteProject(null)}
        />
      );
    }else {
      return (
        <DashboardProjectsView
          projects={projects}
          onCreateProject={handleCreateProject}
          onViewProject={handleViewProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          triggerDeleteProject={triggerDeleteProject}
          onDeleteProjectTriggered={() => setTriggerDeleteProject(null)}
        />
      );
    }
  };

  return (
    <div className="fab-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
          <img src="/images/fab-icon.png" alt="FAB" className="logo-image" />
        </div>
        <nav className="nav-menu">
          <button 
            className={`nav-item ${location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}`}
            onClick={handleHomeClick}
            title="Home"
          >
            <HomeIcon className="nav-icon" size={24} />
          </button>
          <button 
            className={`nav-item ${location.pathname === '/dashboard/create' ? 'active' : ''}`}
            onClick={handleCreateClick}
            title="Add New Project"
          >
            <AddIcon className="nav-icon" size={24} />
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      {renderCurrentView()}

      {/* Toast for error messages */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={hideToast}
        duration={4000}
        actionLabel={toastType === 'success' && lastCreatedProject ? 'Undo' : undefined}
        onAction={toastType === 'success' && lastCreatedProject ? handleUndoCreateProject : undefined}
      />
    </div>
  );
};

export default Dashboard;