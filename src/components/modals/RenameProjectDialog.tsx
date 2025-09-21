import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import TotalProjectsIcon from '../icons/TotalProjectsIcon';
import './RenameProjectDialog.css';

interface RenameProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
  projectName: string;
}

const RenameProjectDialog: React.FC<RenameProjectDialogProps> = ({
  isOpen,
  onClose,
  onRename,
  projectName
}) => {
  const [newName, setNewName] = useState(projectName || '');
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    if (projectName) {
      setNewName(projectName);
    }
  }, [projectName]);

  const handleRename = async () => {
    if (newName.trim() && newName.trim() !== projectName) {
      setIsRenaming(true);
      try {
        await onRename(newName.trim());
        onClose();
      } catch (error) {
        // Error handling is done in the parent component
      } finally {
        setIsRenaming(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Limit to 55 characters
    setNewName(value.substring(0, 55));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isRenaming && newName.trim() && newName.trim() !== projectName) {
      e.preventDefault();
      handleRename();
    }
  };

  const isRenameDisabled = !newName.trim() || newName.trim() === projectName || isRenaming;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=" "
      maxWidth="359px"
      closeOnOverlayClick={false}
      className="rename-dialog-modal"
    >
      <div className="rename-dialog-content">
        <div className="rename-dialog-icon">
          <TotalProjectsIcon />
        </div>

        <h2 className="rename-dialog-title">Rename Project</h2>

        <div className="rename-dialog-input-container">
          <textarea
            value={newName}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Enter project name"
            autoFocus
            className="rename-dialog-input"
            rows={2}
          />
        </div>

        <button
          onClick={handleRename}
          disabled={isRenameDisabled}
          className="rename-dialog-button"
        >
          {isRenaming ? 'Renaming...' : 'Rename'}
        </button>
      </div>
    </Modal>
  );
};

export default RenameProjectDialog;