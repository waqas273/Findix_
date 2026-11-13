import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Store, 
  Home, 
  Package, 
  Users, 
  LogOut, 
  ShieldCheck, 
  QrCode,
  Globe,
  LayoutDashboard,
  MessageSquare,
  User,
  ChevronDown,
  ArrowRight,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useConfirm } from '../../context/ConfirmDialogContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount, openCart } = useCart();
  const { confirm } = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  const isAdmin = user?.role === 'admin' || user?.email === 'findix.qr@gmail.com';

  // Close profile menu on navigation
  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: 'Sign Out Confirmation',
      message: 'Are you sure you want to end your active Findix session?',
      confirmText: 'Sign Out',
      cancelText: 'Stay Signed In',
      variant: 'danger',
      iconType: 'logout',
    });

    if (isConfirmed) {
      logout();
      navigate('/');
    }
  };

  // 1. Admin Nav Links
  const adminNavLinks = [
    { name: 'Community', path: '/community', icon: Globe },
    { name: 'Manage Products', path: '/admin?tab=products', icon: Package },
    { name: 'Manage Users', path: '/admin?tab=users', icon: Users },
  ];

  // 2. Logged-in User Nav Links (Dashboard replaces Home)
  const loggedInUserNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Store', path: '/store', icon: Store },
    { name: 'Community', path: '/community', icon: Globe },
    { name: 'Scan Tag', path: '/scan', icon: QrCode },
  ];

  // 3. Guest / Visitor Nav Links
  const guestNavLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Store', path: '/store', icon: Store },
    { name: 'Community', path: '/community', icon: Globe },
    { name: 'Scan Tag', path: '/scan', icon: QrCode },
  ];

  const currentNavLinks = isAdmin 
    ? adminNavLinks 
    : isAuthenticated 
    ? loggedInUserNavLinks 
    : guestNavLinks;

  const checkIsActive = (linkPath) => {
    const currentFull = location.pathname + location.search;
    if (linkPath === '/') {
      return location.pathname === '/' && !location.search;
    }
    if (linkPath.includes('?')) {
      return currentFull === linkPath;
    }
    return location.pathname === linkPath || (linkPath === '/dashboard' && location.pathname.startsWith('/dashboard'));
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-slate-200/90 shadow-sm transition-all duration-300 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <Link 
            to={isAdmin ? "/admin?tab=products" : isAuthenticated ? "/dashboard" : "/"} 
            className="flex items-center gap-3 group shrink-0 focus:outline-none"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-50 p-0.5 border border-cyan-200 group-hover:border-cyan-400 shadow-sm transition-all duration-300 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Findix Logo" 
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300" 
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-xl tracking-wider text-slate-900 group-hover:text-cyan-600 transition-colors duration-200">
                  FIND<span className="text-cyan-600">IX</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                {isAdmin && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200">
                    ADMIN
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider -mt-1 hidden sm:block">
                {isAdmin ? 'Admin Console' : isAuthenticated ? 'Smart Recovery Platform' : 'Lost, but never gone'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {currentNavLinks.map((link) => {
              const isActive = checkIsActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-2 px-3.5 py-2 rounded-xl ${
                    isActive
                      ? 'text-cyan-700 bg-cyan-50 border border-cyan-200 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* 1. ADMIN MODE */}
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-mono text-[11px] text-slate-600">{user?.email || 'findix.qr@gmail.com'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : isAuthenticated ? (
              /* 2. LOGGED IN REGISTERED USER */
              <div className="flex items-center gap-3">
                
                {/* Cart Trigger */}
                <button
                  type="button"
                  onClick={openCart}
                  className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
                  aria-label="Open Cart"
                >
                  <ShoppingBag className="w-5 h-5 text-slate-700" />
                  {totalCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-cyan-600 to-teal-700 text-white text-[11px] font-extrabold flex items-center justify-center shadow-sm">
                      {totalCount}
                    </span>
                  )}
                </button>

                {/* Profile Pill & Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all text-xs text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-teal-600 p-[1px] shrink-0">
                      <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center text-cyan-700 font-bold text-xs">
                        {user?.avatar?.url ? (
                          <img src={user.avatar.url} alt="" className="w-full h-full object-cover rounded-[7px]" />
                        ) : (
                          user?.name ? user.name[0].toUpperCase() : 'U'
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-slate-900 max-w-[110px] truncate">{user?.name || 'My Account'}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Registered User</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 p-2 shadow-xl space-y-1 animate-scale-up z-50">
                      <div className="p-3 border-b border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">{user?.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
                            VERIFIED
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate font-mono">{user?.email}</span>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-cyan-600" />
                        <span>My Protected Tags</span>
                      </Link>

                      <Link
                        to="/dashboard/orders"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-teal-600" />
                        <span>Orders & Tracking</span>
                      </Link>

                      <Link
                        to="/dashboard/messages"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span>Finder Messages</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>Profile & Settings</span>
                      </Link>

                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleLogout();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Sign Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              /* 3. VISITOR / GUEST MODE */
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={openCart}
                  className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 mr-1 cursor-pointer"
                  aria-label="Open Cart"
                >
                  <ShoppingBag className="w-5 h-5 text-slate-600" />
                  {totalCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-cyan-600 to-teal-700 text-white text-[11px] font-extrabold flex items-center justify-center shadow-sm">
                      {totalCount}
                    </span>
                  )}
                </button>

                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all duration-200"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-600 to-teal-700 text-white hover:from-cyan-700 hover:to-teal-800 shadow-sm hover:shadow transition-all duration-200 hover:scale-[1.02]"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

          </div>

          {/* Mobile Right Bar: Only Cart Button (Bottom MobileNav handles all navigation) */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-cyan-600 to-teal-700 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
