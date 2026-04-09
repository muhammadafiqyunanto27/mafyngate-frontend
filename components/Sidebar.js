'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  MessageSquare,
  User,
  Calculator,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Messages', icon: MessageSquare, path: '/messages' },
  { name: 'Calculator', icon: Calculator, path: '/calculator' },
  { name: 'Settings', icon: Settings, path: '/profile' },
];

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!user) return null;

  const sidebarVariants = {
    expanded: { width: '250px', x: 0 },
    collapsed: { width: '72px', x: 0 },
    mobileClosed: { x: '-100%', width: '250px' },
    mobileOpen: { x: 0, width: '250px' }
  };

  return (
    <>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={isMobile ? (isMobileOpen ? 'mobileOpen' : 'mobileClosed') : (isCollapsed ? 'collapsed' : 'expanded')}
        variants={sidebarVariants}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
        className="fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border lg:relative shadow-2xl lg:shadow-none h-full overflow-x-hidden overflow-y-auto custom-scrollbar"
      >
        {/* Header Section: overflow-x hidden for both states */}
        <div 
          className="h-16 flex items-center px-4 border-b border-border flex-shrink-0 relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isCollapsed && !isMobile ? (
            /* COLLAPSED STATE: Centered Logo with Hover Toggle */
            <div 
              className="w-full h-full flex items-center justify-center cursor-pointer group"
              onClick={() => setIsCollapsed(false)}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isHovered ? (
                  <motion.div
                    key="toggle-icon"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="p-1.5 rounded-lg bg-primary/10 text-primary"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="logo-icon"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg flex-shrink-0"
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="absolute left-full ml-3 invisible group-hover:visible bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50 shadow-xl pointer-events-none whitespace-nowrap">
                 Expand
              </div>
            </div>
          ) : (
            /* EXPANDED STATE: Logo (left), Name, Toggle Button (right) */
            <div className="w-full flex items-center justify-between overflow-hidden">
               <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden min-w-0 max-w-full">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-foreground truncate select-none">
                    MafynGate
                  </span>
               </Link>

               {!isMobile && (
                 <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all duration-200 border border-transparent flex-shrink-0"
                  aria-label="Collapse"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
               )}
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-x-hidden overflow-y-auto py-6 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => isMobile && setIsMobileOpen(false)}
                className={`flex items-center h-12 transition-all duration-200 group relative overflow-hidden ${isCollapsed && !isMobile ? 'justify-center w-full px-0' : 'px-4 gap-3'} ${isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                )}
                
                <div className={`flex items-center justify-center flex-shrink-0 ${isCollapsed && !isMobile ? 'w-full h-full' : 'w-10 h-10'}`}>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:scale-105 transition-transform'}`} />
                </div>

                {(!isCollapsed || isMobile) && (
                  <span className="font-medium text-sm truncate whitespace-nowrap overflow-hidden">
                    {item.name}
                  </span>
                )}

                {(isCollapsed && !isMobile) && (
                  <div className="absolute left-full ml-3 invisible group-hover:visible bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50 shadow-xl pointer-events-none whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-border flex-shrink-0 bg-card/30 overflow-hidden">
           <div 
            className={`flex items-center h-12 rounded-xl overflow-hidden ${isCollapsed && !isMobile ? 'justify-center px-0' : 'px-2 gap-3'}`}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0 overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.avatar}`} 
                  className="w-full h-full object-cover"
                  alt={user.name || 'User'}
                />
              ) : (
                (user.name || user.email).charAt(0).toUpperCase()
              )}
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-xs font-bold truncate text-foreground uppercase tracking-widest leading-none mb-1">
                  {user.name || user.email.split('@')[0]}
                </p>
                <p className="text-[10px] text-muted-foreground truncate opacity-70">Authenticated</p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={`w-full flex items-center h-12 mt-2 transition-all duration-200 rounded-xl group relative overflow-hidden ${isCollapsed && !isMobile ? 'justify-center px-0' : 'px-4 gap-3'} text-destructive hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10`}
            aria-label="Sign out"
          >
            <div className={`flex items-center justify-center flex-shrink-0 ${isCollapsed && !isMobile ? 'w-full h-full' : 'w-10 h-10'}`}>
              <LogOut className="w-5 h-5 flex-shrink-0 opacity-80 group-hover:scale-105 transition-transform" />
            </div>
            {(!isCollapsed || isMobile) && (
              <span className="font-bold text-sm truncate whitespace-nowrap">Sign Out</span>
            )}
            {(isCollapsed && !isMobile) && (
               <div className="absolute left-full ml-3 invisible group-hover:visible bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50 shadow-xl pointer-events-none whitespace-nowrap">
                 Terminate
               </div>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
