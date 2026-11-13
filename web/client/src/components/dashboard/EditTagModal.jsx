import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Shield, 
  Upload, 
  Image, 
  Save, 
  Check, 
  AlertCircle, 
  Trash2, 
  Phone, 
  MessageSquare,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

export const EditTagModal = ({
  isOpen,
  onClose,
  item,
  onItemUpdated,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'privacy'

  // Details State
  const [itemName, setItemName] = useState('');
  const [returnRewardNote, setReturnRewardNote] = useState('');
  const [isLost, setIsLost] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Privacy State
  const [showName, setShowName] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const [allowInAppChat, setAllowInAppChat] = useState(true);
  const [customPhone, setCustomPhone] = useState('');
  const [customWhatsApp, setCustomWhatsApp] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setItemName(item.itemName || '');
      setReturnRewardNote(item.returnRewardNote || '');
      setIsLost(Boolean(item.isLost));
      setImagePreview(item.itemImage?.url || '');
      setImageFile(null);

      const priv = item.privacySettings || {};
      setShowName(priv.showName !== false);
      setShowPhone(Boolean(priv.showPhone));
      setShowWhatsApp(priv.showWhatsApp !== false);
      setAllowInAppChat(priv.allowInAppChat !== false);

      const custom = item.customContact || {};
      setCustomPhone(custom.phone || '');
      setCustomWhatsApp(custom.whatsApp || '');
      setError('');
    }
  }, [item, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!item) return;

    setIsSaving(true);
    setError('');

    try {
      // 1. Upload new image to Cloudinary if selected
      let uploadedMedia = item.itemImage;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('folder', 'items');
        const uploadRes = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedMedia = uploadRes.data.data.media;
      }

      // 2. Save Item Details
      const detailsPayload = {
        itemName: itemName.trim(),
        returnRewardNote: returnRewardNote.trim(),
        isLost,
        itemImage: uploadedMedia,
      };
      await api.patch(`/items/${item._id}/details`, detailsPayload);

      // 3. Save Privacy Settings
      const privacyPayload = {
        privacySettings: {
          showName,
          showPhone,
          showWhatsApp,
          allowInAppChat,
        },
        customContact: {
          phone: customPhone.trim(),
          whatsApp: customWhatsApp.trim(),
        },
      };
      const privacyRes = await api.patch(`/items/${item._id}/privacy`, privacyPayload);

      showToast({
        title: 'Tag Configuration Updated',
        message: `Preferences for '${itemName || item.qrSlug}' have been saved.`,
        type: 'success',
      });

      if (onItemUpdated) {
        onItemUpdated(privacyRes.data.data.item);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save tag settings');
      showToast({
        title: 'Update Failed',
        message: err.message || 'Error saving tag preferences.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Tag: ${item.qrSlug}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'details'
                ? 'text-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Item Details & Media
            {activeTab === 'details' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan shadow-neon-sm" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'privacy'
                ? 'text-neon-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Privacy Shield & Relay
            {activeTab === 'privacy' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan shadow-neon-sm" />
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-neon-rose/10 border border-neon-rose/30 text-xs text-neon-rose flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* TAB 1: ITEM DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 animate-fade-in">
              <Input
                label="Item Label / Model"
                placeholder="e.g. My Tumi Backpack or Car Keys"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />

              <Input
                label="Return Reward Note / Bounty"
                placeholder="e.g. PKR 5,000 Cash Reward via EasyPaisa on safe return"
                value={returnRewardNote}
                onChange={(e) => setReturnRewardNote(e.target.value)}
              />

              {/* Status Switch */}
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-slate-800 space-y-3">
                <Toggle
                  label="Report as 'LOST' (Active Recovery Mode)"
                  description="Flashes urgent lost warning banner on public scan page and prioritizes finder notifications."
                  checked={isLost}
                  onChange={setIsLost}
                />
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Current Tag State:</span>
                  <Badge variant={isLost ? 'lost' : 'safe'} pulse={isLost} size="xs">
                    {isLost ? 'LOST ALERT ACTIVE' : 'PROTECTED SAFE'}
                  </Badge>
                </div>
              </div>

              {/* Photo Upload Box */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Item Photograph (Cloudinary CDN)
                </label>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-obsidian-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-8 h-8 text-slate-600" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-grow">
                    <input
                      type="file"
                      id="item-image-file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="item-image-file"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-obsidian-850 hover:bg-obsidian-800 border border-slate-750 text-xs font-semibold text-white cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-neon-cyan" />
                      <span>{imagePreview ? 'Replace Photo' : 'Upload Photo'}</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      PNG, JPG, or WEBP up to 5MB. Auto-optimized for instant finder loading.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY SHIELD */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-obsidian-950 border border-slate-800 space-y-4">
                <Toggle
                  label="Show Real Name"
                  description="Display your name or display 'Verified Findix Member' to keep full anonymity."
                  checked={showName}
                  onChange={setShowName}
                />

                <div className="border-t border-slate-800/80 pt-3">
                  <Toggle
                    label="Show WhatsApp Direct Button"
                    description="Permit finders to launch a pre-populated WhatsApp chat with 1 tap."
                    checked={showWhatsApp}
                    onChange={setShowWhatsApp}
                  />
                  {showWhatsApp && (
                    <div className="mt-2 pl-4 border-l border-neon-cyan/40">
                      <Input
                        label="Alternate WhatsApp Number (Optional)"
                        placeholder="+92 300 1234567"
                        value={customWhatsApp}
                        onChange={(e) => setCustomWhatsApp(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <Toggle
                    label="Show Direct Phone Number"
                    description="Display your phone number for immediate voice calls."
                    checked={showPhone}
                    onChange={setShowPhone}
                  />
                  {showPhone && (
                    <div className="mt-2 pl-4 border-l border-neon-cyan/40">
                      <Input
                        label="Alternate Phone Number (Optional)"
                        placeholder="+92 300 1234567"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <Toggle
                    label="Allow In-App Encrypted Relay Chat"
                    description="Permit finders to send drop-off notes without revealing any phone numbers."
                    checked={allowInAppChat}
                    onChange={setAllowInAppChat}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-obsidian-900 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <Lock className="w-4 h-4 text-neon-cyan shrink-0" />
                <span>Zero-Leak Rule: Your real email and private password are never shared.</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <a
              href={`/q/${item.qrSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-neon-cyan transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Scan Page</span>
            </a>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Configuration</span>
              </Button>
            </div>
          </div>

        </form>
      </div>
    </Modal>
  );
};
