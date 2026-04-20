'use client';

import { useState, useEffect } from 'react';
import { getMediaUrl } from '../lib/url';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  MessageSquare,
  User,
  Calculator,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Settings,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Messages', icon: MessageSquare, path: '/messages' },
  { name: 'Calculator', icon: Calculator, path: '/calculator' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();
  const { unreadChatsCount } = require('../context/SocketContext').useSocket();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
                    className="w-10 h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0"
                  >
                    <img src="/logo.png?v=2" alt="MafynGate" className="w-full h-full object-cover" />
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
                  <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                    <img src="/logo.png?v=2" alt="MafynGate" className="w-full h-full object-cover" />
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
                className={`flex items-center ${isMobile ? 'h-10' : 'h-12'} transition-all duration-200 group relative overflow-hidden ${isCollapsed && !isMobile ? 'justify-center w-full px-0' : 'px-4 gap-3'} ${isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                )}
                
                <div className={`flex items-center justify-center flex-shrink-0 ${isCollapsed && !isMobile ? 'w-full h-full' : (isMobile ? 'w-8 h-8' : 'w-10 h-10')}`}>
                  <Icon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:scale-105 transition-transform'}`} />
                </div>

                {(!isCollapsed || isMobile) && (
                  <span className="font-medium text-sm truncate whitespace-nowrap overflow-hidden flex-1">
                    {item.name}
                  </span>
                )}

                {item.name === 'Messages' && unreadChatsCount > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`flex items-center justify-center rounded-full bg-primary text-white font-black leading-none ${isCollapsed && !isMobile ? 'absolute top-2 right-2 w-4 h-4 text-[8px]' : 'w-5 h-5 text-[10px] mr-2 shadow-lg shadow-primary/20'}`}
                  >
                    {unreadChatsCount}
                  </motion.div>
                )}

                {(isCollapsed && !isMobile) && (
                  <div className="absolute left-full ml-3 invisible group-hover:visible bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50 shadow-xl pointer-events-none whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Background Health Check */}
          <div className={`mt-10 px-4 ${isCollapsed && !isMobile ? 'flex flex-col items-center' : ''}`}>
             {!isCollapsed || isMobile ? (
                <div className="p-4 rounded-3xl bg-muted/30 border border-border">
                   <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Background Sync</p>
                      <div className={`w-2 h-2 rounded-full animate-pulse ${typeof window !== 'undefined' && window.getMafynGatePushStatus && window.getMafynGatePushStatus() === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                   </div>
                   <p className="text-[11px] font-bold text-foreground mb-3 leading-tight">
                      {typeof window !== 'undefined' && window.getMafynGatePushStatus && window.getMafynGatePushStatus() === 'active' ? 'Gateway is Linked' : 'Push Disconnected'}
                   </p>
                   {typeof window !== 'undefined' && window.getMafynGatePushStatus && window.getMafynGatePushStatus() !== 'active' && (
                      <button 
                        onClick={() => window.resetMafynGatePush && window.resetMafynGatePush()}
                        className="w-full py-2 bg-primary text-white text-[10px] font-black rounded-xl hover:scale-105 active:scale-95 transition-all text-center uppercase tracking-widest"
                        title="Force Reset Background Sync"
                      >
                        Heal Connection
                      </button>
                   )}
                </div>
             ) : (
                <button 
                  onClick={() => window.requestMafynGateNotification && window.requestMafynGateNotification()}
                  className={`p-2.5 rounded-xl border border-border transition-all group relative ${typeof window !== 'undefined' && window.getMafynGatePushStatus && window.getMafynGatePushStatus() === 'active' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-500 bg-rose-500/10 animate-pulse'}`}
                >
                   <ShieldCheck className="w-5 h-5" />
                   <div className="absolute left-full ml-3 invisible group-hover:visible bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-50 shadow-xl pointer-events-none whitespace-nowrap">
                    Push Sync Status
                  </div>
                </button>
             )}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-3 border-t border-border flex-shrink-0 bg-card/30 overflow-hidden">


         <Link 
            href="/profile"
            className={`flex items-center ${isMobile ? 'h-9' : 'h-10'} rounded-xl overflow-hidden hover:bg-muted/50 transition-all cursor-pointer group/user ${isCollapsed && !isMobile ? 'justify-center px-0' : 'px-1.5 gap-2.5'}`}
          >
            <div className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0 overflow-hidden group-hover/user:scale-105 transition-transform`}>
              {user.avatar ? (
                <img 
                  src={getMediaUrl(user.avatar)} 
                  className="w-full h-full object-cover"
                  alt={user.name || 'User'}
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div className={`w-full h-full items-center justify-center ${user.avatar ? 'hidden' : 'flex'}`}>
                {(user.name || user.email || "?").charAt(0).toUpperCase()}
              </div>
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-[11px] font-extrabold truncate text-foreground uppercase tracking-tight leading-none mb-0.5 group-hover/user:text-primary transition-colors">
                  {user.name || user.email.split('@')[0]}
                </p>
                <p className="text-[9px] text-muted-foreground truncate opacity-70 uppercase tracking-tighter">Identity</p>
              </div>
            )}
          </Link>

          <button
            onClick={() => setShowLogoutModal(true)}
            className={`w-full flex items-center ${isMobile ? 'h-10' : 'h-12'} mt-2 transition-all duration-200 rounded-xl group relative overflow-hidden ${isCollapsed && !isMobile ? 'justify-center px-0' : 'px-4 gap-3'} text-destructive hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10`}
            aria-label="Sign out"
          >
            <div className={`flex items-center justify-center flex-shrink-0 ${isCollapsed && !isMobile ? 'w-full h-full' : (isMobile ? 'w-8 h-8' : 'w-10 h-10')}`}>
              <LogOut className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0 opacity-80 group-hover:scale-105 transition-transform`} />
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
      
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowLogoutModal(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="relative bg-card border border-border w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">Sign Out?</h2>
              <p className="text-sm text-muted-foreground mb-8">Are you sure you want to log out of your account?</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={logout} 
                  className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Yes, Sign Out
                </button>
                <button 
                  onClick={() => setShowLogoutModal(false)} 
                  className="w-full py-4 text-muted-foreground font-black uppercase tracking-widest text-xs hover:text-foreground transition-all"
                >
                  No, Stay Logged In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
