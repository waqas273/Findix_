import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Store, QrCode, Users, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Store', path: '/store', icon: Store },
    { name: 'Scan Tag', path: '/scan', icon: QrCode, isFab: true },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Profile', path: isAuthenticated ? '/dashboard' : '/login', icon: isAuthenticated ? LayoutDashboard : User },
  ];

  return (
    <div className="md:hidden fixed bottom-3 left-4 right-4 z-40">
      {/* Floating Glass Pill Container */}
      <nav className="relative rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg px-3 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            // Central Floating Action Button (FAB)
            if (item.isFab) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className="relative -top-5 flex flex-col items-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-700 p-[1.5px] shadow-md active:scale-95 transition-all">
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-cyan-600 group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-700 mt-1 tracking-wide">
                    Scan
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? 'text-cyan-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800 active:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileNav;
