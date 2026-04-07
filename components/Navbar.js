'use client';

import { Menu, Search, Sun, Moon, Bell, Settings, LogOut, ShieldCheck, UserPlus, UserMinus, Loader2, Trash2, X, BellRing } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

export default function Navbar({ onMenuClick, pageTitle }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount, requestNotificationPermission, notifications, removeNotification, clearNotifications } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await api.get(`/user/search?q=${searchQuery}`);
          setSearchResults(res.data.data);
          setShowResults(true);
        } catch (err) {
          console.error('Search failed:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleFollow = async (userId) => {
    try {
      await api.post(`/user/follow/${userId}`);
      if (socket) {
        socket.emit('follow_user', { followingId: userId });
      }
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: true } : u));
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await api.delete(`/user/unfollow/${userId}`);
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, isFollowing: false } : u));
    } catch (err) {
      console.error('Unfollow failed:', err);
    }
  };

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
      <div className="hidden md:flex flex-col relative w-max max-w-md">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted transition-colors">
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4 text-muted-foreground" />}
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="bg-transparent border-none outline-none text-sm placeholder-muted-foreground w-64 text-foreground"
          />
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showResults && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowResults(false)}
                className="fixed inset-0 z-[-1]"
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-2 p-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-[300px] overflow-y-auto z-50"
              >
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">No accounts found</div>
                ) : (
                  <div className="grid gap-1">
                    {searchResults.map(result => (
                      <div key={result.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {result.name?.charAt(0).toUpperCase() || result.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground">{result.name || result.email.split('@')[0]}</span>
                        </div>
                        {result.isFollowing ? (
                          <button onClick={() => handleUnfollow(result.id)} className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:text-rose-500">
                            <UserMinus className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleFollow(result.id)} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
        <div className="relative">
          <button 
            onClick={() => setIsBellOpen(!isBellOpen)}
            className={`p-2 rounded-xl transition-all duration-200 ${isBellOpen ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-muted-foreground hover:bg-muted'}`}
          >
            <Bell className={`w-5 h-5 ${unreadCount > 0 && !isBellOpen ? 'animate-bounce' : ''}`} />
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 text-[10px] font-bold flex items-center justify-center ${isBellOpen ? 'bg-white text-primary border-primary' : 'bg-rose-500 text-white border-card'}`}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {isBellOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsBellOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-black uppercase tracking-tight">Notifications</h3>
                    </div>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-[10px] font-bold uppercase text-muted-foreground hover:text-rose-500 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center flex flex-col items-center gap-3">
                         <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                            <Bell className="w-6 h-6 text-muted-foreground/30" />
                         </div>
                         <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {notifications.map((n) => (
                          <div key={n.id} className="p-4 hover:bg-muted/50 transition-all group relative">
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-primary animate-pulse'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground leading-relaxed pr-6">{n.content}</p>
                                <p className="text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-tight">{new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeNotification(n.id)}
                              className="absolute right-3 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 border-t border-border bg-muted/10 text-center">
                     <button onClick={requestNotificationPermission} className="text-[10px] font-bold uppercase text-primary hover:underline">Enable Browser Notifications</button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

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
