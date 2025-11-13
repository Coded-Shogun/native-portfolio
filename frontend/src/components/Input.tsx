import React from 'react';

export interface InputProps {
  /**
   * Input label
   */
  label?: string;
  /**
   * Input type
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /**
   * Input placeholder
   */
  placeholder?: string;
  /**
   * Input value
   */
  value?: string;
  /**
   * Is the input disabled?
   */
  disabled?: boolean;
  /**
   * Is the input required?
   */
  required?: boolean;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Help text to display below input
   */
  helperText?: string;
  /**
   * Change handler
   */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Blur handler
   */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /**
   * Optional CSS class
   */
  className?: string;
  /**
   * Input name attribute
   */
  name?: string;
  /**
   * Input size
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Form input component with label and error handling
 */
export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  disabled = false,
  required = false,
  error,
  helperText,
  onChange,
  onBlur,
  className = '',
  name,
  size = 'md',
}) => {
  const baseClasses = 'w-full border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const borderClasses = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        onChange={onChange}
        onBlur={onBlur}
        className={`${baseClasses} ${sizeClasses[size]} ${borderClasses}`}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
};
