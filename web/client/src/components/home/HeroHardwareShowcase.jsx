import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  ShoppingBag, 
  Droplets, 
  Cpu, 
  Sparkles, 
  Check, 
  ExternalLink,
  Layers,
  Award,
  Zap
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const HeroHardwareShowcase = () => {
  const navigate = useNavigate();
  const [selectedTagIdx, setSelectedTagIdx] = useState(0);

  const hardwareProducts = [
    {
      id: 'FDX-7749-KEY',
      name: 'Titanium Matte QR Keychain Tag',
      category: 'Everyday Carry & Vehicles',
      badge: 'Grade 5 Aerospace Alloy',
      price: 2499,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      specs: [
        { label: 'Material', value: 'Grade 5 Titanium (Matte PVD)' },
        { label: 'Waterproof', value: 'IP68 Submersible (50m)' },
        { label: 'Power', value: 'Zero Battery Required' },
        { label: 'Matrix', value: 'Laser Deep-Etched' },
      ],
      description: 'CNC-machined from solid aerospace titanium. Built to survive car ignitions, key pockets, and extreme weather without scratching.',
      qrCode: 'FDX-7749-KEY',
    },
    {
      id: 'FDX-9375-DEC',
      name: 'Holographic Metallic Decals (3-Pack)',
      category: 'Laptops, Cameras & Drones',
      badge: '3M Industrial VHB Film',
      price: 1499,
      originalPrice: 1899,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      specs: [
        { label: 'Material', value: '3M Polycarbonate Film' },
        { label: 'Waterproof', value: 'IP67 Weather-Resistant' },
        { label: 'Thickness', value: '0.4mm Ultra-Slim Profile' },
        { label: 'Adhesive', value: 'Residue-Free High Tack' },
      ],
      description: 'Ultra-thin holographic QR badges designed specifically for MacBooks, iPads, mirrorless camera rigs, and drone bodies.',
      qrCode: 'FDX-9375-DEC',
    },
    {
      id: 'FDX-PET-904',
      name: 'Waterproof Pet Collar Recovery Medal',
      category: 'Dogs & Cats',
      badge: 'Hypoallergenic Silicone',
      price: 1799,
      originalPrice: 2199,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80',
      specs: [
        { label: 'Material', value: 'Food-Grade Silicone + Alloy' },
        { label: 'Waterproof', value: 'IP68 Mud & River Proof' },
        { label: 'Acoustics', value: '100% Silent (No Jingle)' },
        { label: 'Weight', value: 'Ultra-Light 9 Grams' },
      ],
      description: 'Flexible, bite-resistant collar medal. Silent on pets with instant WhatsApp relay so finders can safely return your lost pet.',
      qrCode: 'FDX-PET-904',
    },
  ];

  const current = hardwareProducts[selectedTagIdx];

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      
      {/* Main Hardware Showcase Card */}
      <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-xl rounded-3xl space-y-5">
        
        {/* Top Product Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          {hardwareProducts.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedTagIdx(idx)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer truncate ${
                selectedTagIdx === idx
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {idx === 0 ? 'Titanium Tag' : idx === 1 ? 'Tech Decals' : 'Pet Medal'}
            </button>
          ))}
        </div>

        {/* Product Visual & Header Info */}
        <div className="space-y-3">
          <div className="relative w-full h-52 sm:h-56 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden group">
            <img 
              src={current.image} 
              alt={current.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Top Badge */}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white/95 text-cyan-800 border border-cyan-200 shadow-sm backdrop-blur-md">
                {current.badge}
              </span>
            </div>

            {/* Bottom Floating Spec Pill */}
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-900/85 text-white backdrop-blur-md shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Zero-Leak Routing Active
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
              <span>{current.category}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                In Stock · Ready to Ship
              </span>
            </div>
            <h3 className="text-lg font-display font-extrabold text-slate-900 leading-snug">
              {current.name}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {current.description}
            </p>
          </div>
        </div>

        {/* Engineering Specifications Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {current.specs.map((s, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                {s.label}
              </span>
              <span className="text-xs font-bold text-slate-800 block truncate mt-0.5">
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* Real Functional QR Preview Banner */}
        <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Real Visual QR Matrix graphic */}
            <div className="w-12 h-12 rounded-xl bg-white border border-cyan-200 p-1 flex items-center justify-center shrink-0 shadow-sm">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                <rect x="5" y="5" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="13" y="13" width="10" height="10" rx="1" fill="currentColor" />
                <rect x="69" y="5" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="77" y="13" width="10" height="10" rx="1" fill="currentColor" />
                <rect x="5" y="69" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="6" />
                <rect x="13" y="77" width="10" height="10" rx="1" fill="currentColor" />
                <rect x="38" y="10" width="7" height="7" rx="1.5" />
                <rect x="49" y="20" width="7" height="7" rx="1.5" />
                <rect x="38" y="38" width="7" height="7" rx="1.5" />
                <rect x="49" y="49" width="8" height="8" rx="2" fill="#0891b2" />
                <rect x="10" y="44" width="7" height="7" rx="1.5" />
                <rect x="74" y="44" width="7" height="7" rx="1.5" />
                <rect x="38" y="74" width="7" height="7" rx="1.5" />
                <rect x="74" y="74" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Live Dynamic QR Matrix
              </span>
              <span className="text-[11px] text-slate-600 block">
                ID: <strong className="font-mono text-cyan-800">{current.qrCode}</strong> · Scans with any phone
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/scan?code=${current.qrCode}`)}
            className="px-3 py-1.5 rounded-xl bg-white border border-cyan-300 text-cyan-800 hover:bg-cyan-100 text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <span>Test Resolution</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pricing & Order CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-700">
                PKR {current.price.toLocaleString()}
              </span>
              <span className="text-xs text-slate-400 line-through font-mono">
                PKR {current.originalPrice.toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium block">
              Free Express Courier in Pakistan
            </span>
          </div>

          <Link to="/store">
            <Button variant="primary" size="md" className="font-bold text-xs sm:text-sm shadow-md">
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              <span>Order on Store</span>
            </Button>
          </Link>
        </div>

      </Card>

      {/* Quick Trust Guarantee Callout Below Card */}
      <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600 px-4">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-cyan-600" />
          Zero-Leak Privacy Routing Guarantee
        </span>
        <span className="font-mono text-[11px] font-bold text-slate-700">
          AES-256 Cloud
        </span>
      </div>

    </div>
  );
};

export default HeroHardwareShowcase;

