'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { CallOverlay } from './CallOverlay';
import { NotificationToast } from './NotificationToast';

export function Providers({ children }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <SocketProvider>
          {children}
          <CallOverlay />
          <NotificationToast />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
