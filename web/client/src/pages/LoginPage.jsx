import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { QrCode, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const normalizedInputEmail = email.trim().toLowerCase();
      const res = await login(normalizedInputEmail, password);
      const user = res?.data?.user || res?.user;
      if (
        user?.role === 'admin' || 
        normalizedInputEmail === 'findix.qr@gmail.com' || 
        normalizedInputEmail === 'findlx.qr@gmail.com' ||
        normalizedInputEmail === 'admin@findix.pk'
      ) {
        navigate('/admin');
      } else if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-cyan-50 p-1 mx-auto border border-cyan-200 shadow-sm flex items-center justify-center">
            <img src="/logo.png" alt="Findix" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
            Access Findix Cloud
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Sign in to manage your active recovery tags and lost gear alerts.
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 bg-white border-slate-200 space-y-5 shadow-xl rounded-3xl">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Google One-Click OAuth Button */}
          <div className="space-y-3">
            <GoogleAuthButton text="Continue with Google" />
            
            {/* Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                or email session
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="findix.qr@gmail.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="primary" size="lg" className="w-full mt-2 font-bold shadow-md" isLoading={isLoading}>
              <span>Authenticate Session</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"} className="text-cyan-700 font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
};
