'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X, Info, ExternalLink } from 'lucide-react';

export default function MigrationBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Check if running as PWA (Standalone mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone || 
                  document.referrer.includes('android-app://');

    // 2. Check if already dismissed
    const isDismissed = localStorage.getItem('mafyngate_migration_dismissed');

    if (isPWA && !isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('mafyngate_migration_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-50 overflow-hidden"
        >
          <div className="bg-indigo-600 text-white p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md animate-spin-slow">
                <RefreshCcw className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm md:text-base font-black uppercase tracking-tight">Update PWA detected</h4>
                <p className="text-xs md:text-sm font-medium text-white/80 leading-relaxed">
                  Kami baru saja pindah ke domain <span className="text-white font-bold underline">mafyngate.web.id</span>. 
                  Hapus aplikasi lama dan <span className="text-white font-bold italic">Add to Home Screen</span> lagi dari sini untuk fitur terbaru.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => window.open('https://mafyngate.web.id', '_blank')}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-black text-xs uppercase transition-all hover:bg-indigo-50 active:scale-95 shadow-lg"
              >
                Learn More <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleDismiss}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all"
                title="Sembunyikan"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <style jsx>{`
            .animate-spin-slow {
              animation: spin 8s linear infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
