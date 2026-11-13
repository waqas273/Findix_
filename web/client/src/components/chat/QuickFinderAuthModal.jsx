import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  User, 
  Phone, 
  Lock, 
  ArrowRight, 
  Check, 
  MessageSquare,
  QrCode
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const QuickFinderAuthModal = ({ isOpen, onClose, qrSlug, itemName, onSuccess }) => {
  const { register, login } = useAuth();
  const { addToast } = useToast();

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        const res = await login({ email, password });
        if (res.success) {
          addToast('success', 'Signed in! Opening chat with owner...');
          onSuccess(res.user);
          onClose();
        } else {
          addToast('error', res.message || 'Login failed');
        }
      } else {
        // Fast 10-second finder registration
        const fallbackEmail = email || `finder_${Date.now()}@findix.pk`;
        const fallbackPassword = password || 'FindixFinder123!';

        const res = await register({
          name: name.trim() || 'Good Samaritan Finder',
          email: fallbackEmail,
          password: fallbackPassword,
          phone: phone || '',
          city: 'Karachi',
        });

        if (res.success) {
          addToast('success', 'Finder session created! Connecting to owner...');
          onSuccess(res.user);
          onClose();
        } else {
          addToast('error', res.message || 'Quick registration failed');
        }
      }
    } catch (err) {
      addToast('error', 'Network error during quick authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-md"
    >
      <div className="space-y-5 pt-1">
        
        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-obsidian-950 p-1.5 mx-auto border border-slate-700/80 shadow-md flex items-center justify-center">
            <img src="/logo.png" alt="Findix" className="w-full h-full object-cover rounded-full" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-display font-bold text-white">
              {isLoginMode ? 'Sign In to Message Owner' : '10-Second Quick Finder Access'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Directly coordinate recovery for <strong className="text-neon-cyan">{itemName || 'Protected Item'}</strong> ({qrSlug}) with zero spam.
            </p>
          </div>
        </div>

        {/* Quick Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLoginMode && (
            <Input
              label="Your Name"
              placeholder="e.g. Farhan Ali (Finder)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <Input
            label="Email or Username"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={isLoginMode}
          />

          {!isLoginMode && (
            <Input
              label="Contact Phone / WhatsApp (Optional)"
              placeholder="0300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}

          <Input
            label="Password (min 6 characters)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={isLoginMode}
          />

          {/* Guaranteed zero-leak note */}
          <div className="p-2.5 rounded-xl bg-obsidian-950 border border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-neon-cyan shrink-0" />
            <span>Findix encrypted relay ensures private, spam-free communication.</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full shadow-neon-sm font-bold text-xs sm:text-sm"
          >
            <span>{isLoginMode ? 'Sign In & Open Chat' : 'Start Messaging Owner'}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        {/* Toggle Login / Register */}
        <div className="text-center pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setIsLoginMode(!isLoginMode)}
            className="text-xs text-slate-400 hover:text-neon-cyan transition-colors"
          >
            {isLoginMode ? "Don't have an account? Quick Connect" : 'Already have a Findix account? Sign In'}
          </button>
        </div>

      </div>
    </Modal>
  );
};
