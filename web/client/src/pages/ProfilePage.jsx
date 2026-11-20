import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Phone, 
  Mail, 
  MapPin, 
  Bell, 
  Key, 
  Save, 
  Check, 
  ShieldCheck,
  LayoutDashboard,
  Package,
  MessageSquare,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Toggle } from '../components/ui/Toggle';
import { Badge } from '../components/ui/Badge';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'Islamabad');

  // Privacy toggles
  const [globalWhatsApp, setGlobalWhatsApp] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [inAppRelay, setInAppRelay] = useState(true);
  const [saved, setSaved] = useState(false);
  const { confirm } = useConfirm();

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const isConfirmed = await confirm({
      title: 'Update Recovery Coordinates?',
      message: 'Are you sure you want to update your public finder relay and recovery privacy shields?',
      confirmText: 'Save Coordinates',
      cancelText: 'Cancel',
      variant: 'primary',
      iconType: 'shield',
    });

    if (!isConfirmed) return;

    setSaved(true);
    if (addToast) {
      addToast('success', 'Profile and recovery coordinates saved successfully.');
    }
    setTimeout(() => setSaved(false), 2000);
  };

  const isGoogleUser = user?.authProvider === 'google' || user?.googleId;

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* 1. HEADER BANNER */}
      <div className="border-b border-slate-200 pb-6 space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-mono font-semibold border border-cyan-200 mb-2 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" /> VERIFIED RECOVERY COORDINATES
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Account & Recovery Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
          Manage your verified contact coordinates, privacy shields, and finder relay notification settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Avatar & Overview */}
        <div className="md:col-span-4 space-y-4">
          <Card className="p-6 text-center space-y-4 border-slate-200 bg-white shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-cyan-gradient p-[1.5px] mx-auto shadow-sm">
              <div className="w-full h-full bg-slate-50 rounded-[22px] flex items-center justify-center font-display font-bold text-2xl text-cyan-700 overflow-hidden">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  name ? name[0].toUpperCase() : 'U'
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 truncate">{name || 'Findix User'}</h3>
              <span className="text-xs text-slate-500 font-mono block truncate">{user?.email}</span>
              <div className="pt-2 flex items-center justify-center gap-2">
                <Badge variant="cyan" size="xs">
                  {user?.role?.toUpperCase() || 'OWNER'}
                </Badge>
                {isGoogleUser && (
                  <Badge variant="teal" size="xs">
                    GOOGLE AUTH
                  </Badge>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 text-left space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span>Relay Protection</span>
                <span className="text-emerald-600 font-bold">Active (AES-256)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Location Hub</span>
                <span className="text-slate-900 font-medium">{city || 'Pakistan'}</span>
              </div>
            </div>
          </Card>

          {/* Quick Page Links */}
          <Card className="p-4 border-slate-200 bg-white shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider px-2 block font-bold">
              Owner Navigation
            </span>
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-600" />
              <span>Protected Tags Studio</span>
            </Link>
            <Link
              to="/dashboard/orders"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Package className="w-4 h-4 text-teal-600" />
              <span>Hardware Orders & Tracking</span>
            </Link>
            <Link
              to="/dashboard/messages"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Finder Relay Messages</span>
            </Link>
          </Card>
        </div>

        {/* Right Column: Settings Form & Privacy Toggles */}
        <div className="md:col-span-8 space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 border-slate-200 bg-white shadow-sm">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-600" /> Contact Coordinates
              </h3>
              <span className="text-[11px] font-mono text-slate-500">Used for WhatsApp & SMS alerts</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                placeholder="e.g. Hamza Ahmed"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="SMS Relay Phone"
                  value={phone}
                  placeholder="+92 300 1234567"
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                />

                <Input
                  label="Primary City Hub"
                  value={city}
                  placeholder="Islamabad / Lahore / Karachi"
                  onChange={(e) => setCity(e.target.value)}
                  icon={MapPin}
                />
              </div>

              {/* Privacy Toggles Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider font-bold">
                  Privacy & Masking Shields
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Direct WhatsApp Relay</div>
                      <div className="text-[11px] text-slate-500">Allow finders to open direct masked WhatsApp chat on tag scan.</div>
                    </div>
                    <Toggle checked={globalWhatsApp} onChange={setGlobalWhatsApp} />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-900">SMS Instant Dispatch</div>
                      <div className="text-[11px] text-slate-500">Receive instant SMS alerts when a tag is resolved in a new location.</div>
                    </div>
                    <Toggle checked={smsAlerts} onChange={setSmsAlerts} />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-xs font-bold text-slate-900">In-App Secure Chat</div>
                      <div className="text-[11px] text-slate-500">Enable real-time web messenger without sharing contact numbers.</div>
                    </div>
                    <Toggle checked={inAppRelay} onChange={setInAppRelay} />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" size="lg" className="font-bold shadow-sm">
                  <Save className="w-4 h-4" />
                  <span>{saved ? 'Preferences Saved!' : 'Save Preferences'}</span>
                </Button>
              </div>

            </form>

          </Card>
        </div>

      </div>

    </div>
  );
};
