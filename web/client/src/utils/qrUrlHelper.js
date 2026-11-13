/**
 * Dynamic QR Activation URL Helper
 * 
 * Determines the public URL for scanning and copying QR tags.
 * 
 * Hierarchy:
 * 1. VITE_PUBLIC_APP_URL from web/client/.env (if set, e.g. https://findix.pk)
 * 2. window.location.origin (automatically uses http://localhost:5173 or https://findix.vercel.app)
 * 3. Fallback: https://findix.vercel.app
 */
export const getQrActivationUrl = (slug) => {
  const envBase = import.meta.env?.VITE_PUBLIC_APP_URL;
  if (envBase && envBase.trim()) {
    return `${envBase.trim().replace(/\/+$/, '')}/q/${slug}`;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/q/${slug}`;
  }

  return `https://findix.vercel.app/q/${slug}`;
};

export default getQrActivationUrl;
