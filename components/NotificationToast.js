'use client';

import React from 'react';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, UserPlus, Bell } from 'lucide-react';

export const NotificationToast = () => {
  const { toast } = useSocket();

  if (!toast) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        className="fixed top-24 right-6 z-[9999] w-80"
      >
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-start gap-4">
          <div className={`p-2 rounded-xl flex-shrink-0 ${
            toast.type === 'CHAT' ? 'bg-primary/20 text-primary' : 
            toast.type === 'FOLLOW' ? 'bg-emerald-500/20 text-emerald-500' : 
            'bg-zinc-800 text-zinc-400'
          }`}>
            {toast.type === 'CHAT' ? <MessageSquare size={20} /> : 
             toast.type === 'FOLLOW' ? <UserPlus size={20} /> : 
             <Bell size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">
              {toast.type || 'Notification'}
            </p>
            <p className="text-sm text-white font-medium line-clamp-2">
              {toast.content}
            </p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse mt-1.5"></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
