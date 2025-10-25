import React from 'react';
import { cn } from '../utils/cn';

const Checkbox = ({ className, label, description, error, ...props }) => {
  return (
    <label className={cn("flex items-start gap-3 cursor-pointer select-none", className)}>
      <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" {...props} />
      <span>
        {label && <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>}
        {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </span>
    </label>
  );
};

export default Checkbox;
