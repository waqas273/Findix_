import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      rightIcon: RightIcon,
      onRightIconClick,
      className = '',
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative group">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-cyan-600 transition-colors">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`w-full bg-white border text-slate-900 placeholder-slate-400 text-sm rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-600 ${
              Icon ? 'pl-10' : 'pl-4'
            } ${RightIcon ? 'pr-10' : 'pr-4'} py-2.5 ${
              error
                ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900'
                : 'border-slate-200 hover:border-slate-300'
            } ${className}`}
            {...props}
          />
          {RightIcon && (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              <RightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-500 pl-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
