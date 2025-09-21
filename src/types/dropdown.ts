import { ReactNode } from 'react';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'danger';
}