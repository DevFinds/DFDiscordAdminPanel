import React from 'react';
import { cn } from '../utils/cn';

const Input = React.forwardRef(({ className, label, description, error, leftIcon, rightIcon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{label}</label>}
      <div className="relative">
        {leftIcon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">{leftIcon}</div>}
        <input ref={ref} {...props}
          className={cn(
            "block w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all",
            leftIcon && "pl-10", rightIcon && "pr-10", error && "border-red-300 focus:ring-red-500", className)} />
        {rightIcon && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">{rightIcon}</div>}
      </div>
      {description && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
