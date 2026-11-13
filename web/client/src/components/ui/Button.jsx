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
      'bg-cyan-gradient text-obsidian-950 font-semibold hover:shadow-neon-cyan hover:brightness-110 active:brightness-95',
    secondary:
      'bg-obsidian-800 text-slate-200 border border-slate-800 hover:border-slate-700 hover:bg-obsidian-750 hover:text-white',
    outline:
      'border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan active:bg-neon-cyan/20',
    ghost:
      'text-slate-400 hover:text-white hover:bg-slate-800/50 active:bg-slate-800/80',
    danger:
      'bg-neon-rose text-white hover:bg-rose-600 active:bg-rose-700 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)]',
    glow:
      'bg-obsidian-900 text-neon-cyan border border-neon-cyan/50 shadow-neon-sm hover:shadow-neon-cyan hover:bg-neon-cyan/10',
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
