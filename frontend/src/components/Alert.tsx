import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface AlertProps {
  /**
   * Alert variant/type
   */
  variant?: 'info' | 'success' | 'warning' | 'error';
  /**
   * Alert title
   */
  title?: string;
  /**
   * Alert message content
   */
  children: React.ReactNode;
  /**
   * Show close button
   */
  dismissible?: boolean;
  /**
   * Close handler
   */
  onClose?: () => void;
  /**
   * Optional CSS class
   */
  className?: string;
}

/**
 * Alert component for displaying important messages and notifications
 */
export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onClose,
  className = '',
}) => {
  const variantConfig = {
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
      Icon: Info,
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
      Icon: CheckCircle,
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
      Icon: AlertCircle,
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
      Icon: XCircle,
    },
  };

  const config = variantConfig[variant];
  const IconComponent = config.Icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start">
        <IconComponent className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${config.textColor} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${config.textColor}`}>
            {children}
          </div>
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={onClose}
            className={`ml-3 inline-flex ${config.iconColor} hover:opacity-75 flex-shrink-0`}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
