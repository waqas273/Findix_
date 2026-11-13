import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs py-5 transition-colors z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3.5">
        
        {/* Left: Brand & Copyright */}
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-full bg-slate-50 p-0.5 border border-cyan-200 shrink-0 flex items-center justify-center shadow-xs">
              <img src="/logo.png" alt="Findix" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="font-display font-black text-sm tracking-wider text-slate-900">
              FIND<span className="text-cyan-600">IX</span>
            </span>
          </Link>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} Findix. All rights reserved.
          </span>
        </div>

        {/* Center: Essential Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[11px] font-medium text-slate-600">
          <Link to="/store" className="hover:text-cyan-700 transition-colors">
            Store
          </Link>
          <Link to="/scan" className="hover:text-cyan-700 transition-colors">
            Scan Tag
          </Link>
          <Link to="/community" className="hover:text-cyan-700 transition-colors">
            Community
          </Link>
          <a
            href="mailto:findix.qr@gmail.com"
            className="hover:text-cyan-700 transition-colors flex items-center gap-1 text-slate-500"
          >
            <Mail className="w-3 h-3 text-cyan-600" />
            <span>findix.qr@gmail.com</span>
          </a>
        </div>

        {/* Right: Tagline / Status */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Laser Keychains & Weatherproof Stickers · Pakistan 🇵🇰</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
