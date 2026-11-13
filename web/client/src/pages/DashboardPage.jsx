import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  QrCode, 
  ShieldCheck, 
  Search, 
  Settings, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  ArrowRight,
  MessageSquare,
  ShoppingBag,
  Clock,
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
  Check
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { EditTagModal } from '../components/dashboard/EditTagModal';
import { ActivateTagModal } from '../components/dashboard/ActivateTagModal';
import api from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast, addToast } = useToast();
  const { confirm } = useConfirm();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'safe' | 'lost'
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Modal states
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/items');
      setItems(res.data?.data?.items || (Array.isArray(res.data?.data) ? res.data.data : []));
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Status Toggle (Safe <-> Lost) with Custom Alert
  const toggleLostStatus = async (item) => {
    const nextLostState = !item.isLost;

    const isConfirmed = await confirm({
      title: nextLostState ? 'Activate Lost Item Alert' : 'Mark Tag as Safe',
      message: nextLostState
        ? `Mark '${item.itemName || item.qrSlug}' as LOST? This will activate a high-priority public recovery broadcast on the QR portal with your finder instructions.`
        : `Return '${item.itemName || item.qrSlug}' to normal SAFE status?`,
      confirmText: nextLostState ? 'Activate Lost Alert' : 'Mark as Safe',
      cancelText: 'Cancel',
      variant: nextLostState ? 'danger' : 'primary',
      iconType: nextLostState ? 'warning' : 'shield',
    });

    if (!isConfirmed) return;

    const oldItems = [...items];

    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) =>
        i._id === item._id ? { ...i, isLost: nextLostState } : i
      )
    );

    if (showToast) {
      showToast({
        title: nextLostState ? 'Item Marked as LOST' : 'Item Marked as SAFE',
        message: nextLostState
          ? `Recovery broadcast activated for '${item.itemName || item.qrSlug}'.`
          : `'${item.itemName || item.qrSlug}' returned to safe status.`,
        type: nextLostState ? 'error' : 'success',
      });
    }

    try {
      await api.patch(`/items/${item._id}/details`, {
        isLost: nextLostState,
      });
    } catch (err) {
      setItems(oldItems);
      if (addToast) addToast('error', 'Unable to update tag status');
    }
  };

  const handleCopyScanUrl = (slug) => {
    const url = `${window.location.origin}/q/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    if (addToast) addToast('info', `Finder link copied: /q/${slug}`);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Filter items based on status and search query
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      (item.itemName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.qrSlug || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'safe') return matchesSearch && !item.isLost;
    if (statusFilter === 'lost') return matchesSearch && item.isLost;
    return matchesSearch;
  });

  const safeCount = items.filter((i) => !i.isLost).length;
  const lostCount = items.filter((i) => i.isLost).length;

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* 1. EXECUTIVE WELCOME BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 border border-white/[0.08] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-neon-cyan/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-neon-teal/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan text-xs font-mono font-semibold border border-neon-cyan/30 shadow-neon-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED OWNER WORKSPACE
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-neon-cyan">{user?.name || 'Owner'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Your personal command center for monitoring recovery tags, laser-etched hardware, and encrypted finder chats.
            </p>
          </div>

          {/* Top Primary Action */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsActivateModalOpen(true)}
              className="font-bold shadow-neon-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register / Claim Tag</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={fetchItems}
              disabled={loading}
              className="text-slate-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. COMMAND SHORTCUTS SUITE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Shortcut 1: Store */}
        <Link to="/store" className="group block">
          <Card className="p-4 sm:p-5 bg-obsidian-900/80 hover:bg-obsidian-850 border-slate-800 hover:border-neon-cyan/40 transition-all duration-300 h-full flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-neon-cyan group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">Hardware Store</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Order titanium keychains & decals</p>
            </div>
          </Card>
        </Link>

        {/* Shortcut 2: Orders */}
        <Link to="/dashboard/orders" className="group block">
          <Card className="p-4 sm:p-5 bg-obsidian-900/80 hover:bg-obsidian-850 border-slate-800 hover:border-neon-teal/40 transition-all duration-300 h-full flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-neon-teal/10 border border-neon-teal/30 flex items-center justify-center text-neon-teal group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-neon-teal group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-neon-teal transition-colors">Orders & Tracking</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Track fabrication & delivery</p>
            </div>
          </Card>
        </Link>

        {/* Shortcut 3: Messages */}
        <Link to="/dashboard/messages" className="group block">
          <Card className="p-4 sm:p-5 bg-obsidian-900/80 hover:bg-obsidian-850 border-slate-800 hover:border-emerald-400/40 transition-all duration-300 h-full flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Finder Messages</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">End-to-end encrypted chat</p>
            </div>
          </Card>
        </Link>

        {/* Shortcut 4: Scanner */}
        <Link to="/scan" className="group block">
          <Card className="p-4 sm:p-5 bg-obsidian-900/80 hover:bg-obsidian-850 border-slate-800 hover:border-purple-400/40 transition-all duration-300 h-full flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Scan QR Code</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Resolve tag or camera scanner</p>
            </div>
          </Card>
        </Link>

      </div>

      {/* 3. LIVE METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-obsidian-950/80 border-slate-800 space-y-1">
          <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider block">Protected Assets</span>
          <div className="text-2xl sm:text-3xl font-display font-black text-white">{items.length}</div>
          <span className="text-[10px] text-slate-500 block">Registered hardware tags</span>
        </Card>

        <Card className="p-4 sm:p-5 bg-obsidian-950/80 border-slate-800 space-y-1">
          <span className="text-[10px] sm:text-xs font-mono text-emerald-400 uppercase tracking-wider block">Safe & Active</span>
          <div className="text-2xl sm:text-3xl font-display font-black text-emerald-400">{safeCount}</div>
          <span className="text-[10px] text-slate-500 block">Normal protection active</span>
        </Card>

        <Card className="p-4 sm:p-5 bg-obsidian-950/80 border-slate-800 space-y-1">
          <span className="text-[10px] sm:text-xs font-mono text-neon-rose uppercase tracking-wider block">Lost Broadcasts</span>
          <div className="text-2xl sm:text-3xl font-display font-black text-neon-rose">{lostCount}</div>
          <span className="text-[10px] text-slate-500 block">Active recovery banners</span>
        </Card>

        <Card className="p-4 sm:p-5 bg-obsidian-950/80 border-slate-800 space-y-1">
          <span className="text-[10px] sm:text-xs font-mono text-neon-cyan uppercase tracking-wider block">Relay Cryptography</span>
          <div className="text-2xl sm:text-3xl font-display font-black text-neon-cyan">256-bit</div>
          <span className="text-[10px] text-slate-500 block">Zero personal data leaks</span>
        </Card>
      </div>

      {/* 4. PROTECTED ASSETS STUDIO */}
      <div className="space-y-4">
        
        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-obsidian-900/90 border border-slate-800 backdrop-blur-xl">
          
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: `All Tags (${items.length})` },
              { id: 'safe', label: `🟢 Safe (${safeCount})` },
              { id: 'lost', label: `🔴 Lost Alerts (${lostCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 shadow-neon-sm font-bold'
                    : 'bg-obsidian-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-obsidian-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-colors"
            />
          </div>

        </div>

        {/* Tag Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 rounded-3xl bg-obsidian-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 space-y-4 rounded-3xl bg-obsidian-900/40 border border-slate-800/80 backdrop-blur-md">
            <div className="w-16 h-16 rounded-2xl bg-obsidian-950 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto shadow-inner">
              <QrCode className="w-8 h-8 text-neon-cyan" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Protected Tags Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {items.length === 0
                  ? 'You have not claimed any hardware tags yet. Register your first physical tag or order tags from the store.'
                  : 'No tags match your search or filter selection.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button variant="primary" size="md" onClick={() => setIsActivateModalOpen(true)}>
                <Plus className="w-4 h-4" />
                <span>Register Hardware Tag</span>
              </Button>
              <Link to="/store">
                <Button variant="outline" size="md">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Hardware Store</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredItems.map((item) => {
              const isLost = Boolean(item.isLost);
              return (
                <Card
                  key={item._id}
                  className={`p-5 space-y-4 border transition-all duration-300 backdrop-blur-xl ${
                    isLost
                      ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
                      : 'bg-obsidian-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  
                  {/* Card Header: Icon + Name + Slug */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl p-0.5 border flex items-center justify-center shrink-0 ${
                        isLost ? 'border-rose-500/40 bg-rose-500/10' : 'border-neon-cyan/30 bg-neon-cyan/10'
                      }`}>
                        {item.itemImage?.url ? (
                          <img src={item.itemImage.url} alt="" className="w-full h-full object-cover rounded-[14px]" />
                        ) : (
                          <QrCode className={`w-5 h-5 ${isLost ? 'text-neon-rose' : 'text-neon-cyan'}`} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[150px]">
                          {item.itemName || 'Protected Item'}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-400 block truncate">
                          {item.qrSlug}
                        </span>
                      </div>
                    </div>

                    <Badge variant={isLost ? 'danger' : 'emerald'} size="xs">
                      {isLost ? 'LOST ALERT' : 'SAFE'}
                    </Badge>
                  </div>

                  {/* Return Bounty / Reward Note */}
                  {item.returnRewardNote && (
                    <div className="p-2.5 rounded-xl bg-obsidian-900/90 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{item.returnRewardNote}</span>
                    </div>
                  )}

                  {/* 1-Click Status Switch */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Recovery Status:</span>
                    <button
                      type="button"
                      onClick={() => toggleLostStatus(item)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isLost
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-neon-rose hover:bg-rose-500/30 border border-rose-500/40'
                      }`}
                    >
                      {isLost ? 'Mark as SAFE' : 'Mark as LOST'}
                    </button>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    
                    {/* Copy Link Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyScanUrl(item.qrSlug)}
                      className="p-2 rounded-xl bg-obsidian-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy Public Finder Link"
                    >
                      {copiedSlug === item.qrSlug ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{copiedSlug === item.qrSlug ? 'Copied' : 'Link'}</span>
                    </button>

                    {/* Preview Portal */}
                    <Link
                      to={`/q/${item.qrSlug}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-obsidian-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                      title="Preview Public Scan Portal"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Preview</span>
                    </Link>

                    {/* Edit Settings */}
                    <button
                      type="button"
                      onClick={() => setSelectedItemForEdit(item)}
                      className="p-2 rounded-xl bg-obsidian-900 hover:bg-neon-cyan/10 border border-slate-800 hover:border-neon-cyan/30 text-[11px] font-semibold text-slate-300 hover:text-neon-cyan flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Configure Tag Settings"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </button>

                  </div>

                </Card>
              );
            })}
          </div>
        )}

      </div>

      {/* Activate Tag Modal */}
      <ActivateTagModal
        isOpen={isActivateModalOpen}
        onClose={() => setIsActivateModalOpen(false)}
        onTagActivated={(newTag) => {
          setItems((prev) => [newTag, ...prev]);
          setIsActivateModalOpen(false);
        }}
      />

      {/* Edit Tag Modal */}
      {selectedItemForEdit && (
        <EditTagModal
          isOpen={Boolean(selectedItemForEdit)}
          onClose={() => setSelectedItemForEdit(null)}
          item={selectedItemForEdit}
          onItemUpdated={(updated) => {
            setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
            setSelectedItemForEdit(null);
          }}
        />
      )}

    </div>
  );
};
