'use client';

import { Menu, Search, Sun, Moon, Bell, Settings, LogOut, ShieldCheck, UserPlus, UserMinus, Loader2, Trash2, X, BellRing, Lock as LockIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
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

  const bellRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    
    // Optimistic Update for Search Results
    setSearchResults(prev => prev.map(u => {
      if (u.id === targetIdStr) {
        if (!isFollow) return { ...u, followStatus: 'NONE' };
        const newStatus = u.isPrivate && !u.followsMe ? 'PENDING' : 'ACCEPTED';
        return { ...u, followStatus: newStatus };
      }
      return u;
    }));

    // Optimistic Update for Notifications (Follow Back button)
    setNotifications(prev => prev.map(n => {
      if (n.senderId === targetIdStr && (n.type === 'FOLLOW' || n.type === 'CONNECTION_REQUEST')) {
        return { ...n, isMutual: isFollow };
      }
      return n;
    }));

    try {
      if (isFollow) {
        const res = await api.post(`/user/follow/${targetIdStr}`);
        const status = res.data.status;
        
        setSearchResults(prev => prev.map(u => u.id === targetIdStr ? { ...u, followStatus: status } : u));
        setNotifications(prev => prev.map(n => n.senderId === targetIdStr ? { ...n, isMutual: status === 'ACCEPTED' } : n));
        
        if (socket) socket.emit('follow_user', { followingId: targetIdStr });
      } else {
        await api.delete(`/user/unfollow/${targetIdStr}`);
      }
    } catch (err) {
      console.error(`${action} action failed:`, err);
      // Revert if failed
      setSearchResults(prev => prev.map(u => u.id === targetIdStr ? { ...u, followStatus: isFollow ? 'NONE' : 'ACCEPTED' } : u));
      setNotifications(prev => prev.map(n => n.senderId === targetIdStr ? { ...n, isMutual: !isFollow } : n));
    }
  };

  const handleNotificationClick = (n) => {
    setIsBellOpen(false);
    removeNotification(n.id); // Remove from list once clicked
    if (n.type === 'CHAT') {
      router.push(`/messages?userId=${n.senderId}`);
    } else if (n.type === 'FOLLOW' || n.type === 'CONNECTION_REQUEST' || n.type === 'CONNECTION_ACCEPTED') {
      router.push(`/profile/${n.senderId}`);
    }
  };

  if (!mounted) return null;

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-card border-b border-border sticky top-0 z-[100] transition-colors">
      
      {/* 1. Mobile Search Overlay */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 bg-card z-[1000] flex items-center px-4 gap-3 border-b border-primary/20 shadow-xl"
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
        <div className="relative" ref={bellRef}>
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
                  className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden z-[1000]"
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
                        {notifications.map((n, idx) => (
                          <div key={n.id || `notif-${idx}`} onClick={() => handleNotificationClick(n)} className="p-4 hover:bg-muted/50 transition-all group relative cursor-pointer">
                            <div className="flex gap-3">
                              <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.isRead ? 'bg-transparent' : 'bg-primary animate-pulse'}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground leading-relaxed pr-6">{n.content}</p>
                                <div className="flex items-center justify-between mt-1.5">
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  {n.senderId && (
                                    <div className="ml-auto flex gap-2" onClick={(e) => e.stopPropagation()}>
                                      {n.type === 'CONNECTION_REQUEST' && (
                                        <>
                                          <button 
                                            onClick={async () => {
                                              await api.post(`/user/requests/accept/${n.senderId}`);
                                              const senderName = n.content.split(' wants')[0] || 'A user';
                                              setNotifications(prev => prev.map(notif => 
                                                notif.id === n.id ? { ...notif, type: 'FOLLOW', content: `${senderName} is following you`, isMutual: notif.isFollowingSender || false } : notif
                                              ));
                                              setSearchResults(prev => prev.map(u => u.id === n.senderId ? { ...u, followStatus: 'ACCEPTED' } : u));
                                              if (socket) socket.emit('connection_update', { targetId: n.senderId, status: 'ACCEPTED' });
                                            }}
                                            className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md text-[9px] font-black uppercase hover:bg-emerald-500/20"
                                          >
                                            Accept
                                          </button>
                                          <button 
                                            onClick={async () => {
                                              await api.post(`/user/requests/decline/${n.senderId}`);
                                              removeNotification(n.id);
                                              setSearchResults(prev => prev.map(u => u.id === n.senderId ? { ...u, followStatus: 'NONE' } : u));
                                            }}
                                            className="px-2 py-1 bg-rose-500/10 text-rose-500 rounded-md text-[9px] font-black uppercase hover:bg-rose-500/20"
                                          >
                                            Decline
                                          </button>
                                        </>
                                      )}
                                      {n.type === 'FOLLOW' && (
                                        <button 
                                          onClick={() => handleFollowAction(n.senderId, n.isMutual ? 'unfollow' : 'follow')}
                                          className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tight transition-all ${n.isMutual ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                                        >
                                          {n.isMutual ? 'Unfollow' : 'Follow Back'}
                                        </button>
                                      )}
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

      </div>

      {/* 5. Global Search Results (Fixed positioning for mobile/desktop harmony) */}
      <AnimatePresence>
        {(showResults || (isMobileSearchOpen && searchQuery.length >= 2)) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => { setShowResults(false); setIsMobileSearchOpen(false); }} 
              className="fixed inset-0 z-[999] bg-black/40 md:bg-transparent" 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-16 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] mt-3 p-2.5 bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden max-h-[70vh] md:max-h-[450px] overflow-y-auto z-[1000] scrollbar-thin"
            >
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm font-medium italic">No matches found for your search</div>
              ) : (
                <div className="grid gap-2">
                  {searchResults.map((result) => (
                    <div 
                      key={result.id} 
                      onClick={() => { router.push(`/profile/${result.id}`); setSearchResults([]); setSearchQuery(''); }}
                      className="flex items-center justify-between p-3.5 hover:bg-muted/50 rounded-[1.5rem] cursor-pointer transition-all group/item border border-transparent hover:border-border/50"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary/20 to-indigo-500/20 flex items-center justify-center text-primary font-black text-sm border border-primary/10 uppercase group-hover/item:scale-105 transition-transform flex-shrink-0">
                          {result.avatar ? <img src={result.avatar.startsWith('http') ? result.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${result.avatar}`} className="w-full h-full object-cover rounded-2xl" /> : (result.name || result.email).charAt(0)}
                        </div>
                        <div className="min-w-0 font-sans">
                          <p className="text-sm font-bold text-foreground leading-none flex items-center gap-1 mb-1">
                            <span>{result.name || result.email.split('@')[0]}</span>
                            {result.isPrivate && <LockIcon size={10} className="text-amber-500" />}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-tighter italic">
                            {result.isPrivate && !result.isFollowing ? 'Shielded Identity' : result.email}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleFollowAction(result.id, result.followStatus === 'ACCEPTED' ? 'unfollow' : 'follow'); }} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest flex-shrink-0 ${result.followStatus === 'ACCEPTED' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : result.followStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95'}`}
                      >
                        {result.followStatus === 'ACCEPTED' ? 'Unfollow' : 
                         (result.followStatus === 'PENDING' ? 'Requested' : 
                          (result.followsMe ? 'Follow Back' : (result.isPrivate ? 'Connect' : 'Follow')))}
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
