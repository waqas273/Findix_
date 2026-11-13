import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Share2,
  MapPin,
  AlertTriangle,
  Maximize2,
  Sparkles,
  Check,
  Send,
  Lock,
  CornerDownRight,
  Reply,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmDialogContext';

// ── Tag Badge helper ──────────────────────────────────────────────
const TagBadge = ({ tag }) => {
  if (tag === 'Lost Alert') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/25">
      <AlertTriangle className="w-2.5 h-2.5" /> Lost
    </span>
  );
  if (tag === 'Found Alert') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
      <Sparkles className="w-2.5 h-2.5" /> Found
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] text-slate-400 bg-obsidian-800 border border-slate-700">
      Discuss
    </span>
  );
};

// ── Time formatter ────────────────────────────────────────────────
const formatTime = (dateString) => {
  if (!dateString) return 'now';
  try {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'now';
    const m = Math.floor(diff / 60); if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  } catch { return 'now'; }
};

// ── Avatar helper ─────────────────────────────────────────────────
const Avatar = ({ src, name, size = 'md' }) => {
  const cls = size === 'sm'
    ? 'w-6 h-6 text-[9px]'
    : size === 'xs'
      ? 'w-5 h-5 text-[8px]'
      : 'w-9 h-9 text-xs';

  return (
    <div className={`${cls} rounded-full bg-obsidian-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden`}>
      {src
        ? <img src={src} alt={name || ''} className="w-full h-full object-cover" />
        : <span className="font-bold text-neon-cyan">{name?.[0]?.toUpperCase() || 'U'}</span>
      }
    </div>
  );
};

