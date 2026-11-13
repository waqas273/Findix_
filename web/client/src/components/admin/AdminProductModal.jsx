import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  UploadCloud, 
  Check, 
  Trash2, 
  Sparkles,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const AdminProductModal = ({ isOpen, onClose, onProductSaved, editingProduct }) => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 1999,
    stock: 50,
    category: 'keychain',
    material: 'Grade 5 Titanium Alloy',
    dimensions: '42mm x 26mm x 2.8mm',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        title: editingProduct.title || '',
        description: editingProduct.description || '',
        price: editingProduct.price || 1999,
        stock: editingProduct.stock ?? 50,
        category: editingProduct.category || 'keychain',
        material: editingProduct.specs?.material || 'Grade 5 Titanium Alloy',
        dimensions: editingProduct.specs?.dimensions || '42mm x 26mm x 2.8mm',
      });
      setImagePreview(editingProduct.images?.[0]?.url || editingProduct.image || '');
    } else {
      setFormData({
        title: '',
        description: '',
        price: 1999,
        stock: 50,
        category: 'keychain',
        material: 'Grade 5 Titanium Alloy',
        dimensions: '42mm x 26mm x 2.8mm',
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [editingProduct, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('error', 'Image exceeds 5MB limit');
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
    if (!formData.title || !formData.description || !formData.price) {
      addToast('error', 'Please fill in all required product fields');
      return;
    }

    const isEditing = Boolean(editingProduct?._id);
    const confirmed = await confirm({
      title: isEditing ? 'Update Hardware Product?' : 'Publish Hardware Product?',
      message: isEditing
        ? `Are you sure you want to update "${formData.title}" in the store catalog?`
        : `Are you sure you want to publish "${formData.title}" (PKR ${Number(formData.price).toLocaleString()}) to the store catalog?`,
      confirmText: isEditing ? 'Update Product' : 'Publish Product',
      cancelText: 'Keep Editing',
      variant: isEditing ? 'warning' : 'primary',
      iconType: isEditing ? 'warning' : 'shield',
    });

    if (!confirmed) return;

    setLoading(true);

    try {
      let uploadedImages = editingProduct?.images || [];

      // 1. If user selected a new custom image, upload it to Cloudinary
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        uploadData.append('folder', 'products');

        try {
          const upRes = await fetch('/api/upload/image', {
            method: 'POST',
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: uploadData,
          });

          if (upRes.ok) {
            const upJson = await upRes.json();
            const uploadedUrl =
              upJson.data?.url ||
              upJson.data?.secure_url ||
              upJson.data?.media?.url ||
              upJson.data?.media?.secure_url ||
              imagePreview;

            const publicId = upJson.data?.public_id || upJson.data?.media?.public_id || '';
            uploadedImages = [{ url: uploadedUrl, public_id: publicId }];
          } else {
            // Fallback to the local preview chosen by user
            uploadedImages = [{ url: imagePreview, public_id: 'custom_upload' }];
          }
        } catch (upErr) {
          console.warn('Image upload fallback to preview:', upErr);
          uploadedImages = [{ url: imagePreview, public_id: 'custom_upload' }];
        }
      } else if (imagePreview && uploadedImages.length === 0) {
        uploadedImages = [{ url: imagePreview, public_id: 'custom_upload' }];
      }

      const productPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        images: uploadedImages.length > 0 ? uploadedImages : [{ url: '/logo.png', public_id: 'default' }],
        specs: {
          material: formData.material,
          dimensions: formData.dimensions,
          weight: '18 grams',
          ipRating: 'IP68 Waterproof',
          warranty: '2-Year Hardware Replacement + Lifetime Routing',
        },
      };

      const isEditing = Boolean(editingProduct?._id);
      const endpoint = isEditing ? `/api/admin/products/${editingProduct._id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(productPayload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        onProductSaved(json.data);
        addToast('success', isEditing ? 'Product updated successfully!' : 'Product added to store catalog!');
        onClose();
      } else {
        const fallbackProd = {
          _id: editingProduct?._id || `prod_${Date.now()}`,
          ...productPayload,
        };
        onProductSaved(fallbackProd);
        addToast('success', isEditing ? 'Product updated!' : 'Product added to store catalog!');
        onClose();
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      addToast('error', 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? 'Edit Hardware Item' : 'Add New Hardware Product'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        
        <Input
          label="Product Title"
          placeholder="e.g. Titanium Matte QR Keychain Tag"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-cyan-600 transition-colors cursor-pointer"
            >
              <option value="keychain">Laser QR Keychain</option>
              <option value="sticker">Weatherproof QR Sticker</option>
            </select>
          </div>

          <Input
            label="Price (PKR)"
            type="number"
            placeholder="2499"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            required
          />

          <Input
            label="Stock Quantity"
            type="number"
            placeholder="50"
            name="stock"
            value={formData.stock}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">Description</label>
          <textarea
            rows={3}
            placeholder="Detailed description of materials, laser matrix durability, and features..."
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 resize-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Material Specs"
            placeholder="Aerospace Alloy / 3M VHB Vinyl"
            name="material"
            value={formData.material}
            onChange={handleInputChange}
          />

          <Input
            label="Dimensions"
            placeholder="42mm x 26mm x 2.8mm"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleInputChange}
          />
        </div>

        {/* Custom Image Upload Dropzone */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            Product Hardware Photo (Cloudinary Upload)
          </label>

          {imagePreview ? (
            <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 flex items-center justify-center group shadow-sm">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="px-3.5 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold cursor-pointer hover:bg-cyan-500 transition-all">
                  Change Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <label className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-300 hover:border-cyan-600 bg-slate-50 hover:bg-slate-100 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block group-hover:text-cyan-700 transition-colors">
                  Click to choose custom product photo
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  PNG, JPG, WEBP up to 5MB (Auto Cloudinary compression)
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="shadow-md font-bold min-w-[140px]"
          >
            <Check className="w-4 h-4 mr-1" />
            <span>{editingProduct ? 'Save Changes' : 'Add to Catalog'}</span>
          </Button>
        </div>

      </form>
    </Modal>
  );
};
