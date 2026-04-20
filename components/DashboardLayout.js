'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NotificationPrompt from './NotificationPrompt';
import { motion } from 'framer-motion';

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

  // Persistence logic: Retrieve from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mafyn_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
    setIsMounted(true);
  }, []);

  // Update localStorage whenever isCollapsed changes (after initial mount)
  const handleToggleCollapse = (value) => {
    setIsCollapsed(value);
    localStorage.setItem('mafyn_sidebar_collapsed', JSON.stringify(value));
  };

  if (loading || !user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary/30">
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={handleToggleCollapse} 
        isMobileOpen={isMobileOpen} 
        setIsMobileOpen={setIsMobileOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500 relative overflow-hidden backdrop-blur-[2px]">
        <Navbar 
          onMenuClick={() => setIsMobileOpen(true)} 
          pageTitle={pageTitle} 
        />

        <main className={`flex-1 overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar ${fullWidth ? 'p-0' : 'p-0 md:p-6 lg:p-10'}`}>
          <motion.div
            initial={{ opacity: 0, y: fullWidth ? 0 : 20, scale: fullWidth ? 1 : 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full mx-auto min-h-full ${fullWidth ? 'max-w-none' : 'max-w-[1500px]'}`}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <NotificationPrompt />
    </div>
  );
}
