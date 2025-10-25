import React from 'react';
import { cn } from '../utils/cn';

const Select = React.forwardRef(({ className, label, description, error, children, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">{label}</label>}
      <div className="relative">
        <select ref={ref} {...props}
          className={cn(
            "block w-full appearance-none px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-10",
            error && "border-red-300 focus:ring-red-500", className)}>
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </div>
      {description && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
