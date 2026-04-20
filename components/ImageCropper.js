'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ZoomIn, RotateCcw } from 'lucide-react';
import { getCroppedImgBlob } from '../lib/cropUtils';

export default function ImageCropper({ image, onCropComplete, onCancel, aspect = 1 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropAreaComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    try {
      const croppedImage = await getCroppedImgBlob(image, croppedAreaPixels, rotation);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onCancel}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        className="relative bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-border/50">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Adjust Photo</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Scale and position your image</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-muted rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-[350px] bg-slate-900 overflow-hidden">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onCropComplete={onCropAreaComplete}
            onZoomChange={onZoomChange}
            cropShape="rect"
            showGrid={true}
          />
        </div>

        {/* Controls */}
        <div className="p-8 space-y-8 bg-card/50">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        <ZoomIn size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Zoom Level</span>
                    </div>
                    <span className="text-[10px] font-black text-foreground">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => onZoomChange(parseFloat(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-500">
                        <RotateCcw size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Rotation</span>
                    </div>
                </div>
                <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    aria-labelledby="Rotation"
                    onChange={(e) => setRotation(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-muted rounded-full appearance-none cursor-pointer"
                />
            </div>

            <div className="flex gap-4 pt-4">
                <button 
                  onClick={onCancel}
                  className="flex-1 py-4 bg-muted hover:bg-muted/80 text-foreground font-black uppercase tracking-widest text-xs rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDone}
                  className="flex-1 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Apply Crop
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
