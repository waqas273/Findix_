import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  QrCode, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Sparkles,
  Camera,
  CheckCircle2,
  Lock,
  Phone,
  MessageSquare,
  Award,
  Tag
} from 'lucide-react';
import { Card } from '../ui/Card';

export const HeroLifecycle = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: 'Get Your Hardware Tag',
      shortTitle: '1. Get Tag',
      badge: 'Two Hardware Options',
      desc: 'Choose between our Laser-Printed Metal Keychains (for keys, bikes & bags) or Weatherproof 3M Vinyl Stickers (for laptops & electronics). Pre-printed and ready to attach.',
      icon: Package,
      color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      activeColor: 'border-cyan-600 bg-cyan-50/80',
      preview: {
        title: 'Two Physical Form Factors',
        subtitle: 'Permanent Scratch-Proof QR',
        tag1: 'Laser Metal Keychain',
        tag2: 'Weatherproof 3M Stickers',
        status: 'Zero Batteries • Ready to Attach',
      }
    },
    {
      id: 2,
      title: 'Scan with Camera & Link',
      shortTitle: '2. Scan & Link',
      badge: 'Quick Setup',
      desc: 'Scan the physical QR code with your phone camera. Sign in or create an account, fill in your item details, and the tag is permanently linked to your profile.',
      icon: Camera,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      activeColor: 'border-teal-600 bg-teal-50/80',
      preview: {
        title: 'Camera Scan & Account Binding',
        subtitle: 'Item Registration Form',
        tag1: 'Sign Up / Sign In',
        tag2: 'Add Item Details',
        status: 'Instantly Linked to Your Account',
      }
    },
    {
      id: 3,
      title: 'Control What Finders See',
      shortTitle: '3. Privacy',
      badge: 'Zero-Leak Privacy',
      desc: 'You decide what contact info is public: enable a direct WhatsApp button, phone call, in-app relay chat, or an optional cash reward bounty.',
      icon: UserCheck,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      activeColor: 'border-indigo-600 bg-indigo-50/80',
      preview: {
        title: 'Privacy Shield Preferences',
        subtitle: 'You Choose What to Share',
        tag1: 'WhatsApp: Allowed',
        tag2: 'Private Phone: Hidden',
        status: 'Finders See Only Permitted Info',
      }
    },
    {
      id: 4,
      title: 'Finder Scans & Returns',
      shortTitle: '4. Safe Return',
      badge: 'No App Required',
      desc: 'If lost, anyone who finds your item scans the QR with their native phone camera (no app needed!). They see your allowed contact info and safely return it.',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      activeColor: 'border-emerald-600 bg-emerald-50/80',
      preview: {
        title: 'Instant Native Camera Scan',
        subtitle: 'Zero App or Sign-Up for Finders',
        tag1: 'Tap to WhatsApp Owner',
        tag2: 'Claim Reward Bounty',
        status: 'Average Reunion in < 2 Hours',
      }
    },
  ];

  const current = steps.find(s => s.id === activeStep) || steps[0];

  return (
    <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-xl rounded-3xl space-y-4 max-w-lg w-full mx-auto">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            How Recovery Works
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-800 font-bold bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
          Simple 4-Step Flow
        </span>
      </div>

      {/* 4 Steps Interactive Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
        {steps.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveStep(s.id)}
            className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
              activeStep === s.id
                ? 'bg-white text-cyan-800 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {s.shortTitle}
          </button>
        ))}
      </div>

      {/* Active Step Showcase Card */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 transition-all">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${current.color}`}>
              <current.icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-700 uppercase tracking-wider">
                Step 0{current.id} • {current.badge}
              </span>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {current.title}
              </h4>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            0{current.id}/04
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {current.desc}
        </p>

        {/* Dynamic Simulated Preview Box */}
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              {current.preview.title}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {current.preview.subtitle}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono font-semibold text-slate-700 border border-slate-200">
              {current.preview.tag1}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono font-semibold text-slate-700 border border-slate-200">
              {current.preview.tag2}
            </span>
          </div>

          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-cyan-800">
            <span>{current.preview.status}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Step Stepper Progression Strip */}
      <div className="flex items-center justify-between gap-1">
        {steps.map((s) => (
          <div
            key={s.id}
            onClick={() => setActiveStep(s.id)}
            className={`flex-1 h-1.5 rounded-full transition-all cursor-pointer ${
              s.id <= activeStep ? 'bg-cyan-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Bottom Compact Action Strip */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 font-medium">
          Keychains & Stickers Only
        </span>

        <button
          type="button"
          onClick={() => navigate('/scan?code=FDX-7749-KEY')}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700 hover:text-cyan-800 transition-colors cursor-pointer"
        >
          <span>Try Demo Scan</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </Card>
  );
};

export default HeroLifecycle;
