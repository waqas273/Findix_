import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Send, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Tag, 
  CheckCheck, 
  Check, 
  Sparkles, 
  Compass, 
  Search, 
  User, 
  ChevronRight, 
  Package, 
  Layers, 
  ArrowLeft, 
  QrCode, 
  Copy, 
  AlertTriangle, 
  RefreshCw 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const MessagesPage = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const messagesEndRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const quickPresets = [
    'Thank you so much! Where are you located?',
    'I can come over immediately for handover.',
    'Is the recovery bounty received on your side?',
    'Please hold onto it, I am on my way!',
  ];

  // Fetch all active conversation threads for logged-in user
  const fetchConversations = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        const convs = Array.isArray(json.data) ? json.data : (json.data?.conversations || []);
        setConversations(convs);
        
        // Auto-select first conversation if none selected
        if (convs.length > 0) {
          setActiveConvId((prev) => {
            if (prev && convs.some((c) => c._id === prev)) {
              return prev;
            }
            return convs[0]._id;
          });
        }
      }
    } catch (e) {
      console.warn('Conversations fetch error:', e);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages for the currently selected conversation
  const fetchMessages = useCallback(async (convId, isSilent = false) => {
    if (!convId) return;
    if (!isSilent) setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        const msgList = Array.isArray(json.data) ? json.data : [];
        setMessages(msgList);
      }
    } catch (e) {
      console.warn('Messages fetch error:', e);
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);

      // Real-time synchronization polling (every 3 seconds)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(activeConvId, true);
        fetchConversations(true);
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeConvId, fetchMessages, fetchConversations]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message handler with instant optimistic update & MongoDB persistence
  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : inputMessage).trim();
    if (!text || !activeConvId || sending) return;

    setInputMessage('');
    setSending(true);

    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      conversationId: activeConvId,
      senderId: user?._id || 'owner_id',
      senderRole: 'owner',
      content: text,
      text: text,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/chat/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          conversationId: activeConvId,
          content: text,
          text: text,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const savedMsg = json.data;
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...savedMsg, text: savedMsg.content || savedMsg.text } : m))
        );
        fetchConversations(true);
      }
    } catch (e) {
      console.error('Failed to send message:', e);
      addToast('error', 'Message send failed. Please check network connection.');
    } finally {
      setSending(false);
    }
  };

  // Share Live GPS Pin
  const handleShareGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const locText = `📍 My Current Coordinates: https://www.google.com/maps?q=${latitude},${longitude} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          handleSendMessage(locText);
        },
        (err) => {
          addToast('error', 'Location permission denied or unavailable');
        }
      );
    } else {
      addToast('error', 'Geolocation is not supported by your browser');
    }
  };

  const handleSelectConversation = (convId) => {
    setActiveConvId(convId);
    setShowMobileChat(true);
  };

  const handleCopySlug = (slug) => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopiedSlug(true);
    addToast('success', `Tag Slug "${slug}" copied to clipboard`);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const filteredConversations = conversations.filter((c) => {
    const itemName = c.qrItemId?.itemName || '';
    const slug = c.qrItemId?.qrSlug || '';
    const finderName = c.finderUser?.name || '';
    const lastMsg = c.lastMessage?.content || '';
    const q = searchQuery.toLowerCase();
    return (
      itemName.toLowerCase().includes(q) || 
      slug.toLowerCase().includes(q) || 
      finderName.toLowerCase().includes(q) ||
      lastMsg.toLowerCase().includes(q)
    );
  });

  const activeConversation = conversations.find((c) => c._id === activeConvId);

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 font-sans">
      
      {/* 1. TOP TITLE BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-semibold border border-emerald-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> SECURE ZERO-LEAK FINDER RELAY
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Finder Relay Messages
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Real-time end-to-end encrypted relay communications with finders who scanned your physical hardware tags.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              fetchConversations();
              if (activeConvId) fetchMessages(activeConvId);
              addToast('info', 'Synced latest messages');
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-obsidian-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 cursor-pointer"
            title="Force refresh chat"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Sync</span>
          </button>

          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="font-bold text-xs">
              <QrCode className="w-3.5 h-3.5" />
              <span>Protected Tags</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. CHAT WORKSPACE MATRIX */}
      {loading ? (
        <div className="h-[620px] rounded-2xl bg-obsidian-950 border border-slate-800 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <RefreshCw className="w-4 h-4 text-neon-cyan" />
            <span>Connecting to Findix Encrypted Relay...</span>
          </div>
        </div>
      ) : conversations.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 px-4 space-y-4 rounded-2xl bg-obsidian-950 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-obsidian-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <MessageSquare className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Active Relay Threads</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              When a finder scans your physical Findix QR tag and initiates a return, secure real-time messages will automatically stream here.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button variant="primary" size="md" className="font-bold text-xs">
                <QrCode className="w-4 h-4" />
                <span>Go to Protected Tags Studio</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="h-[650px] rounded-2xl bg-obsidian-950 border border-slate-800 grid grid-cols-1 md:grid-cols-12 overflow-hidden shadow-2xl">
          
          {/* Left Panel: Conversations List */}
          <div className={`md:col-span-4 border-r border-slate-800 flex flex-col h-full bg-obsidian-950 ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}>
            
            {/* Search Box */}
            <div className="p-3.5 border-b border-slate-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search item, slug, or finder..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-obsidian-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                />
              </div>
            </div>

            {/* Conversation Threads */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
              {filteredConversations.map((conv) => {
                const isSelected = conv._id === activeConvId;
                const itemName = conv.qrItemId?.itemName || 'Protected Item';
                const slug = conv.qrItemId?.qrSlug || 'FDX-TAG';
                const isLost = conv.qrItemId?.isLost;
                const lastMsg = conv.lastMessage?.content || 'Relay channel opened';
                const lastTime = conv.lastMessage?.timestamp 
                  ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv._id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-obsidian-900 border-neon-cyan/40 text-white'
                        : 'bg-transparent border-transparent hover:bg-obsidian-900/60 hover:border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-obsidian-950 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {conv.qrItemId?.itemImage?.url ? (
                        <img src={conv.qrItemId.itemImage.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <QrCode className="w-5 h-5 text-neon-cyan" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{itemName}</h4>
                        {lastTime && (
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">{lastTime}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-neon-cyan font-bold">{slug}</span>
                        {isLost && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-neon-rose text-[9px] font-mono font-bold border border-rose-500/20">
                            LOST
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        {lastMsg}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Panel: Encrypted Chat Window */}
          <div className={`md:col-span-8 flex flex-col h-full bg-obsidian-900/40 ${
            showMobileChat ? 'flex' : 'hidden md:flex'
          }`}>
            
            {activeConversation ? (
              <>
                {/* Chat Top Bar */}
                <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-obsidian-950">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-2 rounded-xl bg-obsidian-900 text-slate-300 border border-slate-800 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <div className="w-10 h-10 rounded-xl bg-obsidian-900 border border-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {activeConversation.qrItemId?.itemImage?.url ? (
                        <img src={activeConversation.qrItemId.itemImage.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {activeConversation.qrItemId?.itemName || 'Recovery Relay'}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                          ENCRYPTED
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                        <button
                          type="button"
                          onClick={() => handleCopySlug(activeConversation.qrItemId?.qrSlug)}
                          className="hover:text-neon-cyan flex items-center gap-1 cursor-pointer"
                          title="Copy Tag Slug"
                        >
                          <span>{activeConversation.qrItemId?.qrSlug || 'FDX-TAG'}</span>
                          <Copy className="w-3 h-3" />
                        </button>
                        <span>•</span>
                        <span className="text-emerald-400">Finder Relay Connected</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono text-slate-400">Live Sync Active</span>
                  </div>
                </div>

                {/* Quick Presets Bar */}
                <div className="px-4 py-2 bg-obsidian-950/80 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold shrink-0">
                    Quick Relays:
                  </span>
                  {quickPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(preset)}
                      className="px-2.5 py-1 rounded-lg bg-obsidian-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 shrink-0 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-obsidian-950/30">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full text-xs font-mono text-slate-500">
                      Loading encrypted conversation thread...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-slate-500">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                      <span className="text-xs text-slate-300 font-medium">Relay channel opened and active.</span>
                      <span className="text-[11px] text-slate-500">Send coordinates or instructions to complete the handover.</span>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isOwner = msg.senderRole === 'owner' || msg.senderId === user?._id;
                      const msgText = msg.content || msg.text || '';
                      const msgTime = msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';

                      return (
                        <div
                          key={msg._id || idx}
                          className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 space-y-1.5 ${
                              isOwner
                                ? 'bg-cyan-500/20 border border-neon-cyan/40 text-white rounded-tr-none'
                                : 'bg-obsidian-900 border border-slate-800 text-slate-200 rounded-tl-none'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
                              <span className={isOwner ? 'text-neon-cyan font-bold' : 'text-emerald-400 font-bold'}>
                                {isOwner ? 'You (Tag Owner)' : 'Finder'}
                              </span>
                              <span>{msgTime}</span>
                            </div>

                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                              {msgText}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input & Action Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3.5 border-t border-slate-800 bg-obsidian-950 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={handleShareGPS}
                    className="p-2.5 rounded-xl bg-obsidian-900 border border-slate-800 text-slate-400 hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors cursor-pointer"
                    title="Share Live GPS Coordinates"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type encrypted message or handover instruction..."
                    className="flex-1 bg-obsidian-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    disabled={!inputMessage.trim() || sending}
                    className="font-bold shrink-0 text-xs sm:text-sm px-4"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-6 text-slate-500">
                <MessageSquare className="w-10 h-10 text-slate-600" />
                <span className="text-sm font-semibold text-white">Select a conversation thread</span>
                <span className="text-xs text-slate-400 max-w-xs">
                  Choose a tag from the left panel to inspect the encrypted communication log with the finder.
                </span>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
