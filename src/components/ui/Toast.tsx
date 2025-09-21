import React, { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  icon?: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
  actionLabel?: string;
  onAction?: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  icon, 
  isVisible, 
  onClose, 
  duration = 4000,
  type = 'success',
  actionLabel,
  onAction
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="toast-icon-circle success">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M13.5 4.5L6 12L2.5 8.5" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="toast-icon-circle error">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M12 4L4 12M4 4L12 12" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="toast-icon-circle warning">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M8 1L1 14H15L8 1Z" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M8 6V9" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
              <circle cx="8" cy="12" r="1" fill="white"/>
            </svg>
          </div>
        );
      case 'info':
        return (
          <div className="toast-icon-circle info">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="2"/>
              <path d="M8 12V8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="8" cy="5" r="1" fill="white"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-visible' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {icon || getDefaultIcon()}
        </div>
        <div className="toast-message">
          {message}
        </div>
        {actionLabel && onAction ? (
          <button 
            className="toast-action"
            onClick={onAction}
            aria-label={actionLabel}
          >
            {actionLabel}
          </button>
        ) : (
          <button 
            className="toast-close"
            onClick={onClose}
            aria-label="Close toast"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path 
                d="M12 4L4 12M4 4L12 12" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;