import React, { useState, ReactNode, useRef, useEffect } from 'react';
import { DropdownItem } from '../../types/dropdown';
import './Dropdown.css';

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, items, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleTriggerClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    
    // Calculate position for fixed menu
    if (triggerRef.current && !isOpen) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 200 // Align to right edge with menu width
      });
    }
    
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleItemClick = (item: DropdownItem) => (event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    item.onClick();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`dropdown ${className || ''}`} ref={dropdownRef}>
      <div className="dropdown-trigger" ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </div>
      
      {isOpen && (
        <div 
          className="dropdown-menu"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`
          }}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              className={`dropdown-item ${item.variant === 'danger' ? 'danger' : ''} ${index !== items.length - 1 ? 'with-separator' : ''}`}
              onClick={handleItemClick(item)}
            >
              {item.icon && (
                <div className="dropdown-item-icon">
                  {item.icon}
                </div>
              )}
              <div className="dropdown-item-text">
                {item.label}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;