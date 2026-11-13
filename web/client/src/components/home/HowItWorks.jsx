import React from 'react';
import { QrCode, Shield, RefreshCw, ArrowRight, Zap, Package, UserCheck } from 'lucide-react';
import { Card } from '../ui/Card';

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Get Your Hardware Tag',
      description:
        'Attach our solid Laser-Printed Metal Keychain to your keys or bags, or apply our Weatherproof 3M Stickers to your laptops, tablets, and tech gear.',
      icon: Package,
      highlight: 'Keychains & Stickers',
      tag: 'Step 1: Choose Hardware',
    },
    {
      number: '02',
      title: 'Scan with Camera & Link',
      description:
        'Scan the physical QR code with any smartphone camera. Sign in or create a free account, enter your item details, and bind the tag in seconds.',
      icon: QrCode,
      highlight: '30-Second Setup',
      tag: 'Step 2: Account Binding',
    },
    {
      number: '03',
      title: 'Control What Finders See',
      description:
        'You choose your public contact options: enable a direct WhatsApp button, phone call, in-app chat, or an optional safe recovery cash reward.',
      icon: Shield,
      highlight: 'Zero-Leak Privacy',
      tag: 'Step 3: Privacy Shield',
    },
    {
      number: '04',
      title: 'Finder Scans & Returns',
      description:
        'If lost, whoever finds your item scans the QR code with their standard mobile camera (no app needed!). They see only your permitted info and contact you.',
      icon: RefreshCw,
      highlight: 'Zero App Needed',
      tag: 'Step 4: Safe Reunion',
    },
  ];

  return (
    <section className="space-y-10" id="how-it-works">
      
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-mono font-semibold border border-cyan-200">
          <Zap className="w-3.5 h-3.5" /> SIMPLE 4-STEP RECOVERY
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          How Findix Works for You
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          From attaching your tag to getting your lost valuables back safely — zero batteries, zero app downloads.
        </p>
      </div>

      {/* 4 Steps Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
        
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.number}
              className="p-6 space-y-4 border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Step Number Header */}
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-display font-black text-slate-300">
                    {step.number}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5">
                  <div className="inline-block text-[10px] font-mono font-bold text-cyan-700 uppercase tracking-wider">
                    {step.highlight}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Bottom Subtle Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{step.tag}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-600" />
              </div>
            </Card>
          );
        })}

      </div>

    </section>
  );
};

export default HowItWorks;
