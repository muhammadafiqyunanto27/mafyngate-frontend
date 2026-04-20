'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Shield, PhoneCall, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, requesting, success, error

  useEffect(() => {
    // Check if we should show the prompt
    // High-end logic: Only show if permission is 'default' and user has been on site for 2 seconds
    const checkStatus = () => {
      if (!('Notification' in window)) return;
      
      const hasIgnored = localStorage.getItem('mafyngate_notif_ignored');
      if (Notification.permission === 'default' && !hasIgnored) {
        setTimeout(() => setShow(true), 1500);
      }
    };

    checkStatus();
  }, []);

  const handleEnable = async () => {
    setStatus('requesting');
    try {
      if (window.requestMafynGateNotification) {
        await window.requestMafynGateNotification();
        setStatus('success');
        setTimeout(() => setShow(false), 2000);
      } else {
         // Fallback if global function not yet attached
         const permission = await Notification.requestPermission();
         if (permission === 'granted') {
             setStatus('success');
             setTimeout(() => setShow(false), 1000);
         } else {
             setStatus('error');
         }
      }
    } catch (err) {
      setStatus('error');
    }
  };

  const handleIgnore = () => {
    localStorage.setItem('mafyngate_notif_ignored', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10"
          >
            {/* Close Button */}
            <button 
              onClick={handleIgnore}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="p-8 sm:p-12 text-center">
              {/* Icon Header */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center"
                  >
                    <Bell className="text-indigo-500 w-12 h-12" />
                  </motion.div>
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-zinc-900">
                    <Zap size={14} className="text-white" fill="white" />
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                Don't Miss a Single Beat
              </h2>
              <p className="text-zinc-400 text-lg mb-10 leading-relaxed font-light">
                MafynGate works best when it can talk to you. Enable notifications to receive real-time calls, messages, and your new <strong>Ringing Todo Alarms</strong>.
              </p>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-4 mb-10 text-left">
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex flex-col gap-2">
                  <PhoneCall size={20} className="text-indigo-400" />
                  <span className="text-sm font-medium text-zinc-200">Instant Calls</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex flex-col gap-2">
                  <Shield size={20} className="text-emerald-400" />
                  <span className="text-sm font-medium text-zinc-200">Secure Sync</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleEnable}
                  disabled={status === 'requesting'}
                  className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all transform active:scale-95 ${
                    status === 'success' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white text-black hover:bg-indigo-500 hover:text-white shadow-xl shadow-white/5'
                  }`}
                >
                  {status === 'idle' && 'Enable Background Sync'}
                  {status === 'requesting' && 'Waiting for permission...'}
                  {status === 'success' && 'Everything is Connected!'}
                  {status === 'error' && 'Try Again'}
                </button>
                <button 
                  onClick={handleIgnore}
                  className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
                >
                  I'll do it later in Settings
                </button>
              </div>
            </div>

            {/* Bottom Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-indigo-600 to-transparent opacity-50" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
