import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs py-3.5 transition-colors z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Logo with Tagline */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-5 h-5 rounded-full bg-slate-50 p-0.5 border border-cyan-200 shrink-0 flex items-center justify-center">
              <img src="/logo.png" alt="Findix" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="font-display font-black text-sm tracking-wider text-slate-900">
              FIND<span className="text-cyan-600">IX</span>
            </span>
          </Link>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] text-slate-500 italic">
            Lost, but never gone.
          </span>
        </div>

        {/* Contact Button & All Rights */}
        <div className="flex items-center gap-3.5 text-[11px] text-slate-500">
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100/80 border border-cyan-200 transition-colors shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-600" />
            <span>Contact Us</span>
          </Link>
          <span>© {new Date().getFullYear()} Findix. All rights reserved.</span>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
