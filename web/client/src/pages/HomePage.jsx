import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  QrCode, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Sparkles,
  Lock,
  BatteryCharging,
  Smartphone,
  Layers,
  Heart,
  Luggage,
  KeyRound,
  Laptop,
  LogIn,
  UserPlus,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { HeroLifecycle } from '../components/home/HeroLifecycle';
import { HowItWorks } from '../components/home/HowItWorks';
import { PrivacySimulator } from '../components/home/PrivacySimulator';
import { HardwareShowcase } from '../components/home/HardwareShowcase';
import { MetricsTicker } from '../components/home/MetricsTicker';
import { Testimonials } from '../components/home/Testimonials';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleScrollToStore = () => {
    const section = document.getElementById('hardware-showcase');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/store');
    }
  };

  const handleScrollToHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleActivateSubmit = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      navigate(`/scan?code=${encodeURIComponent(tagInput.trim().toUpperCase())}`);
      setShowActivateModal(false);
    }
  };

  const useCases = [
    {
      icon: KeyRound,
      title: 'Keys, Bikes & Vehicles',
      desc: 'Never lose your bike keys, car fobs, or house keyrings. Tough metal keychains withstand heavy daily pocket wear.',
      tag: 'Laser Metal Keychain',
      color: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    },
    {
      icon: Laptop,
      title: 'Laptops, MacBooks & Tech',
      desc: 'Slim industrial adhesive stickers for MacBooks, iPads, chargers, cameras, and headphones. Scratch and water resistant.',
      tag: 'Weatherproof Stickers',
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    },
    {
      icon: Luggage,
      title: 'Backpacks & Luggage',
      desc: 'Attach the laser-etched metal keychain to your travel bags, briefcases, or gym sacks for instant safe identification.',
      tag: 'Laser Metal Keychain',
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    },
    {
      icon: Zap,
      title: 'Helmets & Daily Gear',
      desc: 'Stick high-contrast QR decals on bike helmets, water bottles, passport covers, or power banks with zero battery required.',
      tag: 'Weatherproof Stickers',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
  ];

  const comparisons = [
    {
      icon: BatteryCharging,
      title: 'Zero Batteries or Charging',
      desc: 'Unlike Apple AirTags or Bluetooth trackers that die after 10-12 months, Findix tags are passive physical hardware with lifetime routing. Zero charging needed.',
    },
    {
      icon: Lock,
      title: 'Zero-Leak Privacy Masking',
      desc: 'Traditional pet and luggage tags write your private phone number for anyone to read. Findix routes messages anonymously via encrypted cloud relay.',
    },
    {
      icon: Smartphone,
      title: 'No App Required for Finders',
      desc: 'Anyone who discovers your item can scan the tag with their standard phone camera (iOS or Android) — no specialized app or account download required.',
    },
    {
      icon: Zap,
      title: 'Instant Multi-Channel Contact',
      desc: 'Finders can tap to start a masked WhatsApp chat, request a private phone connection, or send an anonymous web alert with their location notes.',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-4 sm:pt-10 lg:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Value Proposition & Dual CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-200 bg-cyan-50 text-cyan-800 text-xs sm:text-sm font-semibold shadow-sm">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              <span>Pakistan's #1 Smart QR Recovery Network</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-slate-900 leading-[1.12]">
                Protect What You Carry. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-700">
                  Never Lost Again.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Findix laser-prints smart QR codes onto solid alloy keychains and weatherproof stickers with an intelligent anonymous contact relay. If lost, anyone can scan your tag with their phone camera to notify you instantly — without ever exposing your private data.
              </p>
            </div>

            {/* Dual Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleScrollToStore}
                className="w-full sm:w-auto font-bold shadow-md hover:shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Explore Recovery Tags</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowActivateModal(true)}
                className="w-full sm:w-auto border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 font-bold"
              >
                <QrCode className="w-5 h-5" />
                <span>Activate or Resolve Tag</span>
              </Button>
            </div>

            {/* Trust Points */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Zero Battery Maintenance
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> No App Needed for Finders
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Masked WhatsApp & SMS Relay
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" /> Free Delivery in Pakistan
              </span>
            </div>

          </div>

          {/* Right Column: Interactive 3-Step Live Hardware Lifecycle */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <HeroLifecycle />
          </div>

        </div>
      </section>

      {/* 2. COMMUNITY METRICS TICKER */}
      <MetricsTicker />

      {/* 3. CORE PROBLEM VS FINDIX ADVANTAGE */}
      <section className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-mono font-semibold border border-cyan-200">
            <Sparkles className="w-3.5 h-3.5" /> WHY FINDIX
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Built for Real-World Recovery in Pakistan
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Traditional tracking tags either expose your phone number to strangers or require expensive Apple ecosystems that run out of battery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {comparisons.map((c, i) => {
            const Icon = c.icon;
            return (
              <Card key={i} className="p-6 bg-white border-slate-200 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. WHO IS FINDIX FOR? (USE CASES) */}
      <section className="space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-mono font-semibold border border-cyan-200">
            <Layers className="w-3.5 h-3.5" /> COMPLETE COVERAGE
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            Protection for Every Valued Essential
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            From daily work commute to international travel — choose the form factor engineered for your life.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((uc, i) => {
            const Icon = uc.icon;
            return (
              <Card key={i} className="p-6 bg-white border-slate-200 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${uc.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{uc.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{uc.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-cyan-700 font-mono">{uc.tag}</span>
                  <Link to="/store" className="text-slate-400 hover:text-cyan-700 flex items-center gap-1 transition-colors">
                    <span>Shop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 5. HOW IT WORKS (3-STEP VISUAL PIPELINE) */}
      <HowItWorks />

      {/* 6. LIVE INTERACTIVE PRIVACY SIMULATOR */}
      <PrivacySimulator />

      {/* 7. HARDWARE SHOWCASE & STORE PREVIEW */}
      <HardwareShowcase />

      {/* 8. VERIFIED USER RECOVERY STORIES */}
      <Testimonials />

      {/* 9. FINAL HIGH-CONVERSION CTA BANNER */}
      <section className="relative rounded-3xl bg-gradient-to-r from-cyan-700 via-teal-700 to-cyan-800 text-white p-8 sm:p-14 overflow-hidden text-center space-y-6 shadow-xl">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-white/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-teal-300/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-mono font-semibold border border-white/20">
          <Sparkles className="w-3.5 h-3.5" /> SECURE YOUR ESSENTIALS TODAY
        </div>

        <h2 className="text-3xl sm:text-5xl font-display font-extrabold max-w-2xl mx-auto leading-tight text-white">
          Never experience the dread of losing your valuables again.
        </h2>

        <p className="text-sm sm:text-base text-cyan-100 max-w-xl mx-auto leading-relaxed">
          Order your titanium recovery tags or weatherproof sticker pack today with free nationwide courier delivery anywhere in Pakistan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link to="/store" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-white text-cyan-900 hover:bg-slate-100 font-bold shadow-lg">
              <ShoppingBag className="w-4 h-4 mr-1 text-cyan-700" />
              <span>Order Recovery Tags</span>
              <ArrowRight className="w-4 h-4 ml-1 text-cyan-700" />
            </Button>
          </Link>
          <Link to="/community" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-cyan-800/80 hover:bg-cyan-800 border-2 border-white/30 text-white font-bold"
            >
              <span>Explore Community Feed</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* 10. Activate Tag Modal Dialog (Aware of Visitor vs Registered User) */}
      <Modal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        title="Activate or Resolve Findix Tag"
      >
        <div className="space-y-5">
          {isAuthenticated ? (
            /* Registered User Flow */
            <form onSubmit={handleActivateSubmit} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter the code printed on your physical Findix tag to bind it to your dashboard or review its active status:
              </p>

              <Input
                label="Tag Code Identifier"
                placeholder="e.g. FDX-7749-KEY"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                icon={Search}
                required
                className="font-mono uppercase text-base tracking-wider"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowActivateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="font-bold">
                  <span>Resolve & Bind Tag</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          ) : (
            /* Visitor Flow — clear explanation and sign in prompt */
            <div className="space-y-4 text-center sm:text-left">
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-cyan-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <strong className="text-slate-900 block text-sm">Account Required to Bind Tags</strong>
                  <p className="leading-relaxed">
                    To link a new tag to your personal account and manage its recovery privacy settings, please sign in or register for free.
                  </p>
                </div>
              </div>

              {/* Helpful note for someone who found an item */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-slate-800">Did you find someone's lost item?</strong> No account or login is required! Simply open your smartphone's camera and scan the QR code printed on the physical tag directly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Link
                  to="/login"
                  onClick={() => setShowActivateModal(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 text-white font-bold text-sm shadow-sm hover:shadow"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setShowActivateModal(false)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-cyan-600 text-cyan-700 font-bold text-sm hover:bg-cyan-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default HomePage;
