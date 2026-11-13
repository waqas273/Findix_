/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme surfaces (replaces obsidian)
        surface: {
          950: '#ffffff',
          900: '#f8fafc',
          850: '#f1f5f9',
          800: '#e2e8f0',
          700: '#cbd5e1',
        },
        // Keep obsidian for backward compat but map to light
        obsidian: {
          950: '#ffffff',
          900: '#f8fafc',
          850: '#f1f5f9',
          800: '#e2e8f0',
          700: '#cbd5e1',
        },
        // Keep slate standard
        slate: {
          950: '#0F172A',
          900: '#1E293B',
          800: '#334155',
          700: '#475569',
          600: '#64748b',
          500: '#94a3b8',
          400: '#cbd5e1',
          300: '#e2e8f0',
          200: '#f1f5f9',
          100: '#f8fafc',
        },
        neon: {
          cyan: '#0891b2',    // Deep cyan - primary accent
          teal: '#0e7490',    // Darker teal
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cyan-gradient': 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
        'subtle-radial': 'radial-gradient(circle at top center, rgba(8, 145, 178, 0.06) 0%, rgba(248, 250, 252, 0) 70%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 4px 20px -4px rgba(8, 145, 178, 0.25)',
        'neon-sm': '0 2px 8px rgba(8, 145, 178, 0.15)',
        'glass': '0 4px 24px 0 rgba(0, 0, 0, 0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2.5s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(0%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
