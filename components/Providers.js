'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { CallOverlay } from './CallOverlay';
import { NotificationToast } from './NotificationToast';
import PushNotificationManager from './PushNotificationManager';

export function Providers({ children }) {
  // Service worker registration is handled inside PushNotificationManager

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <SocketProvider>
          {children}
          <CallOverlay />
          <NotificationToast />
          <PushNotificationManager />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
