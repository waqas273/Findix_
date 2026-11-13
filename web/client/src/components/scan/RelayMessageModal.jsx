import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, MapPin, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const RelayMessageModal = ({
  isOpen,
  onClose,
  tagSlug,
  itemName,
}) => {
  const [finderContact, setFinderContact] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!finderContact) return;

    setIsSubmitting(true);
    // Simulate instant relay transmission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 900);
  };

  const handleReset = () => {
    setIsSent(false);
    setFinderContact('');
    setDropoffLocation('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Send Encrypted Message to Owner"
    >
      {isSent ? (
        <div className="text-center py-6 space-y-4 animate-scale-up">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h4 className="text-lg font-bold text-white">Alert Transmitted to Owner!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              The verified owner of <b className="text-white">"{itemName}"</b> has been notified via SMS and Findix Push Relay.
              They will contact you shortly at <span className="text-neon-cyan font-mono">{finderContact}</span>.
            </p>
          </div>

          <div className="pt-2">
            <Button variant="primary" size="md" onClick={handleReset} className="w-full">
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-obsidian-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
            <span>
              <b className="text-white">Findix Relay Shield:</b> Your communication is encrypted. The owner’s identity and personal address remain confidential.
            </span>
          </div>

          <Input
            label="Your Contact (Phone, WhatsApp, or Email)"
            placeholder="+92 300 1234567 or finder@email.com"
            value={finderContact}
            onChange={(e) => setFinderContact(e.target.value)}
            required
            icon={Phone}
          />

          <Input
            label="Current Item Location / Safe Drop-off Point"
            placeholder="e.g. Building Reception, Metro Lost & Found..."
            value={dropoffLocation}
            onChange={(e) => setDropoffLocation(e.target.value)}
            icon={MapPin}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Message or Return Instructions
            </label>
            <textarea
              rows={3}
              placeholder="e.g. I have safe custody of your item. Please call me to coordinate collection..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-obsidian-850 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={handleReset}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              <Send className="w-4 h-4 mr-1.5" />
              <span>Send Relay Alert</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
