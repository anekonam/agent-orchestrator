
import React from 'react';
import AddIcon from '../icons/AddIcon';
import './EmptyProjectState.css';

interface EmptyProjectStateProps {
  onCreateProject: () => void;
}

const EmptyProjectState: React.FC<EmptyProjectStateProps> = ({ onCreateProject }) => {
  return (
    <div className="empty-state">
      <img 
        src="/fab-illustrations/illustration_added_270.svg" 
        alt="Empty state illustration" 
        className="illustration"
      />
      <div className="empty-content">
        <h3>Your strategy journey starts here!</h3>
        <p>Create your first project to explore insights and guide impactful decisions.</p>
      </div>
      <div className="empty-actions">
        <button className="create-btn" onClick={onCreateProject}>
          <AddIcon size={20} /> Create New Project
        </button>
      </div>
    </div>
  );
};

export default EmptyProjectState;
