import React from 'react';
import MoreIcon from '../icons/MoreIcon';
import ExportIcon from '../icons/ExportIcon';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import Dropdown from '../ui/Dropdown';
import Badge from '../ui/badges/Badge';
import { Project } from '../../types/project';
import { DropdownItem } from '../../types/dropdown';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onExport?: (project: Project) => void;
  onRename?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  onExport,
  onRename,
  onDelete
}) => {
  const dropdownItems: DropdownItem[] = [
    // Only show export if project has results
    ...(project.has_result ? [{
      id: 'export',
      label: 'Export',
      icon: <ExportIcon size={20} />,
      onClick: () => onExport?.(project)
    }] : []),
    {
      id: 'rename',
      label: 'Rename',
      icon: <EditIcon size={20} />,
      onClick: () => onRename?.(project)
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <TrashIcon size={20} />,
      onClick: () => onDelete?.(project),
      variant: 'danger'
    }
  ];

  const dropdownTrigger = (
    <button
      className="more-button"
      aria-label="More options"
    >
      <MoreIcon size={16} />
    </button>
  );

  return (
    <div className="project-card" onClick={onClick}>
      <div className="project-card-header">
        <div className="project-card-title-section">
          <h3
            className="project-card-title"
            title={project.description || project.name}
            aria-label={`Project: ${project.name}`}
          >
            {project.name}
          </h3>
          <div className="project-card-badge">
            <Badge value={project.metadata?.project_type || 'Strategy Project'} />
          </div>
        </div>
        <Dropdown
          trigger={dropdownTrigger}
          items={dropdownItems}
          className="project-card-menu"
        />
      </div>

      <div className="project-card-content">
        <small className="project-updated">Last Updated {new Date(project.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(project.updated_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small>
      </div>
    </div>
  );
};

export default ProjectCard;