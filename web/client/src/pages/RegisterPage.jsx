import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import {
  Lock, Mail, User, ArrowRight,
  AlertCircle, CheckCircle, RefreshCw, ShieldCheck,
  Eye, EyeOff, Loader2, XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { GoogleAuthButton } from '../components/auth/GoogleAuthButton';
import api from '../services/api';

// ── EmailJS Constants ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '';

const OTP_LENGTH          = 6;
const OTP_EXPIRY_SECONDS  = 300; // 5 minutes
const RESEND_COOLDOWN_SEC = 60;
const MAX_WRONG_ATTEMPTS  = 3;

// ── Helpers ───────────────────────────────────────────────────────
const generateOTP = (n = OTP_LENGTH) =>
  Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

const formatCountdown = (sec) =>
  `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

// ── Custom field component for light theme ────────────────────────
const Field = ({ label, type, placeholder, value, onChange, icon: Icon, rightEl, error, required, minLength }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-700 block">{label}</label>
    <div className={`relative flex items-center bg-slate-50 border rounded-xl transition-colors focus-within:border-cyan-600 focus-within:bg-white ${error ? 'border-red-400' : 'border-slate-300'}`}>
      {Icon && <Icon className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        className={`w-full py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none ${Icon ? 'pl-10' : 'pl-4'} ${rightEl ? 'pr-10' : 'pr-4'}`}
      />
      {rightEl && <div className="absolute right-3">{rightEl}</div>}
    </div>
    {error && (
      <p className="text-[11px] text-red-600 flex items-center gap-1">
        <XCircle className="w-3 h-3 shrink-0" />{error}
      </p>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────────
export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // Step 1 fields
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Field-level errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Global error / step
  const [step,        setStep]        = useState(1);
  const [globalError, setGlobalError] = useState('');
  const [isSending,   setIsSending]   = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // OTP state
  const [otpDigits,     setOtpDigits]     = useState(Array(OTP_LENGTH).fill(''));
  const [storedOtp,     setStoredOtp]     = useState('');
  const [otpExpiry,     setOtpExpiry]     = useState(0);
  const [countdown,     setCountdown]     = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [resendIn,      setResendIn]      = useState(0);

  const otpRefs = useRef([]);

  // ── OTP countdown tick ────────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    const tick = setInterval(() => {
      setCountdown(Math.max(0, Math.round((otpExpiry - Date.now()) / 1000)));
      setResendIn((p) => Math.max(0, p - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [step, otpExpiry]);

  // ── Field-level validation ────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Full name is required';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) errs.email = 'Email address is required';
    else if (!emailRegex.test(email.trim())) errs.email = 'Please enter a valid email address';

    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';

    if (!confirmPass) errs.confirmPass = 'Please confirm your password';
    else if (password !== confirmPass) errs.confirmPass = 'Passwords do not match';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Send OTP via EmailJS ──────────────────────────────────────
  const sendEmailOtp = async (targetEmail, otpCode) => {
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      console.warn('[Findix OTP] EmailJS not fully configured — auto-bypassing for dev:', otpCode);
      return;
    }

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: targetEmail,
        to_name:  name.trim(),
        otp_code: otpCode,
        app_name: 'Findix Cloud',
      },
      EMAILJS_PUBLIC_KEY,
    );
  };

  // ── Handle Step 1 Submit ─────────────────────────────────────
  const handleSendCode = async (e) => {
    e.preventDefault();
    setGlobalError('');
    if (!validate()) return;

    setIsSending(true);
    try {
      // 1. Check if email is already taken
      const checkRes = await api.post('/auth/check-email', { email: email.trim().toLowerCase() });
      if (checkRes.data?.exists) {
        setFieldErrors((p) => ({ ...p, email: 'An account with this email already exists' }));
        setIsSending(false);
        return;
      }

      // 2. Generate OTP & expiry
      const otp = generateOTP();
      const expiry = Date.now() + OTP_EXPIRY_SECONDS * 1000;
      setStoredOtp(otp);
      setOtpExpiry(expiry);
      setCountdown(OTP_EXPIRY_SECONDS);
      setWrongAttempts(0);
      setResendIn(RESEND_COOLDOWN_SEC);

      // 3. Dispatch OTP
      await sendEmailOtp(email.trim(), otp);

      // 4. Advance to Step 2
      setStep(2);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setGlobalError(err.response?.data?.message || err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ── Resend Code ──────────────────────────────────────────────
  const handleResend = async () => {
    if (resendIn > 0 || isSending) return;
    setGlobalError('');
    setIsSending(true);

    try {
      const otp = generateOTP();
      const expiry = Date.now() + OTP_EXPIRY_SECONDS * 1000;
      setStoredOtp(otp);
      setOtpExpiry(expiry);
      setCountdown(OTP_EXPIRY_SECONDS);
      setWrongAttempts(0);
      setResendIn(RESEND_COOLDOWN_SEC);

      await sendEmailOtp(email.trim(), otp);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
    } catch (err) {
      setGlobalError('Failed to resend code. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ── OTP input box handlers ───────────────────────────────────
  const handleOtpChange = (index, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...otpDigits];
    next[index] = char;
    setOtpDigits(next);

    if (char && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtpDigits(next);

    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
  };

  // ── Step 2: Verify OTP & finalize registration ───────────────
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setGlobalError('');

    const entered = otpDigits.join('');
    if (entered.length < OTP_LENGTH) {
      setGlobalError('Please enter all 6 digits of your verification code');
      return;
    }

    if (Date.now() > otpExpiry) {
      setGlobalError('Verification code has expired. Please request a new one.');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      return;
    }

    // Dev bypass check
    const bypassAllowed = (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID);
    if (entered !== storedOtp && !bypassAllowed) {
      const attempts = wrongAttempts + 1;
      setWrongAttempts(attempts);
      if (attempts >= MAX_WRONG_ATTEMPTS) {
        setGlobalError('Too many incorrect attempts. Please restart registration.');
        setStep(1);
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        setStoredOtp('');
        return;
      }
      setGlobalError(`Incorrect code. ${MAX_WRONG_ATTEMPTS - attempts} attempt${MAX_WRONG_ATTEMPTS - attempts === 1 ? '' : 's'} remaining.`);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      return;
    }

    // OTP correct → create account
    setIsVerifying(true);
    try {
      await register(name.trim(), email.trim(), password);
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setGlobalError(err.response?.data?.message || err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const filledCount = otpDigits.filter(Boolean).length;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* ── Logo + Heading ── */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-cyan-50 p-1 mx-auto border border-cyan-200 shadow-sm flex items-center justify-center">
            <img src="/logo.png" alt="Findix" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
            {step === 1 ? 'Create Findix Account' : 'Verify Your Email'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {step === 1 ? 'Activate smart recovery tags for all your valuables.' : (
              <>We sent a 6-digit code to <strong className="text-cyan-700">{email}</strong></>
            )}
          </p>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-2">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all ${
                  step > s  ? 'bg-cyan-600 border-cyan-600 text-white'
                  : step === s ? 'border-cyan-600 text-cyan-700 bg-cyan-50'
                  : 'border-slate-300 text-slate-400 bg-white'
                }`}>
                  {step > s ? <CheckCircle className="w-3.5 h-3.5" /> : s}
                </div>
                <span className="hidden sm:inline">{s === 1 ? 'Your Details' : 'Verify Email'}</span>
              </div>
              {s < 2 && <div className={`flex-1 h-px transition-colors ${step > 1 ? 'bg-cyan-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── Card ── */}
        <Card className="p-6 sm:p-8 bg-white border-slate-200 space-y-5 shadow-xl rounded-3xl">

          {/* Global error banner */}
          {globalError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{globalError}</span>
            </div>
          )}

          {/* ══════════ STEP 1 ══════════ */}
          {step === 1 && (
            <>
              <div className="space-y-3">
                <GoogleAuthButton text="Sign up with Google" />
                <div className="relative flex items-center justify-center py-2">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                    or sign up with email
                  </span>
                  <div className="border-t border-slate-200 w-full" />
                </div>
              </div>

              <form onSubmit={handleSendCode} className="space-y-4" noValidate>
                <Field
                  label="Full Name"
                  type="text"
                  placeholder="Hamza Ahmed"
                  icon={User}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setFieldErrors((p) => ({ ...p, name: '' })); }}
                  error={fieldErrors.name}
                  required
                />

                <Field
                  label="Email Address"
                  type="email"
                  placeholder="hamza@example.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                  error={fieldErrors.email}
                  required
                />

                <Field
                  label="Password (min 6 characters)"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={Lock}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: '' })); }}
                  error={fieldErrors.password}
                  required
                  minLength={6}
                  rightEl={
                    <button type="button" onClick={() => setShowPass((v) => !v)} className="text-slate-400 hover:text-slate-600 cursor-pointer" tabIndex={-1}>
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Field
                  label="Confirm Password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  icon={Lock}
                  value={confirmPass}
                  onChange={(e) => { setConfirmPass(e.target.value); setFieldErrors((p) => ({ ...p, confirmPass: '' })); }}
                  error={fieldErrors.confirmPass}
                  required
                  rightEl={
                    <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-slate-400 hover:text-slate-600 cursor-pointer" tabIndex={-1}>
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                {/* Info notice */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-cyan-50 border border-cyan-200">
                  <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    A <strong className="text-slate-800">6-digit verification code</strong> will be sent to your email. Enter it in the next step to activate your account.
                  </p>
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full font-bold shadow-md" isLoading={isSending} disabled={isSending}>
                  {isSending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking &amp; Sending…</>
                    : <><Mail className="w-4 h-4" /> Send Verification Code</>
                  }
                </Button>
              </form>
            </>
          )}

          {/* ══════════ STEP 2 ══════════ */}
          {step === 2 && (
            <form onSubmit={handleVerifyAndRegister} className="space-y-5" noValidate>

              {/* 6 OTP Boxes */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-700 block text-center">
                  Enter the 6-digit code from your email
                </label>

                <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{ width: '2.75rem', height: '3.5rem' }}
                      className={`text-center text-2xl font-bold rounded-xl border-2 bg-slate-50 text-slate-900 focus:outline-none transition-all cursor-text
                        ${digit ? 'border-cyan-600 text-cyan-700 bg-white' : 'border-slate-300 focus:border-cyan-600'}
                        ${globalError && !digit ? 'border-red-400' : ''}
                      `}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                {/* Fill progress dots */}
                <div className="flex justify-center gap-1.5">
                  {otpDigits.map((d, i) => (
                    <div key={i} className={`h-1 w-5 rounded-full transition-all ${d ? 'bg-cyan-600' : 'bg-slate-200'}`} />
                  ))}
                </div>
              </div>

              {/* Timer + Resend row */}
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center gap-1.5 font-mono font-semibold ${countdown < 60 && countdown > 0 ? 'text-red-600' : countdown === 0 ? 'text-slate-400' : 'text-slate-600'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${countdown > 0 ? (countdown < 60 ? 'bg-red-500' : 'bg-cyan-600') : 'bg-slate-300'}`} />
                  {countdown > 0 ? `Expires in ${formatCountdown(countdown)}` : 'Code expired'}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendIn > 0 || isSending}
                  className={`flex items-center gap-1 font-semibold transition-colors ${resendIn > 0 || isSending ? 'text-slate-400 cursor-not-allowed' : 'text-cyan-700 hover:text-cyan-800 cursor-pointer'}`}
                >
                  <RefreshCw className="w-3 h-3" />
                  {resendIn > 0 ? `Resend in ${resendIn}s` : isSending ? 'Sending…' : 'Resend Code'}
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md"
                disabled={filledCount < OTP_LENGTH || isVerifying || countdown === 0}
                isLoading={isVerifying}
              >
                {isVerifying
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</>
                  : <><CheckCircle className="w-4 h-4" /> Verify &amp; Create Account</>
                }
              </Button>

              <button
                type="button"
                onClick={() => { setStep(1); setGlobalError(''); setOtpDigits(Array(OTP_LENGTH).fill('')); }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
              >
                ← Back to edit details
              </button>
            </form>
          )}

          {/* Footer link */}
          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
            Already have an account?{' '}
            <Link to={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"} className="text-cyan-700 font-bold hover:underline">
              Sign in
            </Link>
          </div>

        </Card>
      </div>
    </div>
  );
};
