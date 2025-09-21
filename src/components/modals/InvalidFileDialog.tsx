import React from 'react';
import Modal from '../ui/Modal';
import './InvalidFileDialog.css';

interface InvalidFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvalidFileDialog: React.FC<InvalidFileDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="invalid-file-dialog-modal"
      showCloseButton={false}
      closeOnOverlayClick={true}
    >
      <div className="invalid-file-dialog">
        <div className="invalid-file-icon-container">
          <img 
            src="/fab-illustrations/illustration_access_blocked_270.svg" 
            alt="Access Blocked" 
            className="invalid-file-icon"
          />
        </div>
        
        <h2 className="invalid-file-title">File format not supported</h2>
        
        <p className="invalid-file-subtitle">
          This file type isn't supported. Supported formats are: PDF, PPT, PPTX, DOC, DOCX, CSV, XLS, XLSX, JSON.
        </p>
        
        <button 
          className="invalid-file-button"
          onClick={onClose}
        >
          Try again
        </button>
      </div>
    </Modal>
  );
};

export default InvalidFileDialog;