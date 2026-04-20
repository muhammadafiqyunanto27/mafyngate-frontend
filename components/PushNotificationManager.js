'use client';

import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const VAPID_PUBLIC_KEY = "BJJ8eibyB6DuK5-BuKaFxbRaww9Tl7K8IlgJNszqIjLCup23hM6XUPk2LAqENhY0sn9xY-tAH-Im_Ycvxy9kjVI";

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && user) {
      registerServiceWorker();
    }
  }, [user]);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('[Push] Service Worker registered:', reg);
      setRegistration(reg);
      
      // Force update check
      await reg.update();

      // Check for existing subscription
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
        // Sync with backend every time user logs in to ensure endpoint is fresh
        await api.post('/push/subscribe', { subscription: sub });
      } else if (Notification.permission === 'granted') {
        // Permission is granted but no subscription found - auto-repair
        console.log('[Push] Permission granted but no sub found. Reviving...');
        await subscribeToPush(reg);
      }
    } catch (err) {
      console.error('[Push] SW registration failed:', err);
    }
  };

  const subscribeToPush = async (reg) => {
    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      await api.post('/push/subscribe', { subscription: sub });
      setSubscription(sub);
      setIsSubscribed(true);
      console.log('[Push] Subscribed successfully');
    } catch (err) {
      console.error('[Push] Failed to subscribe:', err);
      if (err.name === 'NotAllowedError') {
        alert('Notification permission denied by browser. Please enable it in site settings.');
      }
    }
  };

  const resetBackgroundSync = async () => {
    try {
      console.log('[Push] Hard-resetting background sync...');
      
      // 1. Get existing registration
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (reg) {
        // 2. Unsubscribe if exists
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          console.log('[Push] Unsubscribed from old endpoint');
        }
        
        // 3. Kill the service worker
        await reg.unregister();
        console.log('[Push] Service worker unregistered');
      }

      // 4. Force state reset
      setIsSubscribed(false);
      setSubscription(null);
      setRegistration(null);
      localStorage.removeItem('mafyngate_notif_ignored');
      
      // 5. Re-register fresh
      console.log('[Push] Initiating fresh registration...');
      await registerServiceWorker();
      
      alert('Background Sync has been reset. Your notifications should now be linked 100%!');
    } catch (err) {
      console.error('[Push] Hard reset failed:', err);
      alert('Failed to reset sync. Please refresh the page and try again.');
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && registration) {
      await subscribeToPush(registration);
    }
  };

  // Expose to window for global access (e.g., from Sidebar/Profile)
  useEffect(() => {
    window.requestMafynGateNotification = requestPermission;
    window.resetMafynGatePush = resetBackgroundSync;
    window.getMafynGatePushStatus = () => {
        if (!('Notification' in window)) return 'unsupported';
        if (Notification.permission === 'denied') return 'denied';
        if (isSubscribed) return 'active';
        return 'inactive';
    };
    return () => { 
        delete window.requestMafynGateNotification; 
        delete window.resetMafynGatePush;
        delete window.getMafynGatePushStatus;
    };
  }, [registration, isSubscribed]);

  return null;
}

export { PushNotificationManager };
