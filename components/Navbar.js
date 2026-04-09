'use client';

import { Menu, Search, Sun, Moon, Bell, Settings, LogOut, ShieldCheck, UserPlus, UserMinus, Loader2, Trash2, X, BellRing } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

export default function Navbar({ onMenuClick, pageTitle }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const { socket, unreadCount, notifications, setNotifications, removeNotification, readAllNotifications, clearNotifications } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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

  // Unified Follow Logic
  const handleFollowAction = async (targetId, action) => {
    const targetIdStr = targetId.toString();
    const isFollow = action === 'follow';
    
    setSearchResults(prev => prev.map(u => u.id === targetIdStr ? { ...u, isFollowing: isFollow } : u));
    setNotifications(prev => prev.map(n => n.senderId === targetIdStr ? { ...n, isFollowingSender: isFollow } : n));

    try {
      if (isFollow) {
        await api.post(`/user/follow/${targetIdStr}`);
        if (socket) socket.emit('follow_user', { followingId: targetIdStr });
      } else {
        await api.delete(`/user/unfollow/${targetIdStr}`);
      }
    } catch (err) {
      console.error(`${action} action failed:`, err);
      setSearchResults(prev => prev.map(u => u.id === targetIdStr ? { ...u, isFollowing: !isFollow } : u));
      setNotifications(prev => prev.map(n => n.senderId === targetIdStr ? { ...n, isFollowingSender: !isFollow } : n));
    }
  };

  const handleNotificationClick = (n) => {
    setIsBellOpen(false);
    if (n.type === 'CHAT') {
      router.push(`/messages?userId=${n.senderId}`);
    } else if (n.type === 'FOLLOW') {
      router.push(`/profile/${n.senderId}`);
    }
  };

  if (!mounted) return null;

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border sticky top-0 z-30 transition-colors">
      
      {/* 1. Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 bg-card z-[60] flex items-center px-4 gap-3 border-b border-primary/20 shadow-xl"
          >
             <button onClick={() => { setIsMobileSearchOpen(false); setShowResults(false); }} className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all">
                <X className="w-5 h-5" />
             </button>
             <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-muted/80 border border-border/50 focus-within:border-primary/50 transition-all">
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4 text-muted-foreground" />}
                <input
                  type="text" autoFocus placeholder="Search users..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-base placeholder-muted-foreground/50 w-full text-foreground"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Menu Button & Brand Title */}
      <div className={`flex items-center gap-3 ${isMobileSearchOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'} transition-all duration-300`}>
        <button onClick={onMenuClick} className="lg:hidden p-2.5 rounded-2xl text-muted-foreground hover:bg-muted transition-colors active:scale-90">
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-lg md:text-xl font-black tracking-tight text-foreground truncate max-w-[120px] sm:max-w-none">{pageTitle}</span>
      </div>

      {/* 3. Desktop Search Container */}
      <div className="hidden md:flex flex-col relative w-max max-w-md">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-muted transition-colors">
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4 text-muted-foreground" />}
          <input
            type="text" placeholder="Search users..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            className="bg-transparent border-none outline-none text-sm placeholder-muted-foreground w-64 text-foreground"
          />
        </div>
      </div>

      {/* 4. Global Action Icons */}
      <div className={`flex items-center gap-2 sm:gap-4 ${isMobileSearchOpen ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'} transition-all duration-300`}>
        {/* Mobile Search Toggle Button */}
        <button onClick={() => setIsMobileSearchOpen(true)} className="md:hidden p-2.5 rounded-2xl text-muted-foreground hover:bg-muted transition-all">
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-2xl text-muted-foreground hover:bg-muted transition-all duration-200">
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button onClick={() => setIsBellOpen(!isBellOpen)} className={`p-2.5 rounded-2xl transition-all duration-200 ${isBellOpen ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-muted-foreground hover:bg-muted'}`}>
            <Bell className={`w-5 h-5 ${unreadCount > 0 && !isBellOpen ? 'animate-bounce' : ''}`} />
            {unreadCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 text-[10px] font-bold flex items-center justify-center ${isBellOpen ? 'bg-white text-primary border-primary' : 'bg-rose-500 text-white border-card'}`}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {isBellOpen && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setIsBellOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-[80]"
                >
                  <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-black uppercase tracking-tight">Notifications</h3>
                    </div>
                    {notifications.length > 0 && (
                      <div className="flex items-center gap-4">
                        <button onClick={readAllNotifications} className="text-[10px] font-black uppercase text-primary hover:underline">Mark all read</button>
                        <button onClick={clearNotifications} className="text-[10px] font-bold uppercase text-muted-foreground hover:text-rose-500 flex items-center gap-1"><Trash2 className="w-3 h-3" /> Clear</button>
                      </div>
                    )}
                  </div>
                  
                  <div className="max-h-[450px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent">
                    {notifications.length === 0 ? (
                      <div className="p-12 text-center flex flex-col items-center gap-3">
                         <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center"><Bell className="w-6 h-6 text-muted-foreground/30" /></div>
                         <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {notifications.map((n) => (
                          <div key={n.id} onClick={() => handleNotificationClick(n)} className="p-4 hover:bg-muted/50 transition-all group relative cursor-pointer">
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-primary animate-pulse'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground leading-relaxed pr-6">{n.content}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  {n.type === 'FOLLOW' && n.senderId && (
                                    <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
                                      <button 
                                        onClick={() => handleFollowAction(n.senderId, n.isFollowingSender ? 'unfollow' : 'follow')}
                                        className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight transition-all ${n.isFollowingSender ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                                      >
                                        {n.isFollowingSender ? 'Unfollow' : 'Follow Back'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }} className="absolute right-3 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 5. Global Search Results (Fixed positioning for mobile/desktop harmony) */}
      <AnimatePresence>
        {(showResults || (isMobileSearchOpen && searchQuery.length >= 2)) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => { setShowResults(false); setIsMobileSearchOpen(false); }} 
              className="fixed inset-0 z-[65] bg-black/40 md:bg-transparent" 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-16 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-80 mt-3 p-2.5 bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden max-h-[70vh] md:max-h-[350px] overflow-y-auto z-[70] scrollbar-thin"
            >
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm font-medium italic">No matches found for your search</div>
              ) : (
                <div className="grid gap-2">
                  {searchResults.map(result => (
                    <div key={result.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/80 transition-all border border-transparent hover:border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary/20 to-indigo-500/20 flex items-center justify-center text-primary font-black text-sm border border-primary/10 uppercase">
                          {(result.name || result.email).charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground leading-none truncate">{result.name || result.email.split('@')[0]}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 font-medium truncate">{result.email}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleFollowAction(result.id, result.isFollowing ? 'unfollow' : 'follow')} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest flex-shrink-0 ${result.isFollowing ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95'}`}
                      >
                        {result.isFollowing ? 'Unfollow' : (result.followsMe ? 'Follow Back' : 'Follow')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </header>
  );
}
