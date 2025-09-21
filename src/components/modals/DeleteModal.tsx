import React, { useState } from 'react';
import Modal from '../ui/Modal';
import TrashIcon from '../icons/TrashIcon';
import { Project } from '../../types/project';
import './DeleteModal.css';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  project: Project | null;
  isDeleting?: boolean;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  project,
  isDeleting = false
}) => {
  if (!project) return null;

  const handleDeleteConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    onClose();
  };

  // Show only the confirmation dialog
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="500px"
      showCloseButton={false}
    >
      <div className="delete-modal-content second-step">
        <div className="delete-modal-icon">
          <img 
            src="/fab-illustrations/illustration_error_270.svg" 
            alt="Error illustration" 
            className="delete-modal-image"
          />
        </div>
        
        <h2 className="delete-modal-title">Delete project?</h2>
        
        <p className="delete-modal-description">
          Deleting "{project.name}" will permanently erase any data that hasn't been saved or exported.
        </p>
        
        <div className="delete-modal-actions second-step-actions">
          <button 
            className="delete-modal-go-back"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Keep Project
          </button>
          <button 
            className="delete-modal-delete"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;