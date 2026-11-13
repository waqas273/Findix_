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
  ShieldAlert,
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
  ExternalLink,
  Download,
  Truck,
  Clock,
  AlertTriangle,
  Lock,
  Layers,
  FileSpreadsheet,
  Eye,
  Check,
  Radio,
  Tag,
  X,
  Boxes
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AdminProductModal } from '../components/admin/AdminProductModal';
import { AdminPrintSheetModal } from '../components/admin/AdminPrintSheetModal';
import { SingleQRModal } from '../components/admin/SingleQRModal';

export const AdminPage = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab control: 'qr' (Factory) | 'orders' (Pipeline) | 'products' (Catalog) | 'users' (RBAC) | 'telemetry'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    ['qr', 'orders', 'products', 'users', 'telemetry'].includes(tabParam) ? tabParam : 'qr'
  );

  useEffect(() => {
    if (['qr', 'orders', 'products', 'users', 'telemetry'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // -------------------------------------------------------------
  // Global Metrics State
  // -------------------------------------------------------------
  const [metrics, setMetrics] = useState({
    totalTags: 0,
    claimedCount: 0,
    unclaimedCount: 0,
    claimPercentage: 0,
    lostItemsCount: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Helper to auto-generate standardized unique batch reference
  const generateDefaultBatchRef = (category) => {
    const code = category?.toLowerCase().includes('sticker') ? 'STICKER' : 'KEYCHAIN';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(10 + Math.random() * 90);
    return `BATCH-${code}-${dateStr}-${rand}`;
  };

  // -------------------------------------------------------------
  // QR Production (Factory) State
  // -------------------------------------------------------------
  const [qrSubTab, setQrSubTab] = useState('batches'); // 'batches' | 'tags'
  const [batchesList, setBatchesList] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [batchRefInput, setBatchRefInput] = useState(() => generateDefaultBatchRef('Laser Metal Keychain'));
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('all');
  const [inspectTag, setInspectTag] = useState(null);

  const [tagsList, setTagsList] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [qrCategory, setQrCategory] = useState('Laser Metal Keychain');
  const [batchSize, setBatchSize] = useState(42);
  const [batchNotes, setBatchNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tagStatusFilter, setTagStatusFilter] = useState('all');
  const [tagTypeFilter, setTagTypeFilter] = useState('all');
  const [tagSearch, setTagSearch] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedBatchForPrint, setSelectedBatchForPrint] = useState(null);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  // -------------------------------------------------------------
  // Orders Pipeline State
  // -------------------------------------------------------------
  const [ordersList, setOrdersList] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // -------------------------------------------------------------
  // Products Catalog State (Strictly 2 Physical Products)
  // -------------------------------------------------------------
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // -------------------------------------------------------------
  // Users Management State
  // -------------------------------------------------------------
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // =============================================================
  // API Fetchers
  // =============================================================

  // Fetch Global Telemetry
  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setMetrics(json.data);
      }
    } catch (e) {
      console.warn('Metrics fallback');
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Fetch Batches Aggregated
  const fetchBatches = async () => {
    setLoadingBatches(true);
    try {
      const res = await fetch('/api/admin/qr/batches', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const json = await res.json();
        setBatchesList(json.data || []);
      }
    } catch (e) {
      console.warn('Batches fetch fallback', e);
    } finally {
      setLoadingBatches(false);
    }
  };

  // Fetch Tags (Factory Inventory)
  const fetchTags = async (batchOverride) => {
    setLoadingTags(true);
    try {
      const queryParams = new URLSearchParams({ limit: '100' });
      if (tagStatusFilter !== 'all') queryParams.append('status', tagStatusFilter);
      if (tagTypeFilter !== 'all') queryParams.append('productType', tagTypeFilter);
      
      const activeBatch = batchOverride !== undefined ? batchOverride : selectedBatchFilter;
      if (activeBatch && activeBatch !== 'all') {
        queryParams.append('batchId', activeBatch);
      }

      if (tagSearch.trim()) queryParams.append('search', tagSearch.trim());

      const res = await fetch(`/api/admin/qr/tags?${queryParams.toString()}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const json = await res.json();
        setTagsList(json.data?.tags || []);
      }
    } catch (e) {
      console.warn('Tags fetch fallback');
    } finally {
      setLoadingTags(false);
    }
  };

  // Fetch Orders Pipeline
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const json = await res.json();
        setOrdersList(json.data || []);
      }
    } catch (e) {
      console.warn('Orders fetch fallback');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Products Catalog
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const json = await res.json();
        const prods = json.data?.products || (Array.isArray(json.data) ? json.data : []);
        setProducts(prods);
      }
    } catch (e) {
      console.warn('Products fetch fallback');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.users || []);
        setUsersList(list);
      }
    } catch (e) {
      console.warn('Users fetch fallback');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchBatches();
    fetchTags();
    fetchOrders();
    fetchProducts();
    fetchUsers();
  }, [token]);

  // Refresh tags when filter changes
  useEffect(() => {
    fetchTags();
  }, [tagStatusFilter, tagTypeFilter, selectedBatchFilter]);

  // =============================================================
  // Action Handlers
  // =============================================================

  // 1. Bulk Generate Dummy QR Codes (Batch Reference is Compulsory)
  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    if (!batchRefInput.trim()) {
      addToast('error', 'Batch Reference is compulsory! Please enter a unique batch code.');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/admin/qr/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          batchSize: parseInt(batchSize, 10) || 42,
          categoryTag: qrCategory,
          batchRef: batchRefInput.trim(),
          notes: batchNotes || `Factory Batch for ${qrCategory}`,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        addToast('success', `Manufactured ${batchSize} unassigned QR tags for batch "${batchRefInput.trim()}"! Stored in database.`);
        fetchTags();
        fetchBatches();
        fetchMetrics();
        // Generate new sequential default for next batch
        setBatchRefInput(generateDefaultBatchRef(qrCategory));
        setBatchNotes('');
        
        // Auto-open print modal with generated batch
        if (json.data?.allSlugs && json.data.allSlugs.length > 0) {
          setSelectedBatchForPrint({
            batchId: json.data.batchId,
            tags: json.data.allSlugs,
          });
          setIsPrintModalOpen(true);
        }
      } else {
        const errJson = await res.json();
        addToast('error', errJson.message || 'Failed to generate QR batch');
      }
    } catch (err) {
      addToast('error', err.message || 'Error executing QR generation');
    } finally {
      setIsGenerating(false);
    }
  };

  // 1b. Print Specific Production Batch (Fetches All Codes in Batch)
  const handlePrintBatch = async (batchId) => {
    try {
      addToast('info', `Loading tags for batch ${batchId}...`);
      const res = await fetch(`/api/admin/qr/tags?batchId=${encodeURIComponent(batchId)}&limit=500`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) {
        const json = await res.json();
        const batchTags = json.data?.tags || [];
        if (batchTags.length === 0) {
          addToast('warning', `No tags found for batch ${batchId}`);
          return;
        }
        setSelectedBatchForPrint({
          batchId,
          tags: batchTags,
        });
        setIsPrintModalOpen(true);
      } else {
        addToast('error', 'Failed to load batch tags for printing');
      }
    } catch (e) {
      addToast('error', 'Error loading batch for printing');
    }
  };

  // 1c. Delete Entire Dummy Batch
  const handleDeleteBatch = async (batchId, unclaimedCount) => {
    const isConfirmed = await confirm({
      title: 'Delete Production Batch',
      message: `Are you sure you want to delete dummy batch "${batchId}"? This will permanently delete all ${unclaimedCount} unclaimed QR codes in this batch from the database. Claimed buyer tags (if any) will NOT be affected.`,
      confirmText: `Delete Batch (${unclaimedCount} tags)`,
      cancelText: 'Cancel',
      variant: 'danger',
      iconType: 'trash',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/qr/batches/${encodeURIComponent(batchId)}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      if (res.ok) {
        const json = await res.json();
        addToast('success', json.message || `Deleted batch ${batchId}`);
        fetchBatches();
        fetchTags();
        fetchMetrics();
      } else {
        const json = await res.json();
        addToast('error', json.message || 'Failed to delete batch');
      }
    } catch (e) {
      addToast('error', 'Error deleting batch');
    }
  };

  // 2. Export All Current Tags to Laser Machine CSV
  const handleExportCSV = (tagsToExport = tagsList) => {
    if (!tagsToExport || tagsToExport.length === 0) {
      addToast('warning', 'No QR codes to export.');
      return;
    }

    const headers = ['QR Slug', 'Full Activation URL', 'Product Type', 'Status', 'Linked Item', 'Owner Email', 'Created At'];
    const rows = tagsToExport.map((t) => [
      t.qrSlug,
      `https://findix.pk/q/${t.qrSlug}`,
      t.productType || 'keychain',
      t.status || 'unclaimed',
      t.itemName || 'Unassigned',
      t.ownerId?.email || 'None',
      t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Findix-Factory-QR-Tags-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', `Exported ${tagsToExport.length} tags to CSV!`);
  };

  // 2b. Delete Single Dummy Tag
  const handleDeleteSingleTag = async (tagId, qrSlug) => {
    const isConfirmed = await confirm({
      title: 'Delete Dummy QR Tag',
      message: `Are you sure you want to delete dummy tag "${qrSlug}"? This action removes it permanently from the database.`,
      confirmText: 'Delete Tag',
      cancelText: 'Cancel',
      variant: 'danger',
      iconType: 'trash',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/qr/tags/${tagId}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      if (res.ok) {
        addToast('success', `Tag ${qrSlug} removed from database.`);
        setSelectedTagIds((prev) => prev.filter((id) => id !== tagId && id !== qrSlug));
        fetchTags();
        fetchMetrics();
      } else {
        const json = await res.json();
        addToast('error', json.message || 'Failed to delete tag');
      }
    } catch (e) {
      addToast('error', 'Error deleting tag');
    }
  };

  // 2c. Multi-Select Bulk Delete Dummy Tags
  const handleBulkDeleteTags = async () => {
    if (selectedTagIds.length === 0) return;

    const isConfirmed = await confirm({
      title: 'Bulk Delete Dummy Tags',
      message: `Permanently delete ${selectedTagIds.length} selected dummy QR tags from the database? This cannot be undone.`,
      confirmText: `Delete ${selectedTagIds.length} Tags`,
      cancelText: 'Keep Tags',
      variant: 'danger',
      iconType: 'trash',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch('/api/admin/qr/tags/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ tagIds: selectedTagIds }),
      });

      if (res.ok) {
        const json = await res.json();
        addToast('success', json.message || `Deleted ${selectedTagIds.length} dummy tags.`);
        setSelectedTagIds([]);
        fetchTags();
        fetchMetrics();
      } else {
        const json = await res.json();
        addToast('error', json.message || 'Failed to delete tags');
      }
    } catch (e) {
      addToast('error', 'Error executing bulk deletion');
    }
  };

  // Selection toggle logic
  const dummyTagsOnPage = tagsList.filter((t) => t.status === 'unclaimed');
  const allDummySelected = 
    dummyTagsOnPage.length > 0 && 
    dummyTagsOnPage.every((t) => selectedTagIds.includes(t._id || t.qrSlug));

  const handleToggleSelectAll = () => {
    if (allDummySelected) {
      setSelectedTagIds([]);
    } else {
      setSelectedTagIds(dummyTagsOnPage.map((t) => t._id || t.qrSlug));
    }
  };

  const handleToggleSelectTag = (id) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 3. Update Order Pipeline Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrdersList((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, pipelineStatus: newStatus } : o))
        );
        addToast('success', `Order moved to status: ${newStatus}`);
        fetchMetrics();
      } else {
        addToast('error', 'Failed to update order pipeline status');
      }
    } catch (e) {
      addToast('error', 'Error updating order');
    }
  };

  // 4. Delete Hardware Product
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
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        addToast('success', `Product "${title}" removed.`);
      }
    } catch (e) {
      addToast('error', 'Error deleting product');
    }
  };

  // 5. Delete User Account (with Security Guard)
  const handleDeleteUser = async (userId, userEmail) => {
    if (user && (user.id === userId || user._id === userId)) {
      addToast('error', 'Security Policy: You cannot delete your own active administrator account.');
      return;
    }

    const isConfirmed = await confirm({
      title: 'Permanent Account Termination',
      message: `Are you sure you want to permanently delete user "${userEmail}"? All linked recovery tags will be unbound.`,
      confirmText: 'Delete User Account',
      cancelText: 'Keep Account',
      variant: 'danger',
      iconType: 'trash',
    });

    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      if (res.ok) {
        setUsersList((prev) => prev.filter((u) => u._id !== userId));
        addToast('success', `User account ${userEmail} terminated.`);
        fetchMetrics();
      } else {
        const json = await res.json();
        addToast('error', json.message || 'Failed to delete user');
      }
    } catch (e) {
      addToast('error', 'Error deleting user');
    }
  };

  // 6. Toggle User Role (Admin / Buyer)
  const handleToggleRole = async (userId, currentRole, userEmail) => {
    if (user && (user.id === userId || user._id === userId)) {
      addToast('error', 'Security Policy: You cannot modify your own administrative role.');
      return;
    }

    const nextRole = currentRole === 'admin' ? 'buyer' : 'admin';
    const isPromoting = nextRole === 'admin';

    const isConfirmed = await confirm({
      title: isPromoting ? 'Elevate to Full Administrator' : 'Demote Account to Buyer',
      message: isPromoting
        ? `Grant Full Security Clearance & Management privileges to "${userEmail}"?`
        : `Demote "${userEmail}" to a standard buyer account?`,
      confirmText: isPromoting ? 'Grant Clearance' : 'Demote Account',
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
        addToast('success', `Role for ${userEmail} updated to "${nextRole}".`);
      } else {
        addToast('error', 'Failed to update role');
      }
    } catch (e) {
      addToast('error', 'Error updating role');
    }
  };

  // Filtered Orders
  const filteredOrders = ordersList.filter((o) => {
    const q = orderSearch.toLowerCase();
    const matchesSearch = 
      o._id?.toLowerCase().includes(q) ||
      o.buyerId?.name?.toLowerCase().includes(q) ||
      o.buyerId?.email?.toLowerCase().includes(q) ||
      o.shippingAddress?.city?.toLowerCase().includes(q);
    const matchesStatus = orderStatusFilter === 'all' || o.pipelineStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Users
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
    <div className="space-y-8 pb-32 max-w-7xl mx-auto px-4 pt-4 sm:pt-6 animate-fade-in print:p-0 print:m-0 print:max-w-none print:pb-0">
      
      {/* ========================================================= */}
      {/* SCREEN UI CONTAINER (Completely Hidden When Printing Sheet) */}
      {/* ========================================================= */}
      <div className="space-y-8 print:hidden">

      {/* ========================================================= */}
      {/* 1. SECURITY & IDENTITY BANNER */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-700/80">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold font-display tracking-tight text-white">
                Findix Administrative Command Portal
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold uppercase tracking-wider">
                RBAC Level 4 Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Signed in as: <strong className="text-cyan-300 font-mono">{user?.email || 'findix.qr@gmail.com'}</strong> · Physical QR Factory & Pipeline Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchMetrics();
              fetchTags();
              fetchOrders();
              fetchUsers();
              addToast('info', 'Command telemetry refreshed');
            }}
            className="text-xs bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            <span>Sync Telemetry</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedBatchForPrint({ batchId: 'ALL-TAGS', tags: tagsList });
              setIsPrintModalOpen(true);
            }}
            className="text-xs font-bold bg-cyan-600 hover:bg-cyan-500 shadow-md"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            <span>Print QR Sheet</span>
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. HIGH-LEVEL LIFECYCLE STATS CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-white border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Manufactured Tags</span>
            <QrCode className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black font-display text-slate-900">
            {metrics.totalTags || tagsList.length}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <span className="text-cyan-700 font-bold">{metrics.claimedCount} claimed</span>
            <span>·</span>
            <span>{metrics.unclaimedCount} in factory stock</span>
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dummy QR Inventory</span>
            <Tag className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-display text-amber-600">
            {metrics.unclaimedCount || tagsList.filter(t => t.status === 'unclaimed').length}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Ready to laser-engrave / print & sell
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Lost Mode Broadcasts</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black font-display text-rose-600">
            {metrics.lostItemsCount || tagsList.filter(t => t.isLost).length}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Active emergency owner alerts
          </div>
        </Card>

        <Card className="p-4 bg-white border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Store Orders</span>
            <Truck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-display text-slate-900">
            {ordersList.length}
          </div>
          <div className="text-[11px] text-emerald-700 font-mono font-bold">
            PKR {metrics.totalRevenue ? Number(metrics.totalRevenue).toLocaleString() : '0'} Revenue
          </div>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* 3. OPERATIONAL NAVIGATION TABS */}
      {/* ========================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
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
          <span>Factory Production & QR Grid ({tagsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Orders & Dispatch Pipeline ({ordersList.length})</span>
        </button>

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
          <span>Hardware Catalog (2 Products)</span>
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
          <span>User Directory & RBAC ({usersList.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: FACTORY PRODUCTION & QR LIFECYCLE GRID */}
      {/* ========================================================= */}
      {activeTab === 'qr' && (
        <div className="space-y-6">
          
          {/* Batch Generation Control Hub */}
          <Card className="p-6 bg-white border-slate-200 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Printer className="w-4 h-4 text-cyan-600" />
                  <span>Physical QR Batch Fabricator</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-generate dummy (unclaimed) QR codes to laser-engrave onto Keychains or print onto Weatherproof Vinyl Stickers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV()}
                  className="text-xs font-semibold border-slate-300"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-slate-600" />
                  <span>Export Laser CSV</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedBatchForPrint({ batchId: 'CURRENT-VIEW', tags: tagsList });
                    setIsPrintModalOpen(true);
                  }}
                  className="text-xs font-bold bg-cyan-600 hover:bg-cyan-700 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  <span>Print Batch Labels</span>
                </Button>
              </div>
            </div>

            <form onSubmit={handleBulkGenerate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Product</label>
                <select
                  value={qrCategory}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setQrCategory(newCat);
                    setBatchRefInput(generateDefaultBatchRef(newCat));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 cursor-pointer"
                >
                  <option value="Laser Metal Keychain">Laser Metal Keychain</option>
                  <option value="Weatherproof QR Sticker">Weatherproof QR Stickers (Pack of 3)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Batch Quantity (Codes)</label>
                <select
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-none focus:border-cyan-600 cursor-pointer"
                >
                  <option value={21}>21 Codes (Half Page · 0.5 A4 Sheet)</option>
                  <option value={42}>42 Codes (1 Full Page · 1.0 A4 Sheet)</option>
                  <option value={84}>84 Codes (2 Full Pages · 2.0 A4 Sheets)</option>
                  <option value={126}>126 Codes (3 Full Pages · 3.0 A4 Sheets)</option>
                  <option value={210}>210 Codes (5 Full Pages · 5.0 A4 Sheets)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Batch Reference <span className="text-red-500 font-bold">*</span></span>
                  <span className="text-[10px] text-cyan-700 font-mono font-bold">Compulsory</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BATCH-KEYCHAIN-20261113-01"
                  value={batchRefInput}
                  onChange={(e) => setBatchRefInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Production Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Islamabad Direct Stock Drop"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="sm:col-span-4 flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-2">
                <div className="text-[11px] text-slate-500 font-mono">
                  Exact A4 Print Standard: 42 codes (6 × 7 grid) per page · Light dashed cutting lines · Database persistent
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isGenerating}
                  className="font-bold shadow-md bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto px-6"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  <span>Manufacture QR Batch ({batchSize} Codes)</span>
                </Button>
              </div>
            </form>
          </Card>

          {/* Sub-Navigation Switcher: Batches vs Individual Tags */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQrSubTab('batches')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  qrSubTab === 'batches'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Production Batches ({batchesList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQrSubTab('tags');
                  setSelectedBatchFilter('all');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  qrSubTab === 'tags'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span>All Individual Tags ({tagsList.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => {
                  fetchBatches();
                  fetchTags();
                  addToast('info', 'Refreshed QR inventory');
                }}
                className="text-xs text-slate-600 border-slate-300"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1 text-cyan-600" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SUB-VIEW 1: PRODUCTION BATCHES TABLE                      */}
          {/* ========================================================= */}
          {qrSubTab === 'batches' && (
            <Card className="p-6 bg-white border-slate-200 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-cyan-600" />
                    <span>Manufactured Batches Registry</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grouped production runs. Print entire batch A4 sheets, export laser CSVs, or manage dummy stock.
                  </p>
                </div>

                <div className="text-xs font-mono text-slate-500">
                  Total Batches: <strong className="text-slate-900">{batchesList.length}</strong>
                </div>
              </div>

              {loadingBatches ? (
                <div className="space-y-2 py-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : batchesList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                  <Boxes className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No production batches found.</p>
                  <p className="text-slate-400">Manufacture your first physical batch above using the QR Fabricator.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Batch Reference</th>
                        <th className="py-2.5 px-3">Hardware Product</th>
                        <th className="py-2.5 px-3">Batch Units &amp; A4 Sheets</th>
                        <th className="py-2.5 px-3">Stock Breakdown</th>
                        <th className="py-2.5 px-3">Created / Notes</th>
                        <th className="py-2.5 px-3 text-right">Batch Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batchesList.map((batch) => {
                        const totalUnits = batch.totalCount || 0;
                        const sheetsCount = Math.ceil(totalUnits / 42) || 1;
                        const unclaimed = batch.unclaimedCount || 0;
                        const claimed = batch.claimedCount || 0;
                        const lost = batch.lostCount || 0;

                        return (
                          <tr key={batch._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="font-mono font-black text-cyan-800 text-xs flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                <span>{batch._id}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                Standard Fabricator Run
                              </span>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                batch.productType === 'sticker'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {batch.productType === 'sticker' ? 'Weatherproof Sticker' : 'Laser Keychain'}
                              </span>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="font-bold text-slate-900">
                                {totalUnits} Codes
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                ≈ {sheetsCount} {sheetsCount === 1 ? 'A4 Sheet (42/pg)' : 'A4 Sheets'}
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Dummy codes ready to print">
                                  {unclaimed} Dummy
                                </span>
                                {claimed > 0 && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Claimed by buyer">
                                    {claimed} Claimed
                                  </span>
                                )}
                                {lost > 0 && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200" title="Lost items">
                                    {lost} Lost
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3.5 px-3 text-slate-600">
                              <div className="text-[11px] text-slate-500 font-mono">
                                {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : 'Recent'}
                              </div>
                              <div className="text-xs text-slate-700 truncate max-w-[200px]" title={batch.manufactureNotes}>
                                {batch.manufactureNotes || '—'}
                              </div>
                            </td>

                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="primary"
                                  size="xs"
                                  onClick={() => handlePrintBatch(batch._id)}
                                  className="bg-cyan-600 hover:bg-cyan-700 font-bold text-xs shadow-2xs"
                                  title="Print 42-code A4 Sheets for this Batch"
                                >
                                  <Printer className="w-3 h-3 mr-1" />
                                  <span>Print Sheet</span>
                                </Button>

                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => {
                                    setSelectedBatchFilter(batch._id);
                                    setQrSubTab('tags');
                                  }}
                                  className="text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
                                  title="View individual codes in this batch"
                                >
                                  <Eye className="w-3 h-3 mr-1 text-slate-500" />
                                  <span>Codes</span>
                                </Button>

                                {unclaimed > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBatch(batch._id, unclaimed)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete batch (unclaimed dummy tags only)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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

          {/* ========================================================= */}
          {/* SUB-VIEW 2: INDIVIDUAL TAGS TABLE WITH DIRECT QR PREVIEW  */}
          {/* ========================================================= */}
          {qrSubTab === 'tags' && (
            <Card className="p-6 bg-white border-slate-200 shadow-md space-y-4">
              
              {/* Filter & Search Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-700">Filter Lifecycle:</span>
                  
                  <button
                    type="button"
                    onClick={() => setTagStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      tagStatusFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Tags
                  </button>

                  <button
                    type="button"
                    onClick={() => setTagStatusFilter('unclaimed')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      tagStatusFilter === 'unclaimed'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Dummy / Ready to Print
                  </button>

                  <button
                    type="button"
                    onClick={() => setTagStatusFilter('claimed')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      tagStatusFilter === 'claimed'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Claimed by Buyer
                  </button>

                  <button
                    type="button"
                    onClick={() => setTagStatusFilter('lost')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      tagStatusFilter === 'lost'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Emergency Lost Mode
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Batch Filter Dropdown */}
                  <select
                    value={selectedBatchFilter}
                    onChange={(e) => setSelectedBatchFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-700 font-semibold focus:outline-none focus:border-cyan-600 cursor-pointer"
                  >
                    <option value="all">All Batches</option>
                    {batchesList.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b._id} ({b.totalCount} units)
                      </option>
                    ))}
                  </select>

                  {/* Product Filter Dropdown */}
                  <select
                    value={tagTypeFilter}
                    onChange={(e) => setTagTypeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-700 font-semibold focus:outline-none focus:border-cyan-600 cursor-pointer"
                  >
                    <option value="all">All Products</option>
                    <option value="keychain">Keychains</option>
                    <option value="sticker">Stickers</option>
                  </select>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search slug, owner, item..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchTags()}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
                    />
                  </div>
                </div>
              </div>

              {/* Active Filter Notification Bar */}
              {selectedBatchFilter !== 'all' && (
                <div className="p-2.5 px-3 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between text-xs text-cyan-900 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Filtered by Batch: <strong className="font-mono">{selectedBatchFilter}</strong></span>
                  </div>
                  <button
                    onClick={() => setSelectedBatchFilter('all')}
                    className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Clear Filter</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Multi-Select Floating Bulk Actions Bar */}
              {selectedTagIds.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-fade-in border border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    <span className="text-xs font-mono font-bold tracking-wide">
                      {selectedTagIds.length} dummy tags selected
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => {
                        const selectedTags = tagsList.filter((t) => selectedTagIds.includes(t._id || t.qrSlug));
                        setSelectedBatchForPrint({ batchId: `SELECTED-${selectedTagIds.length}`, tags: selectedTags });
                        setIsPrintModalOpen(true);
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 font-bold shadow-xs text-xs"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      <span>Print Selected ({selectedTagIds.length})</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        const selectedTags = tagsList.filter((t) => selectedTagIds.includes(t._id || t.qrSlug));
                        handleExportCSV(selectedTags);
                      }}
                      className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1 text-slate-300" />
                      <span>Export CSV</span>
                    </Button>

                    <Button
                      variant="danger"
                      size="xs"
                      onClick={handleBulkDeleteTags}
                      className="bg-red-600 hover:bg-red-500 font-bold text-white shadow-xs text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Delete Selected ({selectedTagIds.length})</span>
                    </Button>

                    <button
                      onClick={() => setSelectedTagIds([])}
                      className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
                      title="Deselect All"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tags Table */}
              {loadingTags ? (
                <div className="space-y-2 py-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : tagsList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                  <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>No QR tags found matching your filter criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 w-8">
                          <input
                            type="checkbox"
                            checked={allDummySelected}
                            onChange={handleToggleSelectAll}
                            disabled={dummyTagsOnPage.length === 0}
                            title={allDummySelected ? 'Deselect All Dummy Tags' : 'Select All Dummy Tags'}
                            className="w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-0 cursor-pointer disabled:opacity-40"
                          />
                        </th>
                        <th className="py-2.5 px-3">Cryptographic Identifier (Click to View QR)</th>
                        <th className="py-2.5 px-3">Product Type</th>
                        <th className="py-2.5 px-3">Lifecycle State</th>
                        <th className="py-2.5 px-3">Bound Asset Name</th>
                        <th className="py-2.5 px-3">Registered Buyer / Owner</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tagsList.map((tag) => {
                        const isDummy = tag.status === 'unclaimed';
                        const isSelected = selectedTagIds.includes(tag._id || tag.qrSlug);

                        return (
                          <tr 
                            key={tag._id || tag.qrSlug} 
                            className={`transition-colors ${isSelected ? 'bg-cyan-50/50' : 'hover:bg-slate-50/80'}`}
                          >
                            <td className="py-3 px-3 w-8">
                              {isDummy ? (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectTag(tag._id || tag.qrSlug)}
                                  className="w-4 h-4 rounded text-cyan-600 border-slate-300 focus:ring-0 cursor-pointer"
                                />
                              ) : (
                                <span className="w-4 h-4 block text-slate-300 text-center select-none" title="Claimed buyer tags cannot be deleted">•</span>
                              )}
                            </td>

                            <td className="py-3 px-3">
                              {/* Clickable Code that directly displays QR Modal */}
                              <button
                                type="button"
                                onClick={() => setInspectTag(tag)}
                                className="font-mono font-black text-cyan-700 hover:text-cyan-900 hover:underline flex items-center gap-1.5 cursor-pointer text-left group"
                                title="Click to view QR code"
                              >
                                <Eye className="w-3.5 h-3.5 text-cyan-500 group-hover:text-cyan-700 transition-colors" />
                                <span>{tag.qrSlug}</span>
                              </button>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {tag.batchId || 'Factory Standard'}
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                tag.productType === 'sticker'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {tag.productType === 'sticker' ? 'Sticker Pack' : 'Metal Keychain'}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              {tag.isLost ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                                  ● LOST MODE ACTIVE
                                </span>
                              ) : tag.status === 'claimed' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  ✓ CLAIMED &amp; BOUND
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  ○ DUMMY (WAITING BUYER)
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 font-semibold text-slate-900">
                              {tag.itemName || '—'}
                            </td>

                            <td className="py-3 px-3 text-slate-600">
                              {tag.ownerId?.email ? (
                                <div>
                                  <span className="font-medium text-slate-900">{tag.ownerId.name || 'Owner'}</span>
                                  <span className="text-[11px] text-slate-500 block">{tag.ownerId.email}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Unassigned (Retail)</span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Dedicated Clickable View QR Button */}
                                <button
                                  type="button"
                                  onClick={() => setInspectTag(tag)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-bold text-[11px] transition-colors cursor-pointer"
                                  title="View high-resolution QR"
                                >
                                  <QrCode className="w-3 h-3 text-cyan-600" />
                                  <span>View QR</span>
                                </button>

                                <a
                                  href={`/q/${tag.qrSlug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-slate-600 hover:text-cyan-700 font-semibold text-[11px]"
                                  title="Open public scan resolution test"
                                >
                                  <span>Test Scan</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>

                                {isDummy && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSingleTag(tag._id || tag.qrSlug, tag.qrSlug)}
                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Delete dummy tag"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ORDERS & DISPATCH PIPELINE */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <Card className="p-6 bg-white border-slate-200 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Fulfillment & Shipping Pipeline</h2>
              <p className="text-xs text-slate-500">Manage buyer hardware orders, update delivery tracking, and advance pipeline status.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-700 font-semibold focus:outline-none focus:border-cyan-600 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search buyer, order, city..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
                />
              </div>
            </div>
          </div>

          {loadingOrders ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>No orders found matching your filter criteria.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-cyan-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Order Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {order._id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {order.paymentMethod || 'COD'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      <strong>{order.buyerId?.name || 'Customer'}</strong> ({order.buyerId?.email || order.shippingAddress?.phone || 'No email'})
                      {order.shippingAddress?.city && ` · ${order.shippingAddress.city}`}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {order.items?.map((it, idx) => (
                        <span key={idx} className="mr-2">
                          {it.quantity}x {it.productId?.title || 'Findix Tag'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Pipeline Status Controls */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Total</div>
                      <div className="text-sm font-black font-mono text-cyan-700">
                        PKR {Number(order.totalAmount || 0).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={order.pipelineStatus || 'Pending'}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          order.pipelineStatus === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : order.pipelineStatus === 'Shipped'
                            ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
                            : order.pipelineStatus === 'Processing'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-white text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: HARDWARE STORE CATALOG (STRICTLY 2 PRODUCTS) */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Official Hardware Offerings</span>
                <span className="text-xs font-mono text-cyan-700 px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-200">
                  Strictly 2 Products
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage price, stock levels, and specs for the Laser Metal Keychain and Weatherproof Sticker Pack.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="font-bold shadow-md bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span>Add / Reset Product</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {products.map((prod) => (
              <Card
                key={prod._id}
                className="p-5 bg-white border-slate-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 p-1 shrink-0 overflow-hidden">
                    <img
                      src={prod.images?.[0]?.url || prod.image || 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=300&auto=format&fit=crop&q=80'}
                      alt={prod.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase">
                        {prod.category === 'keychain' ? 'Laser Keychain' : 'Sticker Pack'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate" title={prod.title}>
                      {prod.title}
                    </h4>
                    <span className="text-sm font-mono font-black text-cyan-700 block">
                      PKR {prod.price?.toLocaleString()}
                    </span>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Current Factory Stock: <b>{prod.stock ?? 0} units</b>
                    </div>
                  </div>
                </div>

                {prod.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    ACTIVE IN STORE
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
                      <span>Edit Hardware</span>
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
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: USER DIRECTORY & SECURITY RBAC */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <Card className="p-6 bg-white border-slate-200 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Directory & Privilege Controller</h2>
              <p className="text-xs text-slate-500">Audit registered account records, manage roles, and enforce security policies.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
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
                    <th className="py-3 px-3">Identity Record</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Clearance Role</th>
                    <th className="py-3 px-3">Registration Date</th>
                    <th className="py-3 px-3 text-right">Security Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isSelf = user && (user.id === u._id || user._id === u._id);
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-cyan-100 border border-cyan-200 flex items-center justify-center font-bold text-cyan-800 text-xs shrink-0">
                              {u.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{u.name || 'Anonymous User'}</span>
                                {isSelf && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300 font-mono font-bold">
                                    CURRENT SESSION
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
                              ? 'bg-cyan-50 text-cyan-800 border-cyan-300'
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
                                  title="Delete Account"
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

      </div> {/* Close Screen UI Container (print:hidden) */}

      {/* ========================================================= */}
      {/* MODALS */}
      {/* ========================================================= */}

      {/* 1. Add / Edit Product Modal */}
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

      {/* 2. Factory QR Print Sheet Modal */}
      <AdminPrintSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        tags={selectedBatchForPrint?.tags || tagsList}
        batchInfo={selectedBatchForPrint}
      />

      {/* 3. Single QR Inspection & Direct Preview Modal */}
      <SingleQRModal
        isOpen={Boolean(inspectTag)}
        onClose={() => setInspectTag(null)}
        tag={inspectTag}
      />

    </div>
  );
};

export default AdminPage;
