import React from 'react';

export const Toggle = ({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  id,
}) => {
  const toggleId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`flex items-start justify-between gap-4 cursor-pointer select-none py-1 group ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      <div className="space-y-0.5 flex-grow">
        {label && (
          <label
            htmlFor={toggleId}
            className="block text-sm font-medium text-slate-200 group-hover:text-white transition-colors cursor-pointer"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        )}
      </div>

      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-neon-cyan focus:ring-offset-2 focus:ring-offset-obsidian-900 ${
          checked ? 'bg-cyan-gradient shadow-neon-sm' : 'bg-obsidian-800 border-slate-750'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
            checked ? 'translate-x-5 bg-obsidian-950' : 'translate-x-0 bg-slate-300'
          }`}
        />
      </button>
    </div>
  );
};
