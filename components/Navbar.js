'use client';

import { Menu, Search, Sun, Moon, Bell, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ onMenuClick, pageTitle }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount, requestNotificationPermission } = useSocket();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border sticky top-0 z-30 transition-colors">

      {/* Left section: Title & Mobile menu toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5 cursor-pointer" />
        </button>
        <span className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</span>
      </div>

      {/* Center: Search (Desktop only) */}
      <div className="hidden md:flex items-center gap-3 w-max max-w-md px-4 py-2 rounded-xl bg-muted transition-colors">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none outline-none text-sm placeholder-muted-foreground w-64 text-foreground"
        />
      </div>

      {/* Right section: Utilities */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>

        {/* Notifications */}
        <button 
          onClick={requestNotificationPermission}
          className="hidden sm:flex p-2 rounded-xl text-muted-foreground hover:bg-muted relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 border-2 border-card text-[10px] font-bold text-white flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </button>

        {/* Profile Dropdown Placeholder */}
        <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-2 pl-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
