'use client';

import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const VAPID_PUBLIC_KEY = "BJGbs8WX7ZjwFMyMXjEiKfotKr-SU4VF8BbNF-KzSz8dFhEDyAHRVlqYCrPiuTC8kmhw4pwMsJnfO3slxgQo0Uw";

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
      
      // Check for existing subscription
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
        // Sync with backend just in case
        await api.post('/push/subscribe', { subscription: sub });
      } else {
        // Auto-request or show a button? 
        // For now, let's try to subscribe if permission is already granted
        if (Notification.permission === 'granted') {
          subscribeToPush(reg);
        }
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
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted' && registration) {
      await subscribeToPush(registration);
    }
  };

  // Expose to window for global access (e.g., from Sidebar)
  useEffect(() => {
    window.requestMafynGateNotification = requestPermission;
    return () => { delete window.requestMafynGateNotification; };
  }, [registration]);

  return null;
}

export { PushNotificationManager };
