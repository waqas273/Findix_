import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, message, type = 'success', duration = 3500 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const newToast = { id, title, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const addToast = useCallback(
    (type, message, title) => {
      if (typeof type === 'object' && type !== null) {
        showToast(type);
        return;
      }
      showToast({
        type: type || 'info',
        message: message || '',
        title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : ''),
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, addToast, removeToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl p-4 shadow-2xl backdrop-blur-2xl border transition-all duration-300 animate-scale-up flex items-start gap-3 ${
                isSuccess
                  ? 'bg-obsidian-950/95 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-white'
                  : isError
                  ? 'bg-obsidian-950/95 border-neon-rose/40 shadow-[0_0_20px_rgba(244,63,94,0.2)] text-white'
                  : 'bg-obsidian-950/95 border-neon-cyan/40 shadow-[0_0_20px_rgba(0,242,254,0.15)] text-white'
              }`}
            >
              {isSuccess && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {isError && (
                <AlertCircle className="w-5 h-5 text-neon-rose shrink-0 mt-0.5" />
              )}
              {!isSuccess && !isError && (
                <Info className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
              )}

              <div className="space-y-0.5 flex-1 pr-1">
                {toast.title && (
                  <h4 className="text-xs sm:text-sm font-bold tracking-wide">
                    {toast.title}
                  </h4>
                )}
                {toast.message && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
