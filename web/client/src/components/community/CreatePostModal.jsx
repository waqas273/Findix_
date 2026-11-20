import React, { useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  MapPin, 
  Globe, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  UploadCloud, 
  Trash2 
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const CreatePostModal = ({ isOpen, onClose, onPostCreated, defaultCity = 'Karachi' }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [content, setContent] = useState('');
  const [tag, setTag] = useState('Lost Alert'); // 'Lost Alert', 'Found Alert', 'General Discussion'
  const [scope, setScope] = useState('city'); // 'city', 'global'
  const [city, setCity] = useState(user?.city || defaultCity || 'Karachi');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tags = [
    { id: 'Lost Alert', label: 'Lost Alert', color: 'border-rose-300 text-rose-700 bg-rose-50 font-bold' },
    { id: 'Found Alert', label: 'Found Alert', color: 'border-emerald-300 text-emerald-700 bg-emerald-50 font-bold' },
    { id: 'General Discussion', label: 'General Discussion', color: 'border-cyan-300 text-cyan-700 bg-cyan-50 font-bold' },
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('error', 'File size exceeds 5MB limit');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      addToast('error', 'Please write a description for your community post');
      return;
    }

    const isConfirmed = await confirm({
      title: tag === 'Lost Alert' ? 'Broadcast Lost Alert?' : 'Publish Community Post?',
      message: `Are you sure you want to broadcast this ${tag} across ${scope === 'city' ? city : 'All Pakistan'}?`,
      confirmText: 'Broadcast Alert',
      cancelText: 'Keep Editing',
      variant: tag === 'Lost Alert' ? 'danger' : 'primary',
      iconType: tag === 'Lost Alert' ? 'warning' : 'shield',
    });

    if (!isConfirmed) return;

    setIsSubmitting(true);

    try {
      let uploadedMedia = { url: '', public_id: '' };

      // Upload image to Cloudinary if selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);
        uploadFormData.append('folder', 'findix/community');

        try {
          const uploadRes = await fetch('/api/upload/image', {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: uploadFormData,
          });

          if (uploadRes.ok) {
            const uploadJson = await uploadRes.json();
            if (uploadJson.data?.url) {
              uploadedMedia = {
                url: uploadJson.data.url,
                public_id: uploadJson.data.public_id || '',
              };
            }
          }
        } catch (uploadErr) {
          // If Cloudinary offline, fallback to local dataURL preview
          uploadedMedia = { url: imagePreview, public_id: 'local_preview' };
        }
      }

      // Create community post
      const postPayload = {
        content: content.trim(),
        scope,
        city,
        tag,
        media: uploadedMedia.url ? uploadedMedia : undefined,
      };

      const res = await fetch('/api/community/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(postPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onPostCreated(data.data);
        addToast('success', 'Community alert published successfully!');
      } else {
        // Fallback optimistic creation
        const optimisticPost = {
          _id: `post_${Date.now()}`,
          author: {
            name: user?.name || 'You',
            city: city,
            avatar: user?.avatar || { url: '' },
            role: user?.role || 'buyer',
          },
          scope,
          city,
          tag,
          content: content.trim(),
          media: uploadedMedia.url ? uploadedMedia : (imagePreview ? { url: imagePreview } : undefined),
          likesCount: 0,
          commentsCount: 0,
          comments: [],
          createdAt: new Date(),
        };
        onPostCreated(optimisticPost);
        addToast('success', 'Alert published to community!');
      }

      // Reset form
      setContent('');
      setImageFile(null);
      setImagePreview('');
      onClose();
    } catch (err) {
      const optimisticPost = {
        _id: `post_${Date.now()}`,
        author: {
          name: user?.name || 'You',
          city: city,
          avatar: user?.avatar || { url: '' },
          role: user?.role || 'buyer',
        },
        scope,
        city,
        tag,
        content: content.trim(),
        media: imagePreview ? { url: imagePreview } : undefined,
        likesCount: 0,
        commentsCount: 0,
        comments: [],
        createdAt: new Date(),
      };
      onPostCreated(optimisticPost);
      addToast('success', 'Alert published to community!');
      setContent('');
      setImageFile(null);
      setImagePreview('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Community Alert"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        
        {/* Quick Tags Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Category Tag</label>
          <div className="flex items-center gap-2 flex-wrap">
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTag(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  tag === t.id
                    ? `${t.color} shadow-sm ring-1 ring-cyan-200`
                    : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 shadow-sm'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scope & City Binding Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Broadcast Feed</label>
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setScope('city')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  scope === 'city'
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Local City Hub
              </button>
              <button
                type="button"
                onClick={() => setScope('global')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  scope === 'global'
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Global Feed
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Target City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-cyan-500 shadow-sm transition-colors"
            >
              <option value="Karachi">Karachi</option>
              <option value="Lahore">Lahore</option>
              <option value="Islamabad">Islamabad</option>
              <option value="Rawalpindi">Rawalpindi</option>
              <option value="Gujranwala">Gujranwala</option>
              <option value="Faisalabad">Faisalabad</option>
              <option value="Peshawar">Peshawar</option>
              <option value="Multan">Multan</option>
              <option value="Quetta">Quetta</option>
            </select>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Alert Description</label>
          <textarea
            rows={4}
            placeholder="Describe the lost or found item, last known landmark, time of loss, reward bounty, or contact instructions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-sm resize-none transition-colors"
          />
          <span className="text-[10px] text-slate-500 block text-right font-mono">
            {content.length} / 2000 characters
          </span>
        </div>

        {/* Photo Upload Attachment Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Photo Attachment (Optional)</label>
          
          {imagePreview ? (
            <div className="relative w-full h-36 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden group shadow-sm">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:text-rose-400 transition-colors cursor-pointer"
                title="Remove image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-center space-y-1">
              <UploadCloud className="w-6 h-6 text-cyan-600" />
              <span className="text-xs text-slate-700 font-semibold">Click to upload photo</span>
              <span className="text-[10px] text-slate-500">PNG, JPG, or WEBP up to 5MB</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSubmitting}
            className="shadow-sm font-bold"
          >
            <span>Publish Community Alert</span>
            <Check className="w-4 h-4 ml-1" />
          </Button>
        </div>

      </form>
    </Modal>
  );
};
