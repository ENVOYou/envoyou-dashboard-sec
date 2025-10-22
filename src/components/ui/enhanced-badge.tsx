/**
 * Enhanced Badge Component
 * Modern corporate SaaS styling with status variants
 */

import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface EnhancedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

const variantStyles = {
  default: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  secondary: 'bg-gray-100 text-gray-800 border-gray-200',
  outline: 'border border-gray-300 text-gray-700 bg-white',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const EnhancedBadge: React.FC<EnhancedBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}) => {
  return (
    <Badge
      className={cn(
        'inline-flex items-center font-medium border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      )}
      {children}
    </Badge>
  );
};

// Status Badge for Reports
export const ReportStatusBadge: React.FC<{
  status: string;
  className?: string;
}> = ({ status, className }) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'secondary';
      case 'in_review':
        return 'warning';
      case 'approved':
        return 'success';
      case 'locked':
        return 'info';
      case 'archived':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <EnhancedBadge variant={getStatusVariant(status)} className={className}>
      {status.replace('_', ' ').toUpperCase()}
    </EnhancedBadge>
  );
};

// Priority Badge
export const PriorityBadge: React.FC<{
  priority: string;
  className?: string;
}> = ({ priority, className }) => {
  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <EnhancedBadge variant={getPriorityVariant(priority)} className={className}>
      {priority.toUpperCase()}
    </EnhancedBadge>
  );
};

// Lock Status Badge
export const LockStatusBadge: React.FC<{
  isLocked: boolean;
  lockedBy?: string;
  className?: string;
}> = ({ isLocked, lockedBy, className }) => {
  if (!isLocked) return null;

  return (
    <EnhancedBadge variant="info" className={className}>
      <span className="mr-1">🔒</span>
      Locked {lockedBy && `by ${lockedBy}`}
    </EnhancedBadge>
  );
};