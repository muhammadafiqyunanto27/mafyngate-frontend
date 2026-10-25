'use client';

import { useEffect } from 'react';

const CURRENT_VERSION = 'v1.4';

export function useVersionCheck() {
  useEffect(() => {
    // Only run in production and after initial load
    if (process.env.NODE_ENV !== 'production') return;

    const checkVersion = async () => {
      try {
        // Check with service worker if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const registration = await navigator.serviceWorker.ready;
          
          // Send version check message to SW
          const version = await new Promise((resolve) => {
            const channel = new MessageChannel();
            channel.port1.onmessage = (event) => {
              resolve(event.data.version);
            };
            registration.active.postMessage('check-version', [channel.port2]);
            
            // Timeout fallback
            setTimeout(() => resolve(null), 1000);
          });

          if (version && version !== CURRENT_VERSION) {
            console.log('[VersionCheck] New version detected:', version, '-> reloading');
            // Force reload to get new version
            window.location.reload();
            return;
          }
        }

        // Fallback: Check via fetch to a version endpoint or manifest
        const response = await fetch('/manifest.json', { cache: 'no-cache' });
        const manifest = await response.json();
        // If manifest has version info, compare
        
      } catch (err) {
        console.warn('[VersionCheck] Failed:', err);
      }
    };

    // Check on load
    checkVersion();

    // Check periodically (every 5 minutes)
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    // Also check on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

export default function VersionChecker({ children }) {
  useVersionCheck();
  return children;
}