import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { CartDrawer } from './CartDrawer';

export const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 relative selection:bg-cyan-500/20 selection:text-cyan-800 pb-20 md:pb-0 overflow-x-hidden">
      
      {/* Background subtle light ambient gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-cyan-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[650px] h-[400px] bg-teal-500/5 blur-[160px] rounded-full" />
      </div>

      {/* Top Sticky Glassmorphic Navbar */}
      <Navbar />

      {/* Cart Drawer Slide-over */}
      <CartDrawer />

      {/* Main Page Body Container */}
      <main className="flex-grow z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Floating Bottom App Bar */}
      <MobileNav />
    </div>
  );
};

export default AppLayout;
