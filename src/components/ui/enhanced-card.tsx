/**
 * Enhanced Card Component
 * Modern corporate SaaS styling with hover effects and variants
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'bordered' | 'glass';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-white border border-gray-200 shadow-sm hover:shadow-md',
  elevated: 'bg-white border border-gray-200 shadow-lg hover:shadow-xl',
  bordered: 'bg-white border-2 border-gray-200 hover:border-gray-300',
  glass: 'backdrop-blur-sm bg-white/80 border border-white/20 hover:bg-white/90',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false,
  padding = 'md',
  onClick,
}) => {
  return (
    <Card
      className={cn(
        'transition-all duration-200 ease-in-out',
        variantStyles[variant],
        hover && 'hover:-translate-y-0.5 cursor-pointer',
        paddingStyles[padding],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
};

// Enhanced Card Header with better typography
export const EnhancedCardHeader: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, description, action, className }) => (
  <CardHeader className={cn('pb-3', className)}>
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-sm text-gray-500">
            {description}
          </CardDescription>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  </CardHeader>
);

// Enhanced Card Content with better spacing
export const EnhancedCardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <CardContent className={cn('pt-0', className)}>
    {children}
  </CardContent>
);

// Enhanced Card Footer
export const EnhancedCardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <CardFooter className={cn('pt-4 border-t border-gray-100', className)}>
    {children}
  </CardFooter>
);