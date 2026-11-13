import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { QrCode, Search, ShieldCheck, ArrowRight, Camera, Lock, LogIn, UserPlus, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PublicScanPage } from './PublicScanPage';

export const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const codeParam = searchParams.get('code');

  const [tagInput, setTagInput] = useState('');

  // If a code is provided in URL (e.g. from physical QR scan), render the PublicScanPage directly
  if (codeParam) {
    return <PublicScanPage />;
  }

  const handleManualResolve = (e) => {
    e.preventDefault();
    if (tagInput.trim()) {
      navigate(`/q/${encodeURIComponent(tagInput.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-mono font-semibold border border-cyan-200">
          <QrCode className="w-3.5 h-3.5" /> RECOVERY RESOLVER
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          Scan or Resolve Findix Tag
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
          Bind a newly purchased tag to your account or review active item resolution.
        </p>
      </div>

      {/* Visitor Access Gate vs Registered User Scanner */}
      {!isAuthenticated ? (
        <Card className="p-6 sm:p-8 bg-white border-slate-200 space-y-5 shadow-lg text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto text-cyan-600">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">Sign in to Use Tag Scanner</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Only registered account holders can scan, activate, and manage tags in their dashboard. Please sign in or create a free account to continue.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/login"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 text-white font-bold text-sm shadow-sm hover:shadow"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 border-cyan-600 text-cyan-700 font-bold text-sm hover:bg-cyan-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl">
            <HelpCircle className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-slate-900">Did you find someone's lost item?</strong> No login is needed! Just open your phone camera and scan the QR code printed on the physical tag directly to contact the owner anonymously.
            </p>
          </div>
        </Card>
      ) : (
        /* Registered User View */
        <Card className="p-6 sm:p-8 bg-white border-slate-200 space-y-5 shadow-md">
          <form onSubmit={handleManualResolve} className="space-y-4">
            <Input
              label="Tag Identifier (Printed on QR Tag)"
              placeholder="e.g. FDX-7749-KEY"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              icon={Search}
              required
              className="font-mono text-base tracking-wider uppercase bg-white border-slate-300"
            />

            <Button type="submit" variant="primary" size="lg" className="w-full font-bold">
              <span>Resolve Recovery Tag</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" /> Zero-Leak Relay Protection
            </span>
            <span className="font-mono text-[11px] text-cyan-700 font-bold">AES-256</span>
          </div>
        </Card>
      )}

      {/* Camera Scan Tip */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-2 text-xs text-slate-600 shadow-sm">
        <Camera className="w-5 h-5 text-cyan-600 mx-auto" />
        <p className="leading-relaxed">
          <b className="text-slate-900">Native Camera Tip:</b> You can always use your phone's default camera app to scan physical Findix QR codes directly. No external app installation needed.
        </p>
      </div>

    </div>
  );
};

export default ScanPage;
