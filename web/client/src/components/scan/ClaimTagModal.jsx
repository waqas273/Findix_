import React, { useState } from 'react';
import { QrCode, Shield, Check, Sparkles, Upload, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import api from '../../services/api';

export const ClaimTagModal = ({
  isOpen,
  onClose,
  qrSlug,
  onClaimSuccess,
}) => {
  const [itemName, setItemName] = useState('');
  const [productType, setProductType] = useState('keychain'); // 'keychain' | 'sticker'
  const [returnRewardNote, setReturnRewardNote] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [allowInAppChat, setAllowInAppChat] = useState(true);
  const [customWhatsApp, setCustomWhatsApp] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [isLost, setIsLost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setError('Please provide a name for this item');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        itemName: itemName.trim(),
        returnRewardNote: returnRewardNote.trim(),
        isLost,
        privacySettings: {
          showName: true,
          showPhone,
          showWhatsApp,
          allowInAppChat,
        },
        customContact: {
          phone: customPhone.trim(),
          whatsApp: customWhatsApp.trim(),
        },
      };

      const res = await api.post(`/q/claim/${encodeURIComponent(qrSlug)}`, payload);
      if (onClaimSuccess) {
        onClaimSuccess(res.data.data?.qrItem || res.data.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to claim tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Link & Activate Product (${qrSlug})`}
    >
      <form onSubmit={handleClaim} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Product Type Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">Product Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProductType('keychain')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                productType === 'keychain'
                  ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Laser Metal Keychain
            </button>
            <button
              type="button"
              onClick={() => setProductType('sticker')}
              className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                productType === 'sticker'
                  ? 'bg-cyan-50 border-cyan-500 text-cyan-800 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Weatherproof QR Sticker
            </button>
          </div>
        </div>

        <Input
          label="Item Name / Protected Valuables"
          placeholder="e.g. Honda Civic Keys or MacBook Pro M3"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />

        <Input
          label="Optional Reward / Bounty Pledge"
          placeholder="e.g. PKR 5,000 Cash Reward on Safe Return"
          value={returnRewardNote}
          onChange={(e) => setReturnRewardNote(e.target.value)}
        />

        {/* Privacy Toggles */}
        <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Finder Public Display Settings
            </h4>
          </div>
          <p className="text-[11px] text-slate-500">
            Control which contact options a finder sees when scanning your tag.
          </p>

          <div className="pt-2">
            <Toggle
              label="Allow WhatsApp Contact"
              description="Finders can tap to start a WhatsApp chat with you."
              checked={showWhatsApp}
              onChange={setShowWhatsApp}
            />
          </div>

          {showWhatsApp && (
            <div className="pl-2 pt-1">
              <Input
                placeholder="WhatsApp Number (e.g. +923001234567)"
                value={customWhatsApp}
                onChange={(e) => setCustomWhatsApp(e.target.value)}
                className="text-xs"
              />
            </div>
          )}

          <div className="border-t border-slate-200 pt-3">
            <Toggle
              label="Allow Direct Phone Voice Call"
              description="Displays your phone number directly on the recovery page."
              checked={showPhone}
              onChange={setShowPhone}
            />
          </div>

          {showPhone && (
            <div className="pl-2 pt-1">
              <Input
                placeholder="Phone Number (e.g. +923001234567)"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="text-xs"
              />
            </div>
          )}

          <div className="border-t border-slate-200 pt-3">
            <Toggle
              label="Allow In-App Encrypted Chat"
              description="Finders can message you safely within Findix without sharing numbers."
              checked={allowInAppChat}
              onChange={setAllowInAppChat}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} className="font-bold shadow-md">
            <span>Link Tag to My Account</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
