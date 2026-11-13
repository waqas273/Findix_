import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-slate-300 border-t-cyan-600 animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Verifying Security Clearance...
        </span>
      </div>
    );
  }

  // Gate 1: Not Authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Gate 2: Not an Administrator
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20 animate-fade-in">
        <Card className="p-8 sm:p-10 bg-white border-red-200 shadow-xl space-y-6 text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600 shadow-sm animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-[11px] font-mono font-bold border border-red-200">
              <Lock className="w-3.5 h-3.5" /> ACCESS DENIED // 403 FORBIDDEN
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
              Administrative Clearance Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              The Findix Management Portal and Factory Production Hub is restricted exclusively to authorized system administrators.
            </p>
          </div>

          {/* Security Audit Session Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
              Security Session Audit
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Signed In As:</span>
              <span className="font-mono font-bold text-slate-900">{user?.email || 'Authenticated User'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Account Role:</span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-200 text-slate-800">
                {user?.role?.toUpperCase() || 'BUYER'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Required Privilege:</span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-cyan-100 text-cyan-800">
                ADMIN (LEVEL 4)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/dashboard">
              <Button variant="primary" size="md" className="w-full sm:w-auto font-bold shadow-md">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Return to Dashboard</span>
              </Button>
            </Link>

            <Link to="/contact">
              <Button variant="outline" size="md" className="w-full sm:w-auto border-slate-300">
                <Mail className="w-4 h-4 mr-1.5" />
                <span>Contact Administrator</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="md"
              onClick={logout}
              className="text-slate-500 hover:text-slate-800"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              <span>Sign Out</span>
            </Button>
          </div>

        </Card>
      </div>
    );
  }

  // Gate Passed: Verified Administrator
  return children;
};

export default AdminRoute;
