'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, RotateCcw } from 'lucide-react';

const ImageCropper = ({ image, onCropComplete, onCancel, loading }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const handleCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleDone = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-card border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden z-10 flex flex-col"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <RotateCcw className="w-5 h-5" />
             </div>
             <div>
                <h2 className="text-xl font-black text-foreground">Adjust Photo</h2>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Crop and position your avatar</p>
             </div>
          </div>
          <button 
            onClick={onCancel}
            className="p-3 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative h-[400px] bg-slate-950">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={onZoomChange}
            cropShape="rect" // Keeping it rectangular but styling makes it look premium
            showGrid={true}
          />
        </div>

        <div className="p-8 space-y-8 bg-card">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
              <span>Zoom Level</span>
              <span className="text-primary">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="relative group px-1">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 px-6 rounded-2xl border border-border font-bold text-sm hover:bg-muted transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleDone}
              disabled={loading}
              className="flex-1 py-4 px-6 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/30 hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageCropper;
