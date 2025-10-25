import React from 'react';
import './Select.css';
import { FaChevronDown } from 'react-icons/fa';

const Select = ({
  label,
  id,
  value,
  onChange,
  options = [],
  placeholder = "Выберите опцию",
  disabled = false,
  error = false,
  success = false,
  helperText,
  errorText,
  size = 'md',
  fullWidth = false,
  className = '',
  required = false,
  ...props
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = error || errorText;
  const hasSuccess = success && !hasError;
  
  const selectClasses = [
    'select',
    `select--${size}`,
    hasError && 'select--error',
    hasSuccess && 'select--success',
    disabled && 'select--disabled',
    fullWidth && 'select--full-width',
    className
  ].filter(Boolean).join(' ');
  
  const wrapperClasses = [
    'select-wrapper',
    fullWidth && 'select-wrapper--full-width'
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-label__required">*</span>}
        </label>
      )}
      
      <div className="select-container">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={selectClasses}
          required={required}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            (helperText || errorText) ? `${selectId}-help` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option, index) => (
            <option key={option.value || index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <span className="select-icon" aria-hidden="true">
          <FaChevronDown />
        </span>
      </div>
      
      {(helperText || errorText) && (
        <div 
          id={`${selectId}-help`} 
          className={`select-help ${hasError ? 'select-help--error' : ''}`}
        >
          {errorText || helperText}
        </div>
      )}
    </div>
  );
};

export default Select;