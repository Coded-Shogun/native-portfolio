import React from 'react';

export interface BadgeProps {
  /**
   * Badge content
   */
  children: React.ReactNode;
  /**
   * Badge variant style
   */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /**
   * Badge size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional CSS class
   */
  className?: string;
  /**
   * Show as pill shape (fully rounded)
   */
  pill?: boolean;
  /**
   * Show with dot indicator
   */
  dot?: boolean;
}

/**
 * Badge component for displaying status, counts, or labels
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  pill = false,
  dot = false,
}) => {
  const baseClasses = 'inline-flex items-center font-medium';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const roundingClasses = pill ? 'rounded-full' : 'rounded';

  const dotClasses = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${roundingClasses} ${className}`}
    >
      {dot && (
        <span
          className={`w-2 h-2 rounded-full mr-1.5 ${dotClasses[variant]}`}
        ></span>
      )}
      {children}
    </span>
  );
};
