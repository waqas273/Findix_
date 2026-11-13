import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCheck, 
  Check, 
  Tag, 
  Sparkles, 
  MessageSquare,
  X,
  Compass,
  AlertCircle
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const ChatDrawer = ({ isOpen, onClose, conversationId, qrSlug, initialItem }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const activeItem = conversation?.qrItemId || initialItem || {
    itemName: 'Findix Smart Tag',
    qrSlug: qrSlug || 'FDX-TAG',
    isLost: true,
  };

  // Quick preset chips for rapid finder communication
  const quickPresets = [
    'I found your item safe with me.',
    'I have handed this to the security/front desk.',
    'Where and when can we meet for handover?',
    'Please verify item color or distinguishing marks.',
  ];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch or initialize conversation & messages
  const loadChat = async () => {
    setLoading(true);
    try {
      let targetConvId = conversationId;

      // If conversationId not provided but qrSlug is, initialize conversation channel
      if (!targetConvId && qrSlug) {
        const initRes = await fetch('/api/chat/conversations/init', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ qrSlug }),
        });
        if (initRes.ok) {
          const initData = await initRes.json();
          if (initData.data) {
            setConversation(initData.data);
            targetConvId = initData.data._id;
          }
        }
      }

      if (targetConvId) {
        const msgRes = await fetch(`/api/chat/conversations/${targetConvId}/messages`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.data) {
            setMessages(msgData.data);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load chat messages from API, using fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadChat();
    }
  }, [isOpen, conversationId, qrSlug]);

  // Send message
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    setSending(true);
    const targetConvId = conversation?._id || conversationId || 'conv_active';

    const optimisticMsg = {
      _id: `msg_${Date.now()}`,
      conversationId: targetConvId,
      senderRole: 'finder',
      senderId: user?._id || null,
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage('');

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          conversationId: targetConvId,
          content: text,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          // Replace optimistic with real
          setMessages((prev) =>
            prev.map((m) => (m._id === optimisticMsg._id ? json.data : m))
          );
        }
      }
    } catch (e) {
      // Keep optimistic message
    } finally {
      setSending(false);
    }
  };

  // Shortcut to share current coordinate / location pin
  const handleShareLocationPin = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const locText = `📍 Shared Recovery Coordinate: Dropped Pin (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}) - https://maps.google.com/?q=${latitude},${longitude}`;
          handleSendMessage(locText);
          addToast('success', 'Location coordinate attached to message!');
        },
        () => {
          // Fallback manual landmark note
          const landmarkText = `📍 Shared Location Pin: Safe with Finder at Public Helpdesk / Main Gate.`;
          handleSendMessage(landmarkText);
          addToast('info', 'Standard location pin sent!');
        }
      );
    } else {
      handleSendMessage('📍 Location: Item is with Finder at Front Desk.');
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col h-full justify-between space-y-4">
        
        {/* Linked Item Header Bar */}
        <div className="p-3.5 rounded-2xl bg-obsidian-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-obsidian-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                {activeItem?.itemImage?.url ? (
                  <img src={activeItem.itemImage.url} alt={activeItem.itemName} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Tag className="w-5 h-5 text-neon-cyan" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white truncate max-w-[220px]">
                  {activeItem.itemName || 'Protected Item'}
                </h3>
                <span className="text-xs font-mono text-neon-cyan block">
                  Tag: {activeItem.qrSlug || qrSlug || 'FDX-TAG'}
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">
              Inquiry Live
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-obsidian-900/60 p-1.5 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5 text-neon-teal shrink-0" />
            <span>Encrypted zero-leak channel. Phone numbers remain shielded.</span>
          </div>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[55vh]">
          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-8 h-8 rounded-full border-2 border-neon-cyan border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Connecting to encrypted recovery channel...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-obsidian-950 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto shadow-inner">
                <MessageSquare className="w-7 h-7 text-neon-cyan" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-white">Start the Conversation</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Coordinate handover time, confirm item condition, or send GPS coordinates.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isSender = msg.senderId === user?._id || msg.senderRole === 'finder';

              return (
                <div
                  key={msg._id || idx}
                  className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} space-y-1`}
                >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isSender
                          ? 'bg-cyan-500/20 border border-neon-cyan/40 text-white font-medium rounded-tr-sm shadow-sm'
                          : 'bg-obsidian-950 border border-slate-800 text-slate-200 rounded-tl-sm'
                      }`}
                    >
                      {msg.content || msg.text}
                    </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono px-1">
                    <span>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Just now'}
                    </span>
                    {isSender && (
                      msg.isRead ? (
                        <CheckCheck className="w-3 h-3 text-neon-cyan" title="Read by recipient" />
                      ) : (
                        <Check className="w-3 h-3 text-slate-400" title="Sent" />
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips & Location Pin Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={handleShareLocationPin}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/25 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Share Location Pin</span>
            </button>

            {quickPresets.map((chip, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-obsidian-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors shrink-0 whitespace-nowrap cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Type message to owner..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-obsidian-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-colors"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={sending || !inputMessage.trim()}
              className="px-3.5 py-2.5 shrink-0 shadow-neon-sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

      </div>
    </Drawer>
  );
};
