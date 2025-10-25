import React from 'react';
import './Checkbox.css';
import { FaCheck } from 'react-icons/fa';

const Checkbox = ({
  label,
  id,
  checked = false,
  onChange,
  disabled = false,
  indeterminate = false,
  error = false,
  helperText,
  errorText,
  size = 'md',
  className = '',
  required = false,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = error || errorText;
  
  const checkboxClasses = [
    'checkbox',
    `checkbox--${size}`,
    hasError && 'checkbox--error',
    disabled && 'checkbox--disabled',
    indeterminate && 'checkbox--indeterminate',
    className
  ].filter(Boolean).join(' ');
  
  const wrapperClasses = [
    'checkbox-wrapper',
    disabled && 'checkbox-wrapper--disabled'
  ].filter(Boolean).join(' ');

  const handleChange = (e) => {
    if (disabled) return;
    onChange?.(e);
  };

  return (
    <div className="checkbox-field">
      <label className={wrapperClasses}>
        <div className="checkbox-container">
          <input
            id={checkboxId}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="checkbox-input sr-only"
            required={required}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              (helperText || errorText) ? `${checkboxId}-help` : undefined
            }
            {...props}
          />
          
          <div className={checkboxClasses}>
            <div className="checkbox-indicator">
              {indeterminate ? (
                <div className="checkbox-indeterminate-line" />
              ) : (
                <FaCheck className="checkbox-check" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
        
        {label && (
          <span className="checkbox-label">
            {label}
            {required && <span className="checkbox-label__required">*</span>}
          </span>
        )}
      </label>
      
      {(helperText || errorText) && (
        <div 
          id={`${checkboxId}-help`} 
          className={`checkbox-help ${hasError ? 'checkbox-help--error' : ''}`}
        >
          {errorText || helperText}
        </div>
      )}
    </div>
  );
};

export default Checkbox;