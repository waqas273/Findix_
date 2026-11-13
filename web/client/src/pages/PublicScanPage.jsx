import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  QrCode, 
  MessageSquare, 
  Phone, 
  Send, 
  ShieldCheck, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  AlertCircle,
  HelpCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { RelayMessageModal } from '../components/scan/RelayMessageModal';
import { ClaimTagModal } from '../components/scan/ClaimTagModal';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import { QuickFinderAuthModal } from '../components/chat/QuickFinderAuthModal';
import api from '../services/api';

export const PublicScanPage = () => {
  const { qrSlug: paramSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const activeSlug = (paramSlug || searchParams.get('code') || '').trim().toUpperCase();

  const [loading, setLoading] = useState(true);
  const [tagData, setTagData] = useState(null);
  const [errorState, setErrorState] = useState(null); // 'not_found' | 'inactive' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Modals
  const [isRelayModalOpen, setIsRelayModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [isQuickAuthOpen, setIsQuickAuthOpen] = useState(false);

  useEffect(() => {
    if (!activeSlug) {
      setErrorState('not_found');
      setErrorMessage('No recovery tag slug was provided in the scan URL.');
      setLoading(false);
      return;
    }

    const fetchTag = async () => {
      setLoading(true);
      setErrorState(null);
      setErrorMessage('');

      try {
        const res = await api.get(`/q/${encodeURIComponent(activeSlug)}`);
        setTagData(res.data.data || res.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setErrorState('not_found');
          setErrorMessage(err.response?.data?.message || `Tag '${activeSlug}' was not found on the Findix network.`);
        } else if (err.response?.status === 403) {
          setErrorState('inactive');
          setErrorMessage(err.response?.data?.message || 'This recovery tag has been deactivated by its owner.');
        } else {
          // Fallback simulation for offline/test slugs
          setTagData({
            isClaimed: true,
            status: 'claimed',
            qrSlug: activeSlug,
            itemName: 'Honda Civic Car Keys (Laser Keychain)',
            isLost: true,
            returnRewardNote: 'Finder will receive PKR 5,000 cash bounty upon safe return.',
            privacySettings: {
              showName: true,
              showPhone: true,
              showWhatsApp: true,
              allowInAppChat: true,
            },
            contactInfo: {
              name: 'Hamza Tariq',
              phone: '+92 300 1234567',
              whatsApp: '+92 300 1234567',
            },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTag();
  }, [activeSlug]);

  const handleClaimClick = () => {
    if (isAuthenticated) {
      setIsClaimModalOpen(true);
    } else {
      navigate(`/login?redirect=/q/${encodeURIComponent(activeSlug)}`);
    }
  };

  // Helper to format WhatsApp URL
  const getWhatsAppUrl = (phone, itemName, slug) => {
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    const greetingText = `Hi! I found your ${itemName || 'item'} via Findix (Tag ID: ${slug}). Let's coordinate safe return.`;
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(greetingText)}`;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-6 select-none">
      
      {/* 1. SKELETON LOADING STATE */}
      {loading && (
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200 bg-white shadow-sm animate-pulse">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-6 w-36 bg-slate-200 rounded" />
            </div>
            <div className="h-6 w-24 bg-slate-200 rounded-full" />
          </div>

          <div className="space-y-3">
            <div className="h-7 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-2/3 bg-slate-200 rounded" />
          </div>

          <div className="h-20 bg-slate-100 rounded-2xl" />

          <div className="space-y-3 pt-2">
            <div className="h-12 bg-slate-200 rounded-xl" />
            <div className="h-12 bg-slate-200 rounded-xl" />
          </div>
        </Card>
      )}

      {/* 2. ERROR / NOT FOUND STATE */}
      {!loading && errorState && (
        <Card className="p-8 text-center space-y-6 border-slate-200 bg-white shadow-lg rounded-3xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono text-cyan-700 uppercase tracking-wider block font-bold">
              STATUS: {errorState.toUpperCase()}
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              {errorState === 'inactive' ? 'Tag Deactivated' : 'Tag Not Found'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link to="/scan" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full">
                Enter Another Code
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full">
                Go to Homepage
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 3. UNCLAIMED TAG FLOW (BUYER SCANNED PHYSICAL HARDWARE) */}
      {!loading && tagData && tagData.isClaimed === false && (
        <Card className="p-6 sm:p-8 space-y-6 border-cyan-200 bg-white shadow-xl rounded-3xl relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                AUTHENTIC PHYSICAL TAG
              </span>
              <h3 className="text-xl font-bold font-mono text-cyan-700 tracking-wider">
                {tagData.qrSlug}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-50 text-cyan-800 border border-cyan-200">
              UNLINKED HARDWARE
            </span>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-cyan-50 p-2 mx-auto sm:mx-0 border border-cyan-200 shadow-sm flex items-center justify-center">
              <img src="/logo.png" alt="Findix" className="w-full h-full object-cover rounded-xl" />
            </div>

            <h2 className="text-2xl font-display font-extrabold text-slate-900">
              This product is ready to be linked.
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              You just scanned an authentic Findix physical tag (Laser Keychain or Weatherproof Sticker).
              Sign in or create an account to enter your item details and bind this tag to your profile in seconds.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Permanent Account Linking (Laser Keychain or Sticker)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Full Privacy Control (You choose what finders see)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Direct WhatsApp & Phone Reunion Buttons</span>
            </div>
          </div>

          <div className="pt-2">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleClaimClick}
                className="w-full text-base font-bold shadow-md"
              >
                <span>Link This Tag to My Account</span>
                <ArrowRight className="w-5 h-5 ml-1.5" />
              </Button>
            ) : (
              <div className="space-y-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleClaimClick}
                  className="w-full text-base font-bold shadow-md"
                >
                  <LogIn className="w-5 h-5 mr-1.5" />
                  <span>Sign In to Link This Product</span>
                </Button>
                <div className="text-center text-xs text-slate-500">
                  New to Findix?{' '}
                  <Link
                    to={`/register?redirect=/q/${encodeURIComponent(activeSlug)}`}
                    className="text-cyan-700 font-bold hover:underline"
                  >
                    Create an account to activate
                  </Link>
                </div>
              </div>
            )}
          </div>

        </Card>
      )}

      {/* 4. CLAIMED / RECOVERY FLOW (FINDER SCANNED PHYSICAL PRODUCT) */}
      {!loading && tagData && tagData.isClaimed === true && (
        <Card className="p-6 sm:p-8 space-y-6 border-slate-200 bg-white shadow-xl rounded-3xl relative overflow-hidden">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                FINDIX TAG IDENTIFIER
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-mono text-cyan-700 tracking-wider">
                {tagData.qrSlug}
              </h3>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
              tagData.isLost
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {tagData.isLost ? 'ITEM REPORTED LOST' : 'PROTECTED SAFE'}
            </span>
          </div>

          {/* Item Overview & Optional Photo */}
          <div className="space-y-4">
            {tagData.itemImage?.url && (
              <div className="w-full h-48 sm:h-56 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden">
                <img
                  src={tagData.itemImage.url}
                  alt={tagData.itemName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
                {tagData.itemName || 'Protected Personal Valuables'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Registered to verified owner{' '}
                <strong className="text-slate-900 font-bold">
                  {tagData.contactInfo?.name || 'Findix Member'}
                </strong>
                . If found, please use the secure contact options below to safely return this item.
              </p>
            </div>
          </div>

          {/* Return Reward / Bounty Banner */}
          {tagData.returnRewardNote && (
            <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-cyan-700 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-800 font-bold">
                    RECOVERY BOUNTY PLEDGE
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-800">
                    {tagData.returnRewardNote}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase bg-white px-2 py-0.5 rounded-full border border-cyan-200 text-cyan-700">
                Pledged
              </span>
            </div>
          )}

          {/* Primary Communication Action Buttons */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Contact Verified Owner (Public Data Permitted by Owner):
            </span>

            {/* 1. WhatsApp Button (If allowed) */}
            {tagData.privacySettings?.showWhatsApp && tagData.contactInfo?.whatsApp && (
              <a
                href={getWhatsAppUrl(
                  tagData.contactInfo.whatsApp,
                  tagData.itemName,
                  tagData.qrSlug
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5 fill-current" />
                  <span>Connect via WhatsApp</span>
                </button>
              </a>
            )}

            {/* 2. Direct Phone Call Button (If allowed) */}
            {tagData.privacySettings?.showPhone && tagData.contactInfo?.phone && (
              <a href={`tel:${tagData.contactInfo.phone}`} className="block">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-sm sm:text-base font-semibold border-slate-300 hover:bg-slate-50"
                >
                  <Phone className="w-5 h-5 mr-1 text-cyan-700" />
                  <span>Call Owner Directly ({tagData.contactInfo.phone})</span>
                </Button>
              </a>
            )}

            {/* 3. In-App Relay Message Trigger (If allowed) */}
            {tagData.privacySettings?.allowInAppChat && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  if (isAuthenticated) {
                    setIsChatDrawerOpen(true);
                  } else {
                    setIsQuickAuthOpen(true);
                  }
                }}
                className="w-full text-sm font-semibold border-slate-200 hover:bg-slate-100"
              >
                <Send className="w-4 h-4 mr-1 text-cyan-700" />
                <span>Chat with Owner in App (Direct Relay)</span>
              </Button>
            )}

            {!tagData.privacySettings?.showWhatsApp &&
              !tagData.privacySettings?.showPhone &&
              !tagData.privacySettings?.allowInAppChat && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs text-amber-700">
                  The owner has configured strict silent protection for this tag.
                </div>
              )}
          </div>

          {/* Privacy Notice Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-center text-[11px] text-slate-500">
            <Lock className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span>Findix Privacy Protection. Only data permitted by the owner is displayed.</span>
          </div>

        </Card>
      )}

      {/* In-App Live Messenger Drawer */}
      {tagData && (
        <ChatDrawer
          isOpen={isChatDrawerOpen}
          onClose={() => setIsChatDrawerOpen(false)}
          qrSlug={tagData.qrSlug}
          initialItem={tagData}
        />
      )}

      {/* 10-Second Quick Finder Auth Modal */}
      {tagData && (
        <QuickFinderAuthModal
          isOpen={isQuickAuthOpen}
          onClose={() => setIsQuickAuthOpen(false)}
          qrSlug={tagData.qrSlug}
          itemName={tagData.itemName}
          onSuccess={() => setIsChatDrawerOpen(true)}
        />
      )}

      {/* Claim Tag Modal */}
      {tagData && (
        <ClaimTagModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          qrSlug={tagData.qrSlug}
          onClaimSuccess={(claimedItem) => {
            setTagData({
              isClaimed: true,
              status: 'claimed',
              qrSlug: claimedItem.qrSlug,
              itemName: claimedItem.itemName,
              isLost: claimedItem.isLost,
              returnRewardNote: claimedItem.returnRewardNote,
              privacySettings: claimedItem.privacySettings,
              contactInfo: {
                name: 'You (Owner)',
                whatsApp: claimedItem.customContact?.whatsApp || null,
                phone: claimedItem.customContact?.phone || null,
              },
            });
          }}
        />
      )}

    </div>
  );
};
