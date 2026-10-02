import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, LayoutDashboard, History, User,
  LogOut, Info, Home as HomeIcon, ShieldCheck, Sparkles
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Layout({ children, user, onLogout }: { children: React.ReactNode, user: any, onLogout: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Ensure Dark Mode & CSS Variables
    document.documentElement.style.setProperty('--color-brand-primary', '#3b82f6');
    document.documentElement.style.setProperty('--color-brand-secondary', '#2563eb');
    document.body.style.background = 'radial-gradient(circle at top left, #0f172a, #1e293b) fixed';
    document.body.style.color = '#e2e8f0';
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'About', path: '/about', icon: Info },
  ];

  const authLinks = [];
  if (user) {
    authLinks.push(
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Live Health Agent', path: '/live-agent', icon: Sparkles },
      { name: 'History', path: '/history', icon: History },
      { name: 'Profile', path: '/profile', icon: User }
    );
    if (user.role === 'admin' || user.role === 'superadmin' || user.role === 'super_admin') {
      authLinks.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
    }
  }

  // Check if current route has dedicated full-screen workspace
  const isDashboardOrAdmin = location.pathname === '/dashboard' || location.pathname === '/admin' || location.pathname === '/live-agent';

  return (
    <div className="min-h-screen">
      {/* 3D Background effect */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-blue-500/10 animate-pulse" 
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] bg-blue-600/10 animate-pulse" 
          style={{ animationDelay: '2s' }} 
        />
      </div>

      {/* Navbar (Only rendered on public pages, hidden on Dashboard and Admin Panel) */}
      {!isDashboardOrAdmin && (
        <nav className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "py-4 bg-slate-900/60 backdrop-blur-xl border-b border-white/5" : "py-6 bg-transparent"
        )}>
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg bg-blue-600 shadow-blue-500/30 transition-transform group-hover:scale-110">
                <span className="text-white font-bold text-xs">H+</span>
              </div>
              <span className="text-xl font-bold tracking-tight font-display">Health.ai</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {[...navLinks, ...authLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "transition-colors duration-300",
                    location.pathname === link.path ? "text-blue-400 font-bold" : "text-slate-300 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold">{user.name}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{user.role === 'admin' ? 'SYSTEM ADMIN' : 'PRO USER'}</span>
                  </div>
                  <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-blue-500/50 p-0.5 bg-slate-800 hover:scale-105 transition-transform overflow-hidden">
                     <img src={user.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="w-full h-full rounded-full" alt="Avatar" />
                  </Link>
                  <button 
                    onClick={onLogout}
                    className="p-2 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="px-6 py-2.5 text-white rounded-xl text-sm font-bold transition-all shadow-xl bg-blue-600 hover:bg-blue-500 shadow-blue-500/25 hover:-translate-y-0.5 active:translate-y-0">
                  Sign In
                </Link>
              )}
            </div>

            <button className="md:hidden p-2 text-white/80" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Menu */}
      <AnimatePresence>
        {!isDashboardOrAdmin && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {[...navLinks, ...authLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xl font-medium flex items-center gap-4 active:scale-95 transition-transform"
                >
                  <link.icon className="w-6 h-6 text-blue-400" />
                  {link.name}
                </Link>
              ))}
              {user && (
                <button onClick={onLogout} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/10 text-xl font-medium text-red-500 flex items-center gap-4">
                  <LogOut className="w-6 h-6" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={cn(isDashboardOrAdmin ? "pt-0" : "pt-24")}>
        {children}
      </main>
    </div>
  );
}
