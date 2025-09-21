import React, { useState, useEffect } from 'react';
import EmptyProjectState from '../../emptyState/EmptyProjectState';
import ProjectCard from '../../cards/ProjectCard';
import StatsCard from '../../cards/StatsCard';
import TotalProjectsIcon from '../../icons/TotalProjectsIcon';
import SearchIcon from '../../icons/SearchIcon';
import AddIcon from '../../icons/AddIcon';
import DeleteModal from '../../modals/DeleteModal';
import ExportModal from '../../modals/ExportModal';
import RenameProjectDialog from '../../modals/RenameProjectDialog';
import Toast from '../../ui/Toast';
import { Project } from '../../../types/project';

interface DashboardProjectsViewProps {
  projects: Project[];
  onCreateProject: () => void;
  onViewProject: (project: Project) => void;
  onRenameProject?: (project: Project, newName: string) => Promise<void>;
  onDeleteProject?: (project: Project) => void;
  triggerDeleteProject?: Project | null;
  onDeleteProjectTriggered?: () => void;
}

const DashboardProjectsView: React.FC<DashboardProjectsViewProps> = ({
  projects,
  onCreateProject,
  onViewProject,
  onRenameProject,
  onDeleteProject,
  triggerDeleteProject,
  onDeleteProjectTriggered
}) => {
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

  // Handle triggered delete from parent component
  useEffect(() => {
    if (triggerDeleteProject && onDeleteProjectTriggered) {
      setProjectToDelete(triggerDeleteProject);
      setDeleteModalOpen(true);
      onDeleteProjectTriggered();
    }
  }, [triggerDeleteProject, onDeleteProjectTriggered]);

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


  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

    return (
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-top">
            <h1 className="main-title">FAB Observer</h1>
            { projects.length > 0 && (<button className="create-btn" onClick={onCreateProject}>
              <AddIcon size={20} /> Create New Project
            </button>)}
          </div>
          <p className="subheading">
            Empowering leadership with AI-driven market intelligence and strategic opportunities
          </p>
  
          <StatsCard 
            title="Total Projects" 
            value={projects.length}
            icon={<TotalProjectsIcon />}
          />
        </header>
  
        <section className="projects-section">
          <h2 className="section-title">All Projects</h2>
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
            <div className="projects-grid-container">
              <div className="projects-grid-fade"></div>
              <div className="projects-grid">
                {filteredProjects.map((project) => (
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
            </div>
          )}
        </section>

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

        <ExportModal
          isOpen={exportModalOpen}
          onClose={handleExportCancel}
          onExport={handleExportConfirm}
          queryData={projectToExport}
          projectName={projectToExport?.name}
        />

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
  
  export default DashboardProjectsView;