import React from 'react';
import { cn } from '../utils/cn';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md focus:ring-indigo-500',
    secondary: 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-500',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 focus:ring-slate-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  };
  const sizes = { sm:'px-3 py-1.5 text-sm rounded-lg', md:'px-4 py-2 text-sm rounded-lg', lg:'px-6 py-3 text-base rounded-xl', xl:'px-8 py-4 text-lg rounded-xl' };

  return (
    <button ref={ref} {...props} className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}>
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
