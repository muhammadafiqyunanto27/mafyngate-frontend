'use client';

import '../lib/polyfills';
import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { ErrorBoundary } from './ErrorBoundary';
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
          <ErrorBoundary fallback={null}><CallOverlay /></ErrorBoundary>
          <ErrorBoundary fallback={null}><NotificationToast /></ErrorBoundary>
          <ErrorBoundary fallback={null}><PushNotificationManager /></ErrorBoundary>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
