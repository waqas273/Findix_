import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Package, 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  QrCode,
  Printer,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AdminProductModal } from '../components/admin/AdminProductModal';

export const AdminPage = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabParam === 'users' ? 'users' : tabParam === 'qr' ? 'qr' : 'products'
  );

  useEffect(() => {
    if (tabParam === 'users' || tabParam === 'products' || tabParam === 'qr') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Products state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // QR Production state
  const [tagsList, setTagsList] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [qrCategory, setQrCategory] = useState('Laser Metal Keychain');
  const [batchSize, setBatchSize] = useState(25);
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Fetch Real Products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        const prods = json.data?.products || (Array.isArray(json.data) ? json.data : []);
        setProducts(prods);
      } else {
        setProducts([]);
      }
    } catch (e) {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // 2. Fetch Real Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.users || []);
        setUsersList(list);
      } else {
        setUsersList([]);
      }
    } catch (e) {
      setUsersList([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // 3. Fetch QR Tags (Manufactured / Dummy / Claimed)
  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const res = await fetch('/api/admin/qr/tags?limit=50', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        setTagsList(json.data?.tags || []);
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUsers();
    fetchTags();
  }, [token]);

  // Handle Bulk Generate QR Codes
  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/admin/qr/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          batchSize: parseInt(batchSize, 10) || 25,
          categoryTag: qrCategory,
          notes: `Batch for ${qrCategory}`,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        addToast('success', `Generated ${batchSize} dummy QR codes for ${qrCategory}! Ready to print.`);
        fetchTags();
      } else {
        addToast('error', 'Failed to generate QR batch');
      }
    } catch (err) {
      addToast('error', err.message || 'Error generating QR batch');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId, title) => {
    const isConfirmed = await confirm({
      title: 'Delete Hardware Product',
      message: `Are you sure you want to remove "${title}" from the store catalog?`,
      confirmText: 'Delete Product',
      cancelText: 'Keep Product',
      variant: 'danger',
      iconType: 'trash',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        addToast('success', `Product "${title}" deleted.`);
      } else {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        addToast('success', `Product deleted.`);
      }
    } catch (e) {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      addToast('success', `Product deleted.`);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId, userEmail) => {
    if (user && (user.id === userId || user._id === userId)) {
      addToast('error', 'You cannot delete your own logged-in admin account.');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Delete User Account',
      message: `Are you sure you want to permanently delete user "${userEmail}"? All associated data and tags will be affected.`,
      confirmText: 'Delete User',
      cancelText: 'Keep Account',
      variant: 'danger',
      iconType: 'trash',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        setUsersList((prev) => prev.filter((u) => u._id !== userId));
        addToast('success', `User ${userEmail} deleted.`);
      } else {
        const json = await res.json();
        addToast('error', json.message || 'Failed to delete user');
      }
    } catch (e) {
      addToast('error', 'Error deleting user');
    }
  };

  // Handle Toggle User Role
  const handleToggleRole = async (userId, currentRole, userEmail) => {
    if (user && (user.id === userId || user._id === userId)) {
      addToast('error', 'You cannot change your own role.');
      return;
    }

    const nextRole = currentRole === 'admin' ? 'buyer' : 'admin';
    const isPromoting = nextRole === 'admin';

    const isConfirmed = await confirm({
      title: isPromoting ? 'Promote to Administrator' : 'Demote User Account',
      message: isPromoting
        ? `Grant Administrator privileges to "${userEmail}"?`
        : `Demote "${userEmail}" to a standard buyer account?`,
      confirmText: isPromoting ? 'Make Administrator' : 'Demote User',
      cancelText: 'Cancel',
      variant: isPromoting ? 'primary' : 'warning',
      iconType: 'user',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: nextRole }),
      });

      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: nextRole } : u))
        );
        addToast('success', `User ${userEmail} role updated to "${nextRole}".`);
      } else {
        addToast('error', 'Failed to update role');
      }
    } catch (e) {
      addToast('error', 'Error updating role');
    }
  };

  // Filter users by search
  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-24 max-w-6xl mx-auto px-4 pt-6">
      
      {/* 1. Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 text-xs font-mono font-bold border border-cyan-200 shadow-sm mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" /> ADMIN OPERATIONS
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            Findix Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Produce dummy QR codes for Keychains & Stickers, manage products, and view user records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'products' && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="font-bold shadow-md"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Add Product</span>
            </Button>
          )}

          {activeTab === 'users' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchUsers}
              className="font-medium text-xs border-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Refresh Users</span>
            </Button>
          )}

          {activeTab === 'qr' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchTags}
              className="font-medium text-xs border-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Refresh Tags</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Store Products ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('qr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'qr'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>QR Batch Production ({tagsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Users ({usersList.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: STORE PRODUCTS MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Official Hardware Products</span>
              <span className="text-xs font-mono text-cyan-700 px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200">
                {products.length} Products Live
              </span>
            </h2>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card className="text-center py-16 px-4 space-y-4 border-dashed border-slate-300 bg-white">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No Products in Store Catalog</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the button below to add your first physical tag or sticker pack.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setEditingProduct(null);
                  setIsProductModalOpen(true);
                }}
                className="font-bold shadow-md"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span>Add Product</span>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((prod) => (
                <Card
                  key={prod._id}
                  className="p-5 bg-white border-slate-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden">
                      <img
                        src={prod.images?.[0]?.url || prod.image || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300&auto=format&fit=crop&q=80'}
                        alt={prod.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate" title={prod.title}>
                        {prod.title}
                      </h4>
                      <span className="text-xs font-mono font-bold text-cyan-700 block">
                        PKR {prod.price?.toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>Stock: <b>{prod.stock ?? 0}</b></span>
                        <span>•</span>
                        <span className="capitalize">{prod.category === 'keychain' ? 'Laser Keychain' : 'QR Sticker'}</span>
                      </div>
                    </div>
                  </div>

                  {prod.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      IN STOCK
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setEditingProduct(prod);
                          setIsProductModalOpen(true);
                        }}
                        className="border-slate-300"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => handleDeleteProduct(prod._id, prod.title)}
                        className="text-red-600 hover:bg-red-50 p-1.5"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: QR PRODUCTION (KEYCHAINS & STICKERS) */}
      {/* ========================================================= */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          {/* Generation Control Bar */}
          <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-4 h-4 text-cyan-600" />
                <span>Generate Dummy QR Batch (Factory Production)</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Admin pre-generates unique unclaimed QR codes to laser-etch onto Keychains or print onto Weatherproof Stickers before dispatch.
              </p>
            </div>

            <form onSubmit={handleBulkGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Product</label>
                <select
                  value={qrCategory}
                  onChange={(e) => setQrCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 transition-colors cursor-pointer"
                >
                  <option value="Laser Metal Keychain">Laser Metal Keychain</option>
                  <option value="Weatherproof QR Sticker">Weatherproof QR Sticker</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Batch Quantity (Codes)</label>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-cyan-600 transition-colors cursor-pointer"
                >
                  <option value={10}>10 Codes (Sample Batch)</option>
                  <option value={25}>25 Codes (Standard Batch)</option>
                  <option value={50}>50 Codes (Production Batch)</option>
                  <option value={100}>100 Codes (Bulk Factory)</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isGenerating}
                className="font-bold shadow-md w-full"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                <span>Generate QR Codes</span>
              </Button>
            </form>
          </Card>

          {/* Manufactured QR Codes Table */}
          <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Manufactured QR Inventory ({tagsList.length} tags on record)
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Status: Unclaimed (Dummy) vs Claimed (Buyer Bound)
              </span>
            </div>

            {loadingTags ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : tagsList.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                No tags generated yet. Generate your first batch above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">QR Identifier</th>
                      <th className="py-2.5 px-3">Hardware Status</th>
                      <th className="py-2.5 px-3">Bound Item</th>
                      <th className="py-2.5 px-3">Linked Owner</th>
                      <th className="py-2.5 px-3 text-right">Direct Test Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tagsList.map((tag) => (
                      <tr key={tag._id || tag.qrSlug} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-cyan-700">
                          {tag.qrSlug}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            tag.status === 'claimed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {tag.status === 'claimed' ? 'CLAIMED BY BUYER' : 'DUMMY / READY TO PRINT'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {tag.itemName || '—'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {tag.ownerId?.name ? `${tag.ownerId.name} (${tag.ownerId.email})` : 'Unassigned (Waiting for buyer scan)'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={`/q/${tag.qrSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan-700 hover:text-cyan-800 font-bold text-xs"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: USER MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <Card className="p-6 bg-white border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered Users Directory</h2>
              <p className="text-xs text-slate-500">View registered members, promote admins, or delete accounts.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 transition-colors"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No users found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Registered</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isSelf = user && (user.id === u._id || user._id === u._id);
                    return (
                      <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center font-bold text-cyan-800 text-xs shrink-0">
                              {u.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.name || 'Anonymous User'}</span>
                                {isSelf && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-mono font-semibold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-slate-700">
                          {u.phone || '—'}
                        </td>

                        <td className="py-3.5 px-3 text-slate-700">
                          {u.city || 'Pakistan'}
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            u.role === 'admin'
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {u.role?.toUpperCase() || 'BUYER'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isSelf && (
                              <>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => handleToggleRole(u._id, u.role, u.email)}
                                  className="text-[10px] border-slate-300"
                                  title={u.role === 'admin' ? 'Demote to Buyer' : 'Promote to Admin'}
                                >
                                  {u.role === 'admin' ? (
                                    <>
                                      <UserX className="w-3 h-3 mr-1 text-slate-500" />
                                      <span>Demote</span>
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-3 h-3 mr-1 text-cyan-700" />
                                      <span>Make Admin</span>
                                    </>
                                  )}
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleDeleteUser(u._id, u.email)}
                                  className="text-red-600 hover:bg-red-50 p-1.5"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Add / Edit Product Modal */}
      <AdminProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        onProductSaved={(saved) => {
          setProducts((prev) => {
            const exists = prev.find((p) => p._id === saved._id);
            if (exists) return prev.map((p) => (p._id === saved._id ? saved : p));
            return [saved, ...prev];
          });
        }}
      />

    </div>
  );
};