// ── Main PostCard ─────────────────────────────────────────────────
export const PostCard = ({ post, onPostDeleted, onCommentAdded, onCommentDeleted }) => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [likesCount, setLikesCount] = useState(post.likesCount || post.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    Array.isArray(post.likes) && user?._id
      ? post.likes.some((uid) => String(uid) === String(user._id) || String(uid?._id) === String(user._id))
      : false
  );
  const [isLiking, setIsLiking] = useState(false);
  const [isMediaZoomed, setIsMediaZoomed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const [showThread, setShowThread] = useState(false);
  const [localComments, setLocalComments] = useState(post.comments || []);
  const [replyContent, setReplyContent] = useState('');
  const [activeReplyTo, setActiveReplyTo] = useState(null);
  const [isSendingReply, setIsSendingReply] = useState(false);

  const authorId   = post.authorId?._id || post.authorId || post.author?._id;
  const authorName = post.authorId?.name || post.author?.name || 'Findix Member';
  const authorAvt  = post.authorId?.avatar?.url || post.author?.avatar?.url;
  const authorRole = post.authorId?.role || post.author?.role || 'buyer';
  const postCity   = post.city || post.authorId?.city || 'Pakistan';
  const mediaUrl   = post.media?.url || (typeof post.media === 'string' ? post.media : null);
  const postTag    = post.tag || (post.isLost ? 'Lost Alert' : 'General Discussion');

  const canDeletePost = Boolean(isAuthenticated && user?._id && (String(user._id) === String(authorId) || user.role === 'admin'));

  const requireAuth = async (action = 'engage') => {
    const ok = await confirm({
      title: 'Sign In Required',
      message: `You need a Findix account to ${action}.`,
      confirmText: 'Sign In Now',
      cancelText: 'Cancel',
      variant: 'primary',
      iconType: 'lock',
    });
    if (ok) navigate('/login');
    return false;
  };

  // ── Like post ─────────────────────────────────────────────────
  const handleToggleLike = async () => {
    if (!isAuthenticated) return requireAuth('like this broadcast');
    if (isLiking) return;
    setIsLiking(true);
    const prev = isLiked, prevC = likesCount;
    setIsLiked(!prev);
    setLikesCount(prev ? Math.max(0, prevC - 1) : prevC + 1);
    try {
      const res = await fetch(`/api/community/post/${post._id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        if (d.data) { setIsLiked(d.data.isLiked); setLikesCount(d.data.likesCount); }
      }
    } catch {} finally { setIsLiking(false); }
  };

  // ── Delete post ───────────────────────────────────────────────
  const handleDeletePost = async () => {
    const ok = await confirm({
      title: 'Delete Broadcast?',
      message: 'This broadcast and all its replies will be permanently deleted.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      iconType: 'trash',
    });
    if (!ok) return;
    setIsDeletingPost(true);
    try {
      const res = await fetch(`/api/community/post/${post._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { addToast('success', 'Broadcast deleted'); onPostDeleted?.(post._id); }
      else addToast('error', 'Failed to delete post');
    } catch { addToast('error', 'Error deleting post'); }
    finally { setIsDeletingPost(false); }
  };

  // ── Like comment ──────────────────────────────────────────────
  const handleToggleLikeComment = async (commentId, currentLikes = []) => {
    if (!isAuthenticated) return requireAuth('like this reply');
    const isCurrentlyLiked = currentLikes.some((uid) => String(uid) === String(user._id) || String(uid?._id) === String(user._id));
    setLocalComments((prev) => prev.map((c) => {
      if (c._id !== commentId) return c;
      const updated = isCurrentlyLiked
        ? (c.likes || []).filter((uid) => String(uid) !== String(user._id) && String(uid?._id) !== String(user._id))
        : [...(c.likes || []), user._id];
      return { ...c, likes: updated };
    }));
    try {
      await fetch(`/api/community/post/${post._id}/comment/${commentId}/like`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  };

  // ── Delete comment ────────────────────────────────────────────
  const handleDeleteComment = async (commentId) => {
    const ok = await confirm({
      title: 'Delete Reply?',
      message: 'This reply and its sub-replies will be permanently deleted.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      iconType: 'trash',
    });
    if (!ok) return;
    setLocalComments((prev) => prev.filter((c) => String(c._id) !== String(commentId) && String(c.parentId) !== String(commentId)));
    try {
      const res = await fetch(`/api/community/post/${post._id}/comment/${commentId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { addToast('success', 'Reply deleted'); onCommentDeleted?.(post._id, commentId); }
      else addToast('error', 'Failed to delete reply');
    } catch { addToast('error', 'Error deleting reply'); }
  };

  // ── Send reply ────────────────────────────────────────────────
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return requireAuth('post a reply');
    if (!replyContent.trim() || isSendingReply) return;
    setIsSendingReply(true);

    const parentId   = activeReplyTo?.commentId || null;
    const replyToUser = activeReplyTo?.authorName || '';

    const temp = {
      _id: `c_${Date.now()}`, parentId, replyToUser,
      authorId: user?._id, authorName: user?.name || 'You',
      authorCity: user?.city || 'Pakistan', authorAvatar: user?.avatar?.url || '',
      content: replyContent.trim(), likes: [], createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/community/post/${post._id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: replyContent.trim(), parentId, replyToUser }),
      });
      const json = await res.json();
      const saved = (res.ok && json.success) ? (json.data?.comment || json.data || temp) : temp;
      setLocalComments((prev) => [...prev, saved]);
      onCommentAdded?.(post._id, saved);
      addToast('success', 'Reply posted!');
    } catch {
      setLocalComments((prev) => [...prev, temp]);
      onCommentAdded?.(post._id, temp);
      addToast('success', 'Reply posted');
    } finally {
      setReplyContent('');
      setActiveReplyTo(null);
      setIsSendingReply(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/community#${post._id}`);
    setIsCopied(true);
    addToast('info', 'Link copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ── Build recursive comment tree ──────────────────────────────
  const buildTree = (comments) => {
    const map = {};
    const roots = [];
    comments.forEach((c) => { map[c._id] = { ...c, children: [] }; });
    comments.forEach((c) => {
      if (c.parentId && map[c.parentId]) map[c.parentId].children.push(map[c._id]);
      else roots.push(map[c._id]);
    });
    return roots;
  };

  const commentTree  = buildTree(localComments);
  const totalReplies = localComments.length || post.commentsCount || 0;

  // ── Render single comment node (recursive) ────────────────────
  const CommentNode = ({ comment, depth = 0 }) => {
    const cAuthorId  = comment.authorId?._id || comment.authorId;
    const canDelete  = Boolean(isAuthenticated && user?._id && (String(user._id) === String(cAuthorId) || user.role === 'admin'));
    const cLikes     = Array.isArray(comment.likes) ? comment.likes : [];
    const cIsLiked   = Boolean(user?._id && cLikes.some((uid) => String(uid) === String(user._id) || String(uid?._id) === String(user._id)));

    return (
      <div className="space-y-2">
        {/* Comment row */}
        <div className="flex items-start gap-2">
          <Avatar src={comment.authorAvatar} name={comment.authorName} size="sm" />

          <div className="flex-1 min-w-0 bg-obsidian-800/70 border border-slate-800 rounded-lg px-3 py-2 space-y-1">
            {/* Header */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span className="text-[11px] font-bold text-white truncate">{comment.authorName}</span>
                {comment.authorCity && (
                  <span className="text-[10px] text-slate-500 font-mono">·{comment.authorCity}</span>
                )}
                {comment.replyToUser && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-neon-cyan font-mono">
                    <CornerDownRight className="w-2.5 h-2.5" />@{comment.replyToUser}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-slate-600 font-mono">{formatTime(comment.createdAt)}</span>
                {canDelete && (
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="text-slate-600 hover:text-rose-400 p-0.5 cursor-pointer transition-colors"
                    title="Delete reply"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <p className="text-[12px] text-slate-200 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-0.5">
              <button
                onClick={() => handleToggleLikeComment(comment._id, cLikes)}
                className={`inline-flex items-center gap-1 text-[10px] cursor-pointer transition-colors ${cIsLiked ? 'text-rose-400 font-bold' : 'text-slate-500 hover:text-rose-400'}`}
              >
                <Heart className={`w-3 h-3 ${cIsLiked ? 'fill-current' : ''}`} />
                <span>{cLikes.length > 0 ? cLikes.length : ''}</span>
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) return requireAuth('reply');
                  setActiveReplyTo({ commentId: comment._id, authorName: comment.authorName });
                  setShowThread(true);
                }}
                className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-neon-cyan cursor-pointer transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>

        {/* Children (nested) */}
        {comment.children?.length > 0 && (
          <div className={`pl-5 border-l border-slate-800/60 ml-3 space-y-2 ${depth >= 2 ? 'pl-3' : ''}`}>
            {comment.children.map((child) => <CommentNode key={child._id} comment={child} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <>
      <article className="rounded-xl border border-slate-800 bg-obsidian-900 overflow-hidden">

        {/* ── POST BODY ── */}
        <div className="p-4 space-y-3">

          {/* Author row */}
          <div className="flex items-start gap-2.5">
            <Avatar src={authorAvt} name={authorName} size="md" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <span className="text-sm font-bold text-white truncate">{authorName}</span>
                  {authorRole === 'admin' && (
                    <span className="px-1.5 py-px text-[9px] font-bold font-mono rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">ADMIN</span>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">·</span>
                  <span className="text-[10px] text-neon-cyan font-mono flex items-center gap-0.5 hidden sm:flex">
                    <MapPin className="w-2.5 h-2.5" />{postCity}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <TagBadge tag={postTag} />
                  <span className="text-[10px] text-slate-600 font-mono">{formatTime(post.createdAt)}</span>
                  {canDeletePost && (
                    <button
                      onClick={handleDeletePost}
                      disabled={isDeletingPost}
                      className="p-1 rounded-md text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                      title="Delete broadcast"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {/* City on mobile (shown under name) */}
              <div className="flex items-center gap-0.5 text-[10px] text-neon-cyan font-mono mt-0.5 sm:hidden">
                <MapPin className="w-2.5 h-2.5" />{postCity}
              </div>
            </div>
          </div>

          {/* Content */}
          <p className="text-[13px] text-slate-200 leading-relaxed whitespace-pre-line">{post.content}</p>

          {/* Media */}
          {mediaUrl && (
            <div
              onClick={() => setIsMediaZoomed(true)}
              className="rounded-lg border border-slate-800 overflow-hidden cursor-pointer relative group"
            >
              <img src={mediaUrl} alt="Attachment" className="w-full max-h-64 object-cover" loading="lazy" />
              <div className="absolute bottom-2 right-2 bg-obsidian-950/80 backdrop-blur px-2 py-1 rounded-md text-[10px] text-slate-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3 h-3 text-neon-cyan" /> View
              </div>
            </div>
          )}

          {/* Actions bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1">
              {/* Like */}
              <button
                onClick={handleToggleLike}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer transition-colors ${isLiked ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likesCount}</span>
              </button>

              {/* Replies toggle */}
              <button
                onClick={() => setShowThread((v) => !v)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono cursor-pointer transition-colors ${showThread ? 'text-neon-cyan border border-neon-cyan/20 bg-neon-cyan/5' : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800'}`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{totalReplies}</span>
                {showThread ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800 cursor-pointer transition-colors"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* ── THREAD SECTION ── */}
        {showThread && (
          <div className="border-t border-slate-800/60 bg-obsidian-950/40 p-4 space-y-3">

            {/* Comments list */}
            {commentTree.length > 0 && (
              <div className="space-y-3">
                {commentTree.map((root) => <CommentNode key={root._id} comment={root} />)}
              </div>
            )}

            {commentTree.length === 0 && (
              <p className="text-[11px] text-slate-600 text-center py-2">No replies yet. Be the first!</p>
            )}

            {/* Reply composer */}
            {isAuthenticated ? (
              <form onSubmit={handleSendReply} className="space-y-1.5">
                {/* Reply-to pill */}
                {activeReplyTo && (
                  <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-neon-cyan/8 border border-neon-cyan/20 text-[11px]">
                    <span className="text-neon-cyan font-mono flex items-center gap-1">
                      <CornerDownRight className="w-3 h-3" />
                      Replying to <strong className="text-white ml-1">@{activeReplyTo.authorName}</strong>
                    </span>
                    <button type="button" onClick={() => setActiveReplyTo(null)} className="text-slate-500 hover:text-white p-0.5 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Avatar src={user?.avatar?.url} name={user?.name} size="xs" />
                  <div className="flex-1 flex items-center gap-2 bg-obsidian-800 border border-slate-700 rounded-lg px-3 py-1.5 focus-within:border-neon-cyan/50 transition-colors">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={activeReplyTo ? `Reply to @${activeReplyTo.authorName}…` : 'Write a reply…'}
                      className="flex-1 bg-transparent text-[12px] text-white placeholder-slate-600 focus:outline-none"
                      autoFocus={Boolean(activeReplyTo)}
                    />
                    <button
                      type="submit"
                      disabled={!replyContent.trim() || isSendingReply}
                      className="p-1.5 rounded-md bg-neon-cyan text-obsidian-950 hover:bg-neon-cyan/90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-obsidian-800 border border-slate-700">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <Lock className="w-3 h-3 text-neon-cyan shrink-0" />
                  <span>Sign in to reply to this thread</span>
                </div>
                <button
                  onClick={() => requireAuth('post a reply')}
                  className="px-2.5 py-1 rounded-md bg-neon-cyan text-obsidian-950 text-[11px] font-bold cursor-pointer hover:bg-neon-cyan/90 shrink-0"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </article>

      {/* ── Media lightbox ── */}
      {mediaUrl && (
        <Modal isOpen={isMediaZoomed} onClose={() => setIsMediaZoomed(false)} title="Photo Evidence" maxWidth="max-w-3xl">
          <div className="rounded-xl overflow-hidden bg-obsidian-950 border border-slate-800">
            <img src={mediaUrl} alt="Enlarged" className="w-full h-auto max-h-[75vh] object-contain mx-auto" />
          </div>
        </Modal>
      )}
    </>
  );
};
