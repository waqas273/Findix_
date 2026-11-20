import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  loading: propLoading,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  ...props
}) => {
  const isButtonLoading = Boolean(isLoading || propLoading);

  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

  const variants = {
    primary:
      'bg-cyan-600 text-white font-semibold hover:bg-cyan-700 active:bg-cyan-800 shadow-sm transition-all',
    secondary:
      'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200 hover:text-slate-900 transition-all',
    outline:
      'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 active:bg-slate-100 transition-all shadow-sm',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-all',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm transition-all',
    glow:
      'bg-cyan-50 text-cyan-700 border border-cyan-300 hover:bg-cyan-100 transition-all',
  };

  const sizes = {
    xs: 'px-2.5 py-1 text-[11px] gap-1 rounded-lg',
    sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5 font-semibold rounded-2xl',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      disabled={disabled || isButtonLoading}
      {...props}
    >
      {isButtonLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className="w-4 h-4 shrink-0" />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className="w-4 h-4 shrink-0" />
          )}
        </>
      )}
    </button>
  );
};
