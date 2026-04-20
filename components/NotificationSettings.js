'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Send, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export default function NotificationSettings() {
  const [status, setStatus] = useState('checking'); // checking, active, inactive, denied
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const checkStatus = () => {
      if (typeof window === 'undefined') return;
      if (window.getMafynGatePushStatus) {
        setStatus(window.getMafynGatePushStatus());
      } else {
        // Fallback
        if (!('Notification' in window)) setStatus('unsupported');
        else if (Notification.permission === 'denied') setStatus('denied');
        else if (Notification.permission === 'granted') setStatus('active');
        else setStatus('inactive');
      }
    };

    const interval = setInterval(checkStatus, 2000);
    checkStatus();
    return () => clearInterval(interval);
  }, []);

  const handleTestNotification = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/push/test-notification');
      setMessage({ type: 'success', text: 'Test notification sent! Check your device.' });
    } catch (err) {
      console.error('[Settings] Test failed:', err);
      setMessage({ type: 'error', text: 'Failed to send test. Is Background Sync active?' });
    } finally {
      setLoading(false);
    }
  };

  const handleHealConnection = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (window.resetMafynGatePush) {
        await window.resetMafynGatePush();
        setMessage({ type: 'success', text: 'Connection healed and refreshed.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to heal connection.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async () => {
    if (window.requestMafynGateNotification) {
      await window.requestMafynGateNotification();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
            {status === 'active' ? <Bell size={24} /> : <BellOff size={24} />}
          </div>
          <div>
            <h4 className="font-semibold text-white">Background Sync Status</h4>
            <p className="text-sm text-zinc-500">
              {status === 'active' ? 'Fully connected and ready for notifications.' : 
               status === 'denied' ? 'Notifications blocked by browser.' : 
               'Not currently connected to background services.'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {status === 'active' ? (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20">
              ACTIVE
            </span>
          ) : (
            <button 
              onClick={handleEnable}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Enable Now
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Test Button */}
        <button
          onClick={handleTestNotification}
          disabled={loading || status !== 'active'}
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Send size={18} className="text-indigo-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          <span className="font-medium text-zinc-200">Test Background Push</span>
        </button>

        {/* Heal Button */}
        <button
          onClick={handleHealConnection}
          disabled={loading}
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all group"
        >
          <RefreshCw size={18} className={`text-emerald-400 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span className="font-medium text-zinc-200">Heal Connection</span>
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          message.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 text-orange-400/80 text-xs flex items-start gap-3 leading-relaxed">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          Note: For notifications to work while all browser windows are closed on Desktop, ensure "Continue running background apps when closed" is enabled in your browser system settings.
        </p>
      </div>
    </div>
  );
}
