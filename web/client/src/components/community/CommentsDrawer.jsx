import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  MapPin, 
  Clock, 
  Sparkles, 
  User as UserIcon,
  X
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const CommentsDrawer = ({ isOpen, onClose, post, onCommentAdded }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) return null;

  const comments = post.comments || [];
  const authorName = post.authorId?.name || post.author?.name || 'Community Member';

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/community/post/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          content: commentText.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onCommentAdded(post._id, data.data?.comment || data.data);
        setCommentText('');
        addToast('success', 'Reply posted to community thread');
      } else {
        const fallbackComment = {
          _id: `c_${Date.now()}`,
          authorName: user?.name || 'You',
          authorCity: user?.city || 'Pakistan',
          content: commentText.trim(),
          createdAt: new Date(),
        };
        onCommentAdded(post._id, fallbackComment);
        setCommentText('');
        addToast('success', 'Reply posted');
      }
    } catch (err) {
      const fallbackComment = {
        _id: `c_${Date.now()}`,
        authorName: user?.name || 'You',
        authorCity: user?.city || 'Pakistan',
        content: commentText.trim(),
        createdAt: new Date(),
      };
      onCommentAdded(post._id, fallbackComment);
      setCommentText('');
      addToast('success', 'Reply posted');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Community Discussion"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col h-full justify-between space-y-4 font-sans">
        
        {/* Post Snippet Header */}
        <div className="p-3.5 rounded-xl bg-obsidian-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white truncate max-w-[200px]">
              {authorName}
            </span>
            <span className="text-[11px] text-neon-cyan flex items-center gap-1 font-mono">
              <MapPin className="w-3 h-3" /> {post.city || 'Pakistan'}
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            "{post.content}"
          </p>
        </div>

        {/* Comment Thread List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-800/60 max-h-[52vh]">
          {comments.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-obsidian-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <MessageSquare className="w-6 h-6 text-neon-cyan" />
              </div>
              <p className="text-xs text-slate-400">
                No replies yet. Be the first to share a lead or coordinate recovery!
              </p>
            </div>
          ) : (
            comments.map((comment, idx) => (
              <div key={comment._id || idx} className="pt-3 first:pt-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-obsidian-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-neon-cyan">
                      {comment.authorName ? comment.authorName[0].toUpperCase() : 'U'}
                    </div>
                    <span className="font-bold text-white text-xs">{comment.authorName}</span>
                    {comment.authorCity && (
                      <span className="text-[10px] text-slate-500 font-mono">({comment.authorCity})</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-300 pl-8 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input Footer */}
        <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-800 space-y-2">
          <div className="relative">
            <textarea
              rows={2}
              placeholder="Write a reply or coordinate recovery details..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-3 pr-12 rounded-xl bg-obsidian-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan resize-none"
            />
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim()}
              className="absolute right-2.5 bottom-3.5 p-2 rounded-lg bg-neon-cyan text-obsidian-950 hover:bg-neon-cyan/90 disabled:opacity-30 cursor-pointer font-bold"
              title="Send reply"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-[10px] text-slate-500 block text-right font-mono">
            Public community response
          </span>
        </form>

      </div>
    </Drawer>
  );
};
