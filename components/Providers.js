'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <AuthProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </AuthProvider>
  );

  if (!mounted) {
    return <>{content}</>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {content}
    </ThemeProvider>
  );
}
