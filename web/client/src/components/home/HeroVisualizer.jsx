import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  Award, 
  QrCode, 
  ArrowRight, 
  CheckCircle2, 
  Lock,
  Sparkles
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const HeroVisualizer = () => {
  const navigate = useNavigate();
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [tagCodeInput, setTagCodeInput] = useState('');

  const sampleScenarios = [
    {
      id: 'FNX-9375DDBA',
      name: 'Apple MacBook Pro 16" (M3 Max)',
      category: 'Electronics',
      location: 'Packages Mall, Lahore',
      status: 'REPORTED LOST',
      reward: 'PKR 10,000 Bounty',
      ownerName: 'Dr. Tariq Jamil',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80',
      note: 'Contains clinical research files. Safe return rewarded immediately!',
    },
    {
      id: 'FDX-7749-KEY',
      name: 'BMW M-Sport Laser Smart Key Fob',
      category: 'Keys & Vehicles',
      location: 'F-7 Markaz, Islamabad',
      status: 'REPORTED LOST',
      reward: 'PKR 5,000 Bounty',
      ownerName: 'Hamza Malik',
      image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&auto=format&fit=crop&q=80',
      note: 'House & car keys attached on Findix titanium ring. Please tap WhatsApp below.',
    },
    {
      id: 'FDX-PET-904',
      name: 'Golden Retriever (Bruno)',
      category: 'Pet Medals',
      location: 'DHA Phase 6, Karachi',
      status: 'MISSING PET',
      reward: 'PKR 15,000 Bounty',
      ownerName: 'Ayesha Siddiqui',
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&auto=format&fit=crop&q=80',
      note: 'Friendly golden retriever with waterproof Findix collar medal. Friendly with strangers.',
    },
  ];

  const currentItem = sampleScenarios[activeItemIndex];

  const handleTestTagSubmit = (e) => {
    e.preventDefault();
    const code = tagCodeInput.trim() || currentItem.id;
    navigate(`/scan?code=${encodeURIComponent(code.toUpperCase())}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 select-none">
      
      {/* Live Interactive Scanner Frame - Light Device Preview */}
      <div className="relative rounded-3xl p-1 bg-gradient-to-b from-cyan-500/20 via-slate-200 to-slate-300 shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Device Inner Screen Container */}
        <div className="rounded-[22px] bg-white p-5 sm:p-6 space-y-4 shadow-sm">
          
          {/* Top Device Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-cyan-200 p-0.5 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Findix" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 tracking-wide block">
                  Findix Recovery Portal
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Tag ID: <strong className="text-cyan-700">{currentItem.id}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-mono font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              {currentItem.status}
            </div>
          </div>

          {/* Item Card Details */}
          <div className="space-y-3">
            <div className="flex gap-3.5 items-center">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                <img 
                  src={currentItem.image} 
                  alt={currentItem.name} 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  {currentItem.category} • {currentItem.location}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">
                  {currentItem.name}
                </h3>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  {currentItem.reward}
                </span>
              </div>
            </div>

            {/* Owner Note Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                Owner Recovery Instructions:
              </span>
              "{currentItem.note}"
            </div>
          </div>

          {/* Action Triggers (What Finder Sees Upon Scanning) */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Finder Contact Channels:</span>
              <span className="text-cyan-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" /> Masked Relay
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => navigate(`/scan?code=${currentItem.id}`)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-colors text-center group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center mb-1 text-emerald-700 font-bold text-xs">
                  WA
                </div>
                <span className="text-[11px] font-bold">WhatsApp</span>
                <span className="text-[9px] text-slate-500">1-Tap Chat</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/scan?code=${currentItem.id}`)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 transition-colors text-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-100 flex items-center justify-center mb-1">
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <span className="text-[11px] font-bold">Relay Call</span>
                <span className="text-[9px] text-slate-500">Private Line</span>
              </button>

              <button
                type="button"
                onClick={() => navigate(`/scan?code=${currentItem.id}`)}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 transition-colors text-center cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <span className="text-[11px] font-bold">Web Chat</span>
                <span className="text-[9px] text-slate-500">Encrypted</span>
              </button>
            </div>
          </div>

          {/* Interactive Scenario Switcher Pills */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500">Try Sample Items:</span>
            <div className="flex items-center gap-1.5">
              {sampleScenarios.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setActiveItemIndex(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                    activeItemIndex === idx
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {sc.category.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Quick Interactive Tag Lookup Bar */}
      <Card className="p-3.5 sm:p-4 bg-white border-slate-200 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-cyan-600" />
            Test Any Recovery Tag Code
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Real-Time Cloud Resolver
          </span>
        </div>

        <form onSubmit={handleTestTagSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder={`e.g. ${currentItem.id}`}
            value={tagCodeInput}
            onChange={(e) => setTagCodeInput(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600"
          />
          <Button type="submit" variant="primary" size="sm" className="shrink-0 px-4 font-bold text-xs">
            <span>Resolve Tag</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </form>
      </Card>

    </div>
  );
};

export default HeroVisualizer;
