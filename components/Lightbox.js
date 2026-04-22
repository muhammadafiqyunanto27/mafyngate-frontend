'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Download, Share2, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl, downloadMedia } from '../lib/url';

export default function Lightbox({ media, onClose, allowActions = true }) {
  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!media) return null;

  const url = getMediaUrl(media.fileUrl || media.url || media);
  const type = media.type || (url?.match(/\.(mp4|webm|ogg)$/i) ? 'VIDEO' : 'IMAGE');

  const handleDownload = () => {
    const fileUrl = media.fileUrl || media.url || media;
    downloadMedia(fileUrl);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" 
      />

      {/* Header Controls */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-[2010] bg-gradient-to-b from-black/60 to-transparent"
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all shadow-xl"
          >
            <X size={24} />
          </button>
          <div className="hidden md:block">
            <p className="text-white font-black text-xs uppercase tracking-tight">Media Viewer</p>
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest leading-none">MafynGate Super App</p>
          </div>
        </div>

        {allowActions && (
          <div className="flex items-center gap-2">
              <button onClick={handleDownload} className="p-3 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
                  <Download size={20} />
              </button>
              <button className="p-3 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-all">
                  <Share2 size={20} />
              </button>
          </div>
        )}
      </motion.div>

      {/* Media Display */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="relative w-full h-full flex items-center justify-center p-4 md:p-12 z-[2005]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-w-full max-h-full flex items-center justify-center">
          {type === 'VIDEO' ? (
            <video 
              src={url} 
              controls 
              autoPlay
              className="max-w-full max-h-[85vh] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black" 
            />
          ) : (
            <motion.img 
              layoutId={media.id || 'lightbox-img'}
              src={url} 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.8)]" 
              alt="Full size preview"
            />
          )}
        </div>
      </motion.div>

      {/* Side Navigation (For future gallery support) */}
      <div className="absolute inset-y-0 left-0 flex items-center p-4 hidden md:flex">
          <button className="p-3 bg-white/5 text-white/30 hover:text-white hover:bg-white/10 rounded-2xl transition-all opacity-20 cursor-not-allowed">
              <ChevronLeft size={32} />
          </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center p-4 hidden md:flex">
          <button className="p-3 bg-white/5 text-white/30 hover:text-white hover:bg-white/10 rounded-2xl transition-all opacity-20 cursor-not-allowed">
              <ChevronRight size={32} />
          </button>
      </div>
    </div>
  );
}
