'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NotificationPrompt from './NotificationPrompt';
import { ErrorBoundary } from './ErrorBoundary';
import { motion } from 'framer-motion';
import { safeStorage } from '../lib/storage';

export default function DashboardLayout({ children, pageTitle = 'Dashboard', fullWidth = false }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Default to closed as requested (true means collapsed)
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Auth Guard: Redirect to login if not authenticated
  useEffect(() => {
    if (isMounted && !loading && !user) {
      console.log('[AuthGuard] Unauthorized access detected, redirecting...');
      router.push('/login');
    }
  }, [user, loading, router, isMounted]);

  // Persistence logic: Retrieve from safeStorage on mount
  useEffect(() => {
    try {
      const saved = safeStorage.getItem('mafyn_sidebar_collapsed');
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved));
      }
    } catch (e) {
      // Corrupted localStorage value — ignore and use default
    }
    setIsMounted(true);
  }, []);

  // Update safeStorage whenever isCollapsed changes (after initial mount)
  const handleToggleCollapse = (value) => {
    setIsCollapsed(value);
    safeStorage.setItem('mafyn_sidebar_collapsed', JSON.stringify(value));
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-bold text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary/30">
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 hidden md:block">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <ErrorBoundary fallback={<div className="w-[72px] bg-card border-r border-border h-full flex-shrink-0" />}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={handleToggleCollapse} 
          isMobileOpen={isMobileOpen} 
          setIsMobileOpen={setIsMobileOpen} 
        />
      </ErrorBoundary>

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 relative overflow-hidden md:backdrop-blur-[2px]">
        <ErrorBoundary fallback={<div className="h-16 bg-card border-b border-border" />}>
          <Navbar 
            onMenuClick={() => setIsMobileOpen(true)} 
            pageTitle={pageTitle} 
          />
        </ErrorBoundary>

        <main className={`flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar ${fullWidth ? 'p-0' : 'p-0 md:p-6 lg:p-10'}`}>
          <ErrorBoundary>
            <motion.div
              initial={{ opacity: 0, y: fullWidth ? 0 : 20, scale: fullWidth ? 1 : 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`w-full mx-auto min-h-full ${fullWidth ? 'max-w-none' : 'max-w-[1500px]'}`}
            >
              {children}
            </motion.div>
          </ErrorBoundary>
        </main>
      </div>
      <NotificationPrompt />
    </div>
  );
}
