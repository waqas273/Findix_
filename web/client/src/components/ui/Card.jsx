import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  interactive = false,
  glassLevel = 'normal', // 'light', 'normal', 'heavy'
  ...props
}) => {
  const glassStyles = {
    light: 'bg-white/80 backdrop-blur-md border border-slate-200/70 shadow-sm',
    normal: 'bg-white backdrop-blur-xl border border-slate-200/90 shadow-sm',
    heavy: 'bg-white backdrop-blur-2xl border border-slate-200 shadow-lg',
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-200 relative text-slate-800 ${
        glassStyles[glassLevel] || glassStyles.normal
      } ${
        hoverEffect
          ? 'hover:border-cyan-300 hover:shadow-md'
          : ''
      } ${
        interactive
          ? 'cursor-pointer hover:border-cyan-300 hover:shadow-md active:scale-[0.99]'
          : ''
      } ${glow ? 'border-cyan-300 shadow-md ring-1 ring-cyan-100' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
