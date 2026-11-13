import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  LogOut, 
  ShieldCheck, 
  HelpCircle, 
  UserCheck, 
  UserX,
  Sparkles,
  X,
  Check,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const ConfirmDialogContext = createContext(null);

export const ConfirmDialogProvider = ({ children }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger', // 'danger' | 'warning' | 'primary' | 'success'
    iconType: 'trash', // 'trash' | 'logout' | 'warning' | 'shield' | 'user' | 'lock'
  });

  const resolverRef = useRef(null);

  const confirm = useCallback(
    ({
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed with this action?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      variant = 'danger',
      iconType = 'trash',
    } = {}) => {
      return new Promise((resolve) => {
        resolverRef.current = resolve;
        setDialogState({
          isOpen: true,
          title,
          message,
          confirmText,
          cancelText,
          variant,
          iconType,
        });
      });
    },
    []
  );

  const handleConfirm = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  // Get matching icon
  const getIcon = () => {
    switch (dialogState.iconType) {
      case 'lock':
        return <Lock className="w-6 h-6 text-neon-cyan" />;
      case 'logout':
        return <LogOut className="w-6 h-6 text-neon-rose" />;
      case 'user':
        return <UserCheck className="w-6 h-6 text-neon-cyan" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case 'shield':
        return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'trash':
      default:
        return <Trash2 className="w-6 h-6 text-neon-rose" />;
    }
  };

  const getIconContainerStyle = () => {
    switch (dialogState.variant) {
      case 'warning':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
      case 'primary':
        return 'bg-neon-cyan/15 border-neon-cyan/30 text-neon-cyan shadow-[0_0_20px_rgba(0,242,254,0.2)]';
      case 'success':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
      case 'danger':
      default:
        return 'bg-rose-500/15 border-rose-500/30 text-neon-rose shadow-[0_0_20px_rgba(244,63,94,0.25)]';
    }
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}

      {/* Custom High-Contrast Obsidian Confirmation Modal */}
      {dialogState.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-obsidian-950/85 backdrop-blur-md animate-fadeIn">
          
          <div 
            className="w-full max-w-md rounded-3xl bg-obsidian-950 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-up relative overflow-hidden backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Top decorative ambient glow */}
            <div className={`absolute -top-12 -right-12 w-36 h-36 blur-[60px] rounded-full pointer-events-none ${
              dialogState.variant === 'danger'
                ? 'bg-rose-500/20'
                : dialogState.variant === 'warning'
                ? 'bg-amber-500/20'
                : 'bg-neon-cyan/20'
            }`} />

            {/* Header: Icon + Title */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${getIconContainerStyle()}`}>
                {getIcon()}
              </div>

              <div className="space-y-1 pt-0.5 min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-display font-bold text-white tracking-tight">
                  {dialogState.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {dialogState.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleCancel}
                className="text-xs sm:text-sm text-slate-300 hover:text-white"
              >
                {dialogState.cancelText}
              </Button>

              <Button
                type="button"
                variant={dialogState.variant === 'danger' ? 'danger' : 'primary'}
                size="md"
                onClick={handleConfirm}
                className="text-xs sm:text-sm font-bold shadow-md min-w-[120px]"
              >
                <span>{dialogState.confirmText}</span>
              </Button>
            </div>

          </div>

        </div>
      )}
    </ConfirmDialogContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider');
  }
  return context;
};
