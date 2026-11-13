import React from 'react';
import { Shield, Award } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Hero3DKeychain = () => {
  return (
    <div className="relative w-full max-w-md mx-auto py-4 select-none">
      
      {/* Background Ambient Glow Behind Hardware Object */}
      <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-teal/5 to-transparent blur-[50px] rounded-full pointer-events-none" />

      {/* Titanium Keychain Card */}
      <div className="relative rounded-[28px] p-[1.5px] bg-gradient-to-b from-slate-700 via-slate-800 to-obsidian-950 shadow-2xl border border-slate-750/70">
        
        {/* Keychain Body */}
        <div className="relative rounded-[27px] bg-gradient-to-b from-[#141A23] via-[#0E131C] to-[#090C12] p-6 sm:p-7 overflow-hidden">
          
          {/* Metallic Texture Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,242,254,0.04),transparent_60%)] pointer-events-none" />
          
          {/* Top Key Ring Hole Simulation */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              {/* Outer Ring */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-600 p-[2px]">
                {/* Hole cutout */}
                <div className="w-full h-full rounded-full bg-obsidian-950 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-obsidian-900 border border-slate-800" />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">
                  FINDIX TITANIUM CNC
                </span>
                <span className="text-xs font-semibold text-white">GEN-4 MATTE TAG</span>
              </div>
            </div>

            <Badge variant="safe">
              RELAY ACTIVE
            </Badge>
          </div>

          {/* Center Laser-Etched QR Code Module */}
          <div className="my-6 relative flex flex-col items-center">
            
            {/* Outer Protective Rim */}
            <div className="relative p-4 rounded-2xl bg-obsidian-950 border border-slate-800">
              
              {/* Laser-Etched QR Code Graphic */}
              <div className="w-40 h-40 sm:w-44 sm:h-44 relative rounded-xl p-2 bg-[#0A0E17] border border-slate-800 flex items-center justify-center">
                
                {/* High-Contrast SVG QR Pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-neon-cyan fill-current">
                  {/* Top-Left Position Marker */}
                  <rect x="5" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
                  <rect x="13" y="13" width="10" height="10" rx="2" fill="currentColor" />
                  
                  {/* Top-Right Position Marker */}
                  <rect x="69" y="5" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
                  <rect x="77" y="13" width="10" height="10" rx="2" fill="currentColor" />
                  
                  {/* Bottom-Left Position Marker */}
                  <rect x="5" y="69" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="5" />
                  <rect x="13" y="77" width="10" height="10" rx="2" fill="currentColor" />

                  {/* Micro Data Matrix Points */}
                  <rect x="36" y="8" width="6" height="6" rx="1.5" />
                  <rect x="46" y="18" width="6" height="6" rx="1.5" />
                  <rect x="56" y="8" width="6" height="6" rx="1.5" />
                  
                  <rect x="36" y="38" width="6" height="6" rx="1.5" />
                  <rect x="46" y="48" width="8" height="8" rx="2" fill="#4FACFE" />
                  <rect x="58" y="38" width="6" height="6" rx="1.5" />

                  <rect x="8" y="44" width="6" height="6" rx="1.5" />
                  <rect x="18" y="54" width="6" height="6" rx="1.5" />

                  <rect x="68" y="44" width="6" height="6" rx="1.5" />
                  <rect x="78" y="54" width="6" height="6" rx="1.5" />
                  <rect x="88" y="44" width="6" height="6" rx="1.5" />

                  <rect x="36" y="68" width="6" height="6" rx="1.5" />
                  <rect x="48" y="78" width="6" height="6" rx="1.5" />
                  <rect x="58" y="88" width="6" height="6" rx="1.5" />
                  <rect x="78" y="78" width="6" height="6" rx="1.5" />
                </svg>

                {/* Central Circular Brand Emblem */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-obsidian-950 border border-slate-700/80 flex items-center justify-center shadow-lg p-1">
                    <img src="/logo.png" alt="Findix" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>

              </div>
            </div>

            {/* Tag ID Display */}
            <div className="mt-3 flex items-center gap-2 font-mono text-xs text-slate-300">
              <span className="text-slate-500">ID:</span>
              <span className="text-neon-cyan font-bold tracking-wider">FDX-7749-KEY</span>
            </div>
          </div>

          {/* Bottom Card Footer Details */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-neon-cyan" /> Zero-Leak Masking
            </span>
            <span className="text-neon-teal font-medium flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> PKR 5,000 Bounty
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
