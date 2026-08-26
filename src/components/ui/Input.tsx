import React, { InputHTMLAttributes } from 'react';
import './ui.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="ui-input-wrapper">
        {label && <label className="ui-label">{label}</label>}
        <input 
          ref={ref} 
          className={`ui-input ${error ? 'ui-input-error' : ''} ${className}`} 
          {...props} 
        />
        {error && <span className="ui-error-text">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
