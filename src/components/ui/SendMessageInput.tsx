import React, { useState, useRef, useEffect } from 'react';
import AttachmentIcon from '../icons/AttachmentIcon';
import RightArrowIcon from '../icons/RightArrowIcon';
import TrashIcon from '../icons/TrashIcon';
import FileIcon from '../icons/FileIcon';
import FileUploadIcon from '../icons/FileUploadIcon';
import JsonIcon from '../icons/JsonIcon';
import CsvIcon from '../icons/CsvIcon';
import ExcelIcon from '../icons/ExcelIcon';
import PdfIcon from '../icons/PdfIcon';
import PptIcon from '../icons/PptIcon';
import './SendMessageInput.css';

interface SendMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  attachedFiles: File[];
  onFileSelect: () => void;
  onFileRemove: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  isDragOver: boolean;
  variant?: 'default' | 'chat';
  disabled?: boolean;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch(extension) {
    case 'json':
      return JsonIcon;
    case 'csv':
      return CsvIcon;
    case 'xls':
    case 'xlsx':
      return ExcelIcon;
    case 'pdf':
      return PdfIcon;
    case 'ppt':
    case 'pptx':
      return PptIcon;
    default:
      return FileIcon;
  }
};

const SendMessageInput: React.FC<SendMessageInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask Anything...",
  attachedFiles,
  onFileSelect,
  onFileRemove,
  onDragOver,
  onDragLeave,
  onDrop,
  onPaste,
  isDragOver,
  variant = 'default',
  disabled = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea as content changes
  useEffect(() => {
    const textarea = variant === 'chat' ? chatTextareaRef.current : textareaRef.current;
    if (textarea) {
      // Reset height to recalculate
      textarea.style.height = 'auto';
      // Set height based on scrollHeight
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max height 120px
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, variant]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = () => {
    // Prevent submission when disabled
    if (disabled) return;
    // Prevent multiple rapid submissions
    if (isSubmitting || !value.trim()) return;

    setIsSubmitting(true);
    onSubmit();

    // Re-enable after 1 second to prevent accidental double-clicks
    submitTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send message on Enter, but allow new line with Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default new line
      // Only submit if not disabled
      if (!disabled) {
        handleSubmit();
      }
    }
  };

  const containerClass = variant === 'chat' 
    ? `message-input-container chat-input-container ${isDragOver ? 'drag-over' : ''}` 
    : `message-input-container question-input-container ${isDragOver ? 'drag-over' : ''}`;

  const inputClass = variant === 'chat' ? 'message-input-base chat-input' : 'message-input-base question-input';
  const buttonClass = variant === 'chat' ? 'primary-btn-base send-btn' : 'primary-btn-base submit-btn';
  const rowClass = 'input-row';

  if (variant === 'default') {
    return (
      <div 
        className={containerClass}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onPaste={onPaste}
        tabIndex={0}
      >
        {isDragOver && (
          <div className="drag-overlay">
            <FileUploadIcon size={72} />
            <p className="drag-overlay-text">Drop your file here</p>
            <p className="drag-overlay-text-allowed">Allowed formats: PDF, PPT, PPTX, DOC, DOCX, CSV, XLS, XLSX, JSON.</p>
          </div>
        )}
        <div className={rowClass}>
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              className={inputClass}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={false} // Always allow typing
              rows={1}
              style={{ 
                minHeight: '40px',
                maxHeight: '120px',
                resize: 'none',
                overflow: 'auto'
              }}
            />
            <button 
              className="attach-btn" 
              onClick={onFileSelect} 
              aria-label="Attach file"
              disabled={disabled}
            >
              <AttachmentIcon size={20} />
            </button>
          </div>
          <button 
            className={buttonClass}
            onClick={handleSubmit}
            disabled={disabled || !value.trim() || isSubmitting}
            aria-label="Submit question"
          >
            <RightArrowIcon size={24} />
          </button>
        </div>
        <small className="ai-disclaimer">This feature is powered by AI. Outputs may contain inaccuracies. Please verify critical information before use.</small>

        {attachedFiles.length > 0 && (
          <div className="attached-files">
            <div className="files-grid">
              {attachedFiles.map((file, index) => {
                const IconComponent = getFileIcon(file.name);
                return (
                  <div key={index} className="file-card">
                    <div className="file-card-content">
                      <IconComponent className="file-icon" size={20} />
                      <span className="file-name" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  <button 
                    className="remove-file-btn"
                    onClick={() => onFileRemove(index)}
                    aria-label="Remove file"
                  >
                    <TrashIcon size={16} />
                  </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Chat variant
  return (
    <div 
      className={containerClass}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onPaste={onPaste}
      tabIndex={0}
    >
      {isDragOver && (
        <div className="drag-overlay">
          <FileUploadIcon size={72} />
          <p className="drag-overlay-text">Drop your file here</p>
          <p className="drag-overlay-subtext">or</p>
          <button className="drag-overlay-button">Browse Files</button>
        </div>
      )}
      <div className={rowClass}>
        <div className="input-wrapper">
          <textarea
            ref={chatTextareaRef}
            className={inputClass}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={false} // Always allow typing
            rows={1}
            style={{ 
              minHeight: '40px',
              maxHeight: '120px',
              resize: 'none',
              overflow: 'auto'
            }}
          />
          <button 
            className="attach-btn" 
            onClick={onFileSelect} 
            aria-label="Attach file"
            disabled={disabled}
          >
            <AttachmentIcon size={20} />
          </button>
        </div>
        
        <button 
          className={buttonClass}
          onClick={handleSubmit}
          disabled={disabled || !value.trim() || isSubmitting}
          aria-label="Send message"
        >
          <RightArrowIcon size={24} />
        </button>
      </div>
      {/* <small className="ai-disclaimer">This feature is powered by AI. Outputs may contain inaccuracies. Please verify critical information before use.</small> */}

      {attachedFiles.length > 0 && (
        <div className="attached-files">
          <div className="files-list">
            {attachedFiles.map((file, index) => {
              const IconComponent = getFileIcon(file.name);
              return (
                <div key={index} className="file-card">
                  <div className="file-card-content">
                    <IconComponent className="file-icon" size={16} />
                    <span className="file-name" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                <button 
                  className="remove-file-btn"
                  onClick={() => onFileRemove(index)}
                  aria-label="Remove file"
                >
                  <TrashIcon size={12} />
                </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMessageInput;