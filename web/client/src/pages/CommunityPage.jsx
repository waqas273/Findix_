import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Globe,
  Search,
  ShieldCheck,
  MessageSquare,
  RefreshCw,
  Image as ImageIcon,
  Send,
  X,
  Lock,
  Radio,
  CheckCircle,
  QrCode,
  Compass,
  ChevronDown,
  AlertTriangle,
  Sparkles,
  Zap,
  Filter,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { PostCard } from '../components/community/PostCard';
import { Button } from '../components/ui/Button';

export const CommunityPage = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const userCity = user?.city || 'Islamabad';
  const [scope, setScope] = useState('city');
  const [selectedCity, setSelectedCity] = useState(userCity);
  const [selectedTag, setSelectedTag] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [composerText, setComposerText] = useState('');
  const [composerTag, setComposerTag] = useState('Lost Alert');
  const [composerScope, setComposerScope] = useState('city');
  const [composerImage, setComposerImage] = useState(null);
  const [composerImagePreview, setComposerImagePreview] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const pakCities = ['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar', 'Faisalabad', 'Multan', 'Quetta'];

  const filterTabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'Lost Alert', label: 'Lost', icon: AlertTriangle },
    { id: 'Found Alert', label: 'Found', icon: Sparkles },
    { id: 'General Discussion', label: 'Discuss', icon: MessageSquare },
  ];

  const fetchPosts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('scope', scope);
      if (scope === 'city') queryParams.append('city', selectedCity);
      if (selectedTag !== 'all') queryParams.append('tag', selectedTag);
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

      const res = await fetch(`/api/community?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const postsList = json.data?.posts || (Array.isArray(json.data) ? json.data : []);
        setPosts(postsList);
      } else {
        setPosts([]);
      }
    } catch (e) {
      setPosts([]);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [scope, selectedCity, selectedTag, searchQuery]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const requireAuth = async (actionDesc = 'broadcast a community alert') => {
    const shouldSignIn = await confirm({
      title: 'Sign In Required',
      message: `You need an active Findix account to ${actionDesc}.`,
      confirmText: 'Sign In Now',
      cancelText: 'Cancel',
      variant: 'primary',
      iconType: 'lock',
    });
    if (shouldSignIn) navigate('/login');
    return false;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { addToast('error', 'Image exceeds 5MB limit'); return; }
      setComposerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setComposerImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !token) return requireAuth('broadcast an alert');
    if (!composerText.trim()) { addToast('error', 'Please write a description'); return; }

    const isConfirmed = await confirm({
      title: 'Publish Community Broadcast?',
      message: `Broadcast this ${composerTag} to ${composerScope === 'city' ? selectedCity : 'All Pakistan'}?`,
      confirmText: 'Broadcast Now',
      cancelText: 'Cancel',
      variant: composerTag === 'Lost Alert' ? 'danger' : 'primary',
      iconType: composerTag === 'Lost Alert' ? 'warning' : 'shield',
    });
    if (!isConfirmed) return;

    setIsPublishing(true);
    try {
      let uploadedMedia = { url: '', public_id: '' };
      if (composerImage) {
        const uploadData = new FormData();
        uploadData.append('image', composerImage);
        uploadData.append('folder', 'findix/community');
        try {
          const upRes = await fetch('/api/upload/image', {
            method: 'POST',
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: uploadData,
          });
          if (upRes.ok) {
            const upJson = await upRes.json();
            if (upJson.data?.url) uploadedMedia = { url: upJson.data.url, public_id: upJson.data.public_id || '' };
          }
        } catch {
          uploadedMedia = { url: composerImagePreview, public_id: 'local_preview' };
        }
      }

      const res = await fetch('/api/community/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: composerText.trim(), scope: composerScope, city: selectedCity, tag: composerTag, media: uploadedMedia.url ? uploadedMedia : undefined }),
      });

      const data = await res.json();
      const newPost = res.ok && data.success ? data.data : {
        _id: `post_${Date.now()}`, authorId: { _id: user?._id, name: user?.name || 'You', city: selectedCity, avatar: user?.avatar || { url: '' }, role: user?.role || 'buyer' },
        scope: composerScope, city: selectedCity, tag: composerTag, content: composerText.trim(),
        media: uploadedMedia.url ? uploadedMedia : (composerImagePreview ? { url: composerImagePreview } : undefined),
        likesCount: 0, commentsCount: 0, comments: [], createdAt: new Date(),
      };

      setPosts((prev) => [newPost, ...prev]);
      setComposerText(''); setComposerImage(null); setComposerImagePreview(''); setShowComposer(false);
      addToast('success', 'Broadcast published!');
    } catch (err) {
      addToast('error', 'Error publishing broadcast');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePostDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  const handleCommentAdded = (postId, newComment) => {
    setPosts((prev) => prev.map((p) => {
      if (p._id !== postId) return p;
      const updated = [...(p.comments || []), newComment];
      return { ...p, comments: updated, commentsCount: updated.length };
    }));
  };

  const handleCommentDeleted = (postId, commentId) => {
    setPosts((prev) => prev.map((p) => {
      if (p._id !== postId) return p;
      const updated = (p.comments || []).filter((c) => String(c._id) !== String(commentId) && String(c.parentId) !== String(commentId));
      return { ...p, comments: updated, commentsCount: updated.length };
    }));
  };

  return (
    <div className="min-h-screen bg-obsidian-950 font-sans">
      {/* ── PAGE HEADER ── */}
      <div className="border-b border-slate-800/60 bg-obsidian-950/95 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Community Hub</h1>
              <p className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">
                {scope === 'city' ? `${selectedCity} Hub` : 'All Pakistan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchPosts(); addToast('info', 'Feed refreshed'); }}
              className="p-2 rounded-lg bg-obsidian-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 cursor-pointer transition-colors"
              title="Refresh feed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => setShowComposer((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neon-cyan text-obsidian-950 text-xs font-bold hover:bg-neon-cyan/90 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Broadcast</span>
              </button>
            ) : (
              <button
                onClick={() => requireAuth('broadcast')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-obsidian-900 border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-neon-cyan" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* ── FILTER BAR ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 space-y-2.5">
          {/* Scope + Search Row */}
          <div className="flex items-center gap-2">
            {/* Scope toggle */}
            <div className="flex items-center gap-0.5 bg-obsidian-900 border border-slate-800 rounded-lg p-0.5 shrink-0">
              <button
                onClick={() => setScope('city')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${scope === 'city' ? 'bg-neon-cyan text-obsidian-950' : 'text-slate-400 hover:text-white'}`}
              >
                <MapPin className="w-3 h-3" />
                <span className="hidden sm:inline">{selectedCity}</span>
                <span className="sm:hidden">City</span>
              </button>
              <button
                onClick={() => setScope('global')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${scope === 'global' ? 'bg-neon-cyan text-obsidian-950' : 'text-slate-400 hover:text-white'}`}
              >
                <Globe className="w-3 h-3" />
                <span>Pakistan</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search broadcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-obsidian-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan/60"
              />
            </div>

            {/* City dropdown (visible when city scope active) */}
            {scope === 'city' && (
              <div className="relative shrink-0">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="appearance-none bg-obsidian-900 border border-slate-800 text-[11px] text-slate-300 rounded-lg pl-2.5 pr-6 py-1.5 focus:outline-none focus:border-neon-cyan/60 cursor-pointer"
                >
                  {pakCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            {filterTabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTag(t.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer shrink-0 transition-colors ${selectedTag === t.id
                    ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40'
                    : 'bg-obsidian-900 border border-slate-800 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── COMPOSER PANEL (slide-in below header) ── */}
      {showComposer && isAuthenticated && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="rounded-xl border border-neon-cyan/30 bg-obsidian-900 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-obsidian-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {user?.avatar?.url
                    ? <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[10px] font-bold text-neon-cyan">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  }
                </div>
                <span className="text-xs font-semibold text-white">{user?.name || 'You'}</span>
              </div>
              <button
                onClick={() => { setShowComposer(false); setComposerText(''); setComposerImage(null); setComposerImagePreview(''); }}
                className="p-1 rounded-lg text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-3">
              <textarea
                rows={3}
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="Broadcast a lost item alert, finder sighting, or community note..."
                className="w-full bg-obsidian-800/60 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan/50 resize-none"
                autoFocus
              />

              {composerImagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 w-fit">
                  <img src={composerImagePreview} alt="Preview" className="h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setComposerImage(null); setComposerImagePreview(''); }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-obsidian-950/80 text-white hover:text-neon-rose cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/50">
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="p-1.5 rounded-lg bg-obsidian-800 border border-slate-700 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40 cursor-pointer transition-colors" title="Attach Photo">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                  </label>

                  <select
                    value={composerTag}
                    onChange={(e) => setComposerTag(e.target.value)}
                    className="bg-obsidian-800 border border-slate-700 text-[11px] text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
                  >
                    <option value="Lost Alert">🚨 Lost Alert</option>
                    <option value="Found Alert">✨ Found Alert</option>
                    <option value="General Discussion">💬 Discussion</option>
                  </select>

                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-obsidian-800 border border-slate-700 text-[11px] text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neon-cyan/50 cursor-pointer"
                  >
                    {pakCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!composerText.trim() || isPublishing}
                  className="px-4 py-1.5 rounded-lg bg-neon-cyan text-obsidian-950 text-xs font-bold hover:bg-neon-cyan/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPublishing ? 'Publishing...' : 'Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* ── LEFT / MAIN FEED (full width on mobile, 2/3 on desktop) ── */}
          <div className="lg:col-span-2 space-y-3">

            {/* Guest prompt to join */}
            {!isAuthenticated && (
              <div className="rounded-xl border border-slate-800 bg-obsidian-900 p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-neon-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white">Join the Recovery Network</p>
                  <p className="text-[11px] text-slate-400">Sign in to broadcast, reply & like community posts.</p>
                </div>
                <button
                  onClick={() => requireAuth('join')}
                  className="px-3 py-1.5 rounded-lg bg-neon-cyan text-obsidian-950 text-[11px] font-bold shrink-0 cursor-pointer hover:bg-neon-cyan/90"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* Feed */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-slate-800 bg-obsidian-900 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-obsidian-800 animate-pulse" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-28 bg-obsidian-800 rounded animate-pulse" />
                        <div className="h-2.5 w-20 bg-obsidian-800 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3 w-full bg-obsidian-800 rounded animate-pulse" />
                      <div className="h-3 w-4/5 bg-obsidian-800 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-obsidian-900 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-obsidian-800 border border-slate-700 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">No Broadcasts Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    No posts found for {scope === 'city' ? selectedCity : 'All Pakistan'} under this filter.
                  </p>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowComposer(true)}
                    className="px-4 py-1.5 rounded-lg bg-neon-cyan text-obsidian-950 text-xs font-bold cursor-pointer hover:bg-neon-cyan/90 mx-auto inline-block"
                  >
                    Be the first to broadcast
                  </button>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  onPostDeleted={handlePostDeleted}
                  onCommentAdded={handleCommentAdded}
                  onCommentDeleted={handleCommentDeleted}
                />
              ))
            )}
          </div>

          {/* ── RIGHT SIDEBAR (hidden on mobile unless you scroll, shown below feed on sm/md) ── */}
          <div className="space-y-4 lg:sticky lg:top-[140px]">

            {/* City Hubs */}
            <div className="rounded-xl border border-slate-800 bg-obsidian-900 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                <Compass className="w-3.5 h-3.5 text-neon-cyan" />
                <h3 className="text-xs font-bold text-white">City Hubs</h3>
              </div>
              <div className="p-3 flex flex-wrap gap-1.5">
                {pakCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => { setSelectedCity(city); setScope('city'); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono cursor-pointer transition-colors ${selectedCity === city && scope === 'city'
                      ? 'bg-neon-cyan text-obsidian-950 font-bold'
                      : 'bg-obsidian-800 border border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Recovery Protocols */}
            <div className="rounded-xl border border-slate-800 bg-obsidian-900 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="text-xs font-bold text-white">Safety Protocols</h3>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { icon: CheckCircle, color: 'text-neon-cyan', title: 'Zero-Leak Privacy', desc: 'Phone numbers are never shared publicly.' },
                  { icon: CheckCircle, color: 'text-emerald-400', title: 'Safe Handovers', desc: 'Coordinate meetups only in public places.' },
                  { icon: CheckCircle, color: 'text-blue-400', title: 'Verify QR Tags', desc: 'Check the alphanumeric slug before rewards.' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} className="flex items-start gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${color} shrink-0 mt-0.5`} />
                    <div>
                      <p className="text-[11px] font-semibold text-white">{title}</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Tags shortcut */}
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-xl border border-slate-800 bg-obsidian-900 p-4 hover:border-slate-700 group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center shrink-0">
                <QrCode className="w-4 h-4 text-neon-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">Protected Tags</p>
                <p className="text-[10px] text-slate-500">Manage your registered items</p>
              </div>
              <Zap className="w-3.5 h-3.5 text-slate-600 group-hover:text-neon-cyan transition-colors" />
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};
