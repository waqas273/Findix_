import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-full bg-obsidian-900 border border-slate-700/80 flex items-center justify-center mx-auto shadow-lg p-2.5">
          <img src="/logo.png" alt="Findix Logo" className="w-full h-full object-cover rounded-full" />
        </div>
        
        <div className="space-y-2">
          <span className="text-xs font-mono text-neon-cyan uppercase tracking-widest">Error 404</span>
          <h1 className="text-3xl font-display font-bold text-white">Route Not Found</h1>
          <p className="text-sm text-slate-400">
            This QR coordinate or page does not exist on the Findix network.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Safety
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
