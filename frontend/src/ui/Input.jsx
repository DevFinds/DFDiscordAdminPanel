import React from 'react';
import './Input.css';

const Input = ({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  error = false,
  success = false,
  helperText,
  errorText,
  size = 'md',
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = error || errorText;
  const hasSuccess = success && !hasError;
  
  const inputClasses = [
    'input',
    `input--${size}`,
    hasError && 'input--error',
    hasSuccess && 'input--success',
    disabled && 'input--disabled',
    leftIcon && 'input--has-left-icon',
    rightIcon && 'input--has-right-icon',
    fullWidth && 'input--full-width',
    className
  ].filter(Boolean).join(' ');
  
  const wrapperClasses = [
    'input-wrapper',
    fullWidth && 'input-wrapper--full-width'
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-label__required">*</span>}
        </label>
      )}
      
      <div className="input-container">
        {leftIcon && (
          <span className="input-icon input-icon--left" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            (helperText || errorText) ? `${inputId}-help` : undefined
          }
          {...props}
        />
        
        {rightIcon && (
          <span className="input-icon input-icon--right" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </div>
      
      {(helperText || errorText) && (
        <div 
          id={`${inputId}-help`} 
          className={`input-help ${hasError ? 'input-help--error' : ''}`}
        >
          {errorText || helperText}
        </div>
      )}
    </div>
  );
};

export default Input;