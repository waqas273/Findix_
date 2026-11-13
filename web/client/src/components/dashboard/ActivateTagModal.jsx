import React, { useState } from 'react';
import { QrCode, Sparkles, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const ActivateTagModal = ({
  isOpen,
  onClose,
  onTagActivated,
}) => {
  const { showToast } = useToast();
  const [qrSlug, setQrSlug] = useState('');
  const [itemName, setItemName] = useState('');
  const [returnRewardNote, setReturnRewardNote] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!qrSlug.trim() || !itemName.trim()) {
      setError('Please provide both the QR slug and an item name');
      return;
    }

    setIsActivating(true);
    setError('');

    try {
      const cleanSlug = qrSlug.trim().toUpperCase();
      const payload = {
        itemName: itemName.trim(),
        returnRewardNote: returnRewardNote.trim(),
        isLost: false,
        privacySettings: {
          showName: true,
          showPhone: false,
          showWhatsApp: true,
          allowInAppChat: true,
        },
      };

      const res = await api.post(`/q/claim/${encodeURIComponent(cleanSlug)}`, payload);
      const claimedItem = res.data.data.qrItem;

      showToast({
        title: 'Tag Successfully Linked!',
        message: `'${claimedItem.itemName}' is now active on the Findix Recovery Network.`,
        type: 'success',
      });

      if (onTagActivated) {
        onTagActivated(claimedItem);
      }

      setQrSlug('');
      setItemName('');
      setReturnRewardNote('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to activate tag. Please verify the code.');
      showToast({
        title: 'Activation Error',
        message: err.message || 'Tag may already be claimed or invalid.',
        type: 'error',
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Link New Hardware Tag"
    >
      <form onSubmit={handleActivate} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-neon-rose/10 border border-neon-rose/30 text-xs text-neon-rose flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1">
          <Input
            label="Tag Identifier (Printed on QR Badge)"
            placeholder="e.g. FDX-7749-KEY"
            value={qrSlug}
            onChange={(e) => setQrSlug(e.target.value)}
            required
            className="font-mono uppercase text-sm tracking-wider"
          />
          <p className="text-[11px] text-slate-500">
            Check the laser-etched code on your keychain or holographic sticker.
          </p>
        </div>

        <Input
          label="Item Label / Model"
          placeholder="e.g. Dell XPS 15 or House Keys"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />

        <Input
          label="Optional Finder Reward Pledge"
          placeholder="e.g. PKR 5,000 Cash Bounty on Safe Return"
          value={returnRewardNote}
          onChange={(e) => setReturnRewardNote(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isActivating}>
            <span>Link to My Account</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </form>
    </Modal>
  );
};
