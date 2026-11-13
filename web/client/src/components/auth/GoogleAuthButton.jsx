import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const GoogleAuthButton = ({ text = 'Continue with Google' }) => {
  const { googleLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      addToast('error', 'No Google credential received from authorization server');
      return;
    }

    setLoading(true);
    try {
      const res = await googleLogin(credentialResponse.credential);
      const user = res?.data?.user || res?.user;
      addToast('success', `Welcome back, ${user?.name || 'User'}!`);

      if (user?.role === 'admin' || user?.email === 'admin@findix.pk') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google login error:', err);
      const msg = err.response?.data?.message || err.message || 'Google authentication failed';
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.warn('Google Sign-In was cancelled or origin unverified');
    addToast('error', 'Google Sign-In failed. Please ensure localhost:5173 is added in Google Cloud Console.');
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-2">
      <div className="w-full relative flex justify-center">
        <div className="w-full overflow-hidden flex justify-center bg-obsidian-900/90 hover:bg-obsidian-850 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all shadow-md py-1 px-2">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            shape="pill"
            text="continue_with"
            logo_alignment="center"
          />
        </div>
      </div>
      {loading && (
        <span className="text-[11px] text-neon-cyan font-mono animate-pulse">
          Authenticating secure Google session...
        </span>
      )}
    </div>
  );
};
