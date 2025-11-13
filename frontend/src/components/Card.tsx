import React from 'react';

export interface CardProps {
  /**
   * Card title
   */
  title?: string;
  /**
   * Card subtitle or description
   */
  subtitle?: string;
  /**
   * Card content
   */
  children: React.ReactNode;
  /**
   * Card footer content
   */
  footer?: React.ReactNode;
  /**
   * Card variant
   */
  variant?: 'default' | 'bordered' | 'elevated';
  /**
   * Card padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /**
   * Optional CSS class
   */
  className?: string;
  /**
   * Click handler for clickable cards
   */
  onClick?: () => void;
  /**
   * Is the card hoverable?
   */
  hoverable?: boolean;
}

/**
 * Card component for displaying content in a contained format
 */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  footer,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all';

  const variantClasses = {
    default: 'border border-gray-200',
    bordered: 'border-2 border-gray-300',
    elevated: 'shadow-lg',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hoverable || onClick
    ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer'
    : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      <div className="text-gray-700">
        {children}
      </div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};
