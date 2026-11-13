import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  Award, 
  Lock, 
  Send, 
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
import { Badge } from '../ui/Badge';

export const PrivacySimulator = () => {
  // Live Simulator States
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [allowInAppChat, setAllowInAppChat] = useState(true);
  const [hasBounty, setHasBounty] = useState(true);
  const [isLost, setIsLost] = useState(true);

  return (
    <section className="space-y-8">
      
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-mono font-semibold border border-cyan-200">
          <Sparkles className="w-3.5 h-3.5" /> INTERACTIVE TESTBENCH
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Live Privacy Simulator
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Toggle your security settings below and see how the finder's scan screen adapts in real-time. 
          Your real phone number, private email, and personal address remain 100% hidden.
        </p>
      </div>

      {/* Simulator Playground: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
        
        {/* Left Column: Owner's Control Console (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-6 sm:p-7 bg-white border-slate-200 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-600 animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Owner Privacy Controls
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Tag: FDX-8821</span>
            </div>

            <div className="space-y-4">
              <Toggle
                label="Enable Masked WhatsApp"
                description="Adds a 1-click WhatsApp chat button for finders."
                checked={showWhatsApp}
                onChange={setShowWhatsApp}
              />

              <div className="border-t border-slate-100 pt-3">
                <Toggle
                  label="Direct Phone Voice Call"
                  description="Displays phone number for immediate calls."
                  checked={showPhone}
                  onChange={setShowPhone}
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <Toggle
                  label="Encrypted In-App Relay Chat"
                  description="Permit anonymous chat without sharing phone numbers."
                  checked={allowInAppChat}
                  onChange={setAllowInAppChat}
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <Toggle
                  label="Display Recovery Bounty (PKR 10,000)"
                  description="Incentivize finders with a verified reward pledge."
                  checked={hasBounty}
                  onChange={setHasBounty}
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <Toggle
                  label="Mark as 'Lost' (Recovery Mode)"
                  description="Flashes urgent lost warning and return instructions."
                  checked={isLost}
                  onChange={setIsLost}
                />
              </div>
            </div>

            {/* Zero-Leak Indicator */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
              <Lock className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <span>
                <b className="text-slate-900">Zero-Leak Shield:</b> Real email address and home location are cryptographically redacted from all finder requests.
              </span>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Finder Phone Screen Mockup (7 Cols) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="w-full max-w-md relative">
            
            {/* Phone Screen Outer Bezel */}
            <div className="rounded-[36px] bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 p-[3px] shadow-xl">
              
              <div className="rounded-[33px] bg-white p-6 sm:p-7 border border-slate-200 relative overflow-hidden space-y-5">
                
                {/* Simulated Phone Top Speaker / Island */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-slate-100">
                  <span>FINDER SCREEN (PUBLIC)</span>
                  <div className="w-16 h-3 rounded-full bg-slate-200 mx-auto" />
                  <span className="text-cyan-600 font-bold">LIVE</span>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-50 border border-cyan-200 p-0.5 flex items-center justify-center shrink-0">
                      <img src="/logo.png" alt="Findix" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">TAG RESOLVED</span>
                      <span className="text-xs font-bold text-slate-900 font-mono">FDX-8821-PRO</span>
                    </div>
                  </div>

                  <Badge variant={isLost ? 'lost' : 'safe'}>
                    {isLost ? 'REPORTED LOST' : 'PROTECTED SAFE'}
                  </Badge>
                </div>

                {/* Registered Item Details */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-900">Apple MacBook Pro 16"</h4>
                    <span className="text-[10px] font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 font-bold">
                      QR Sticker
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Space Black finish. Protected with Findix 3M Weatherproof Sticker. Registered on Findix network.
                  </p>
                </div>

                {/* Bounty Card (If toggled) */}
                {hasBounty && (
                  <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-between animate-scale-up">
                    <div className="flex items-center gap-2.5">
                      <Award className="w-5 h-5 text-cyan-600" />
                      <div>
                        <div className="text-[11px] font-medium text-slate-600">Finder Bounty Guaranteed</div>
                        <div className="text-sm font-bold text-slate-900 font-mono">PKR 10,000</div>
                      </div>
                    </div>
                    <Badge variant="cyan" size="xs">Verified Reward</Badge>
                  </div>
                )}

                {/* Dynamic Contact Channels */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-xs font-semibold text-slate-700 block">Available Contact Methods:</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {showWhatsApp && (
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all animate-scale-up cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Chat on WhatsApp</span>
                      </button>
                    )}

                    {showPhone && (
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-semibold hover:bg-cyan-100 transition-all animate-scale-up cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-cyan-600" />
                        <span>Call Owner</span>
                      </button>
                    )}
                  </div>

                  {allowInAppChat && (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 animate-scale-up">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <Send className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Send Anonymous Relay Message:</span>
                      </div>
                      <input
                        disabled
                        placeholder="I found your item at Packages Mall Lahore..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  )}

                  {!showWhatsApp && !showPhone && !allowInAppChat && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center text-xs text-amber-700 space-y-1">
                      <AlertTriangle className="w-4 h-4 mx-auto text-amber-600" />
                      <p>All direct contact channels are hidden by owner preferences.</p>
                    </div>
                  )}
                </div>

                {/* Footer Shield */}
                <div className="pt-2 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Encrypted by Findix Privacy Architecture</span>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};

export default PrivacySimulator;
