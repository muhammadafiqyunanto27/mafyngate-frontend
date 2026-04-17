'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  FlipHorizontal,
  ChevronDown,
  GripHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMediaUrl } from '../lib/url';

export const CallOverlay = () => {
  const { 
    call, 
    callAccepted, 
    callEnded, 
    stream, 
    remoteStream, 
    isCalling, 
    answerCall, 
    rejectCall, 
    handleEndCall,
    isMirrored,
    toggleMirror,
    switchCamera,
    remoteIsMirrored,
    isMinimized,
    setIsMinimized,
    localVideoEnabled,
    localAudioEnabled,
    remoteVideoEnabled,
    remoteAudioEnabled,
    toggleMediaHardware,
    upgradeToVideo
  } = useSocket();

  const myVideo = useRef();
  const userVideo = useRef();
  const backgroundVideo = useRef();
  const [remoteVideoMeta, setRemoteVideoMeta] = useState({ width: 0, height: 0, aspect: 1 });
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // MediaSession API & Automatic PiP on Visibility Change
  useEffect(() => {
    if (!callAccepted || callEnded) return;

    // 1. Setup MediaSession to "prime" the browser for background media
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `Call with ${call.name || 'Anonymous'}`,
        artist: 'MafynGate Secure Call',
        artwork: [
          { src: getMediaUrl(call.avatar) || '/logo.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('hangup', () => handleEndCall(true));
      navigator.mediaSession.setActionHandler('stop', () => handleEndCall(true));
    }

    // 2. Handle Auto-PiP on Visibility Change
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'hidden' && callAccepted && userVideo.current) {
        try {
          // If on mobile, falling back to our Draggable Miniature is safer, 
          // but we try the native API first for the "Auto-Switch" effect.
          if (!document.pictureInPictureElement && document.pictureInPictureEnabled) {
            await userVideo.current.requestPictureInPicture();
          }
        } catch (err) {
          console.warn('[PiP] Auto-PiP failed, using stable Miniature fallback:', err);
          setIsMinimized(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
      }
    };
  }, [callAccepted, callEnded, call.name, call.avatar]);

  const handleMetadataLoaded = (e) => {
    const video = e.target;
    if (video) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const aspect = width / height;
      console.log(`[Video] Metadata loaded: ${width}x${height} (Aspect: ${aspect})`);
      setRemoteVideoMeta({ width, height, aspect });
    }
  };

  useEffect(() => {
    if (myVideo.current) {
      myVideo.current.srcObject = stream || null;
    }
  }, [stream]);

  useEffect(() => {
    if (userVideo.current) {
      userVideo.current.srcObject = (callAccepted && remoteStream) ? remoteStream : null;
    }
    if (backgroundVideo.current) {
      backgroundVideo.current.srcObject = (callAccepted && remoteStream) ? remoteStream : null;
    }
  }, [callAccepted, remoteStream]);

  // Use hardware-level toggles from context
  const handleToggleMic = () => toggleMediaHardware('audio');
  
  const handleToggleVideo = () => {
    if (call.type === 'voice') {
      upgradeToVideo();
    } else {
      toggleMediaHardware('video');
    }
  };

  if (!isCalling && !call.isReceivingCall && !callAccepted && !callEnded) return null;
  const getAvatar = (avatar) => getMediaUrl(avatar);

  const togglePip = async () => {
    // Mobile browsers often crash or fail on native requestPictureInPicture
    // So we use our stable Draggable Miniature instead as the primary "PIP" experience
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('[PIP] Mobile detected, using stable In-App Miniature');
      setIsMinimized(true);
      return;
    }

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (userVideo.current) {
        await userVideo.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('[PiP] Native API failed, falling back to Miniature:', err);
      setIsMinimized(true);
    }
  };

  if (!isCalling && !call.isReceivingCall && !callAccepted && !callEnded) return null;

  return (
    <AnimatePresence>
      <motion.div 
        layoutId="call-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          width: isMinimized ? (isMobileView ? '160px' : '220px') : '100%',
          height: isMinimized ? (isMobileView ? '220px' : '300px') : '100%',
          bottom: isMinimized ? '24px' : '0px',
          right: isMinimized ? '24px' : '0px',
          left: isMinimized ? 'auto' : '0px',
          top: isMinimized ? 'auto' : '0px',
          borderRadius: isMinimized ? '24px' : '0px',
        }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed z-[9999] flex flex-col bg-zinc-950/90 backdrop-blur-3xl shadow-2xl border-primary/20 overflow-hidden ${isMinimized ? 'border-2 cursor-move ring-1 ring-white/10' : ''}`}
        drag={isMinimized}
        dragMomentum={false}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Main Interface Container */}
        <div className="relative w-full h-full flex flex-col">
          
          {/* Header Controls (Hidden if minimized) */}
          {!isMinimized && (
            <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center">
              <button 
                onClick={() => setIsMinimized(true)}
                className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl text-white transition-all"
              >
                <div className="flex flex-col items-center gap-1">
                  <ChevronDown size={20} />
                  <span className="text-[8px] font-bold opacity-50">MIN</span>
                </div>
              </button>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] drop-shadow-sm">
                    {callAccepted ? 'Encrypted Stream' : 'Secure Handshake'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                   <GripHorizontal size={14} className="text-white/20 animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={togglePip}
                  className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl text-white transition-all"
                  title="Picture in Picture"
                >
                  <Maximize2 size={20} />
                </button>
                <button 
                  onClick={switchCamera}
                  className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl text-white transition-all"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Video / Content Layer */}
          <div className="relative flex-1 bg-zinc-950 overflow-hidden">
            {/* Remote Video / Identity */}
            {callAccepted && !callEnded ? (
              <div className="w-full h-full relative z-10 flex items-center justify-center bg-black">
                {!isMinimized && (
                   <div className="absolute inset-0 z-0 overflow-hidden opacity-50">
                      <video
                        playsInline
                        muted
                        ref={backgroundVideo}
                        autoPlay
                        className={`w-full h-full object-cover blur-3xl scale-125 ${remoteIsMirrored ? 'scale-x-[-1]' : ''}`}
                      />
                   </div>
                )}

                <video
                  playsInline
                  ref={userVideo}
                  autoPlay
                  autopictureinpicture=""
                  onLoadedMetadata={handleMetadataLoaded}
                  className={`relative z-10 w-full h-full transition-all duration-500 
                    ${remoteIsMirrored ? 'scale-x-[-1]' : ''} 
                    ${!remoteVideoEnabled ? 'opacity-0' : 'opacity-100'}
                    ${isMinimized ? 'object-cover' : (remoteVideoMeta.aspect > 1.2 ? 'object-contain' : 'object-contain md:object-cover')}
                  `}
                />
                
                {!remoteVideoEnabled && (
                  <div className="absolute inset-0 bg-zinc-950 z-20 flex flex-col items-center justify-center space-y-6">
                    <div className={`${isMinimized ? 'w-16 h-16 rounded-2xl' : 'w-32 h-32 md:w-48 md:h-48 rounded-[3rem]'} bg-white/5 flex items-center justify-center border border-white/10`}>
                      <VideoOff size={isMinimized ? 20 : 48} className="text-white/20" />
                    </div>
                    {!isMinimized && (
                      <div className="text-center">
                        <p className="text-white/40 font-black uppercase tracking-widest text-xs">Partner Video Paused</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Minimized Controls Overlay */}
                {isMinimized && (
                  <div className="absolute inset-0 z-30 opacity-0 hover:opacity-100 transition-opacity bg-black/40 flex flex-col items-center justify-center gap-3">
                    <button onClick={() => setIsMinimized(false)} className="p-2 bg-white/20 rounded-full text-white"><Maximize2 size={16} /></button>
                    <button onClick={() => handleEndCall(true)} className="p-2 bg-rose-500 rounded-full text-white"><PhoneOff size={16} /></button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center space-y-4 md:space-y-6 bg-zinc-900">
                <div className="relative">
                  <div className={`${isMinimized ? 'w-20 h-20 rounded-2xl' : 'w-32 h-32 md:w-48 md:h-48 rounded-[3rem]'} overflow-hidden border-4 border-white/10 shadow-2xl`}>
                    {call.avatar ? (
                      <img src={getAvatar(call.avatar)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-600 text-4xl md:text-6xl font-black text-white">
                        {call.name ? call.name[0] : '?'}
                      </div>
                    )}
                  </div>
                  {isCalling && !isMinimized && (
                    <div className="absolute -inset-4 border-4 border-primary/30 rounded-[4rem] animate-ping" />
                  )}
                </div>
                
                {!isMinimized && (
                  <div className="text-center space-y-2 px-6">
                    <h2 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter truncate max-w-full">
                      {call.name || 'Anonymous'}
                    </h2>
                    <p className="text-white/60 font-bold uppercase tracking-widest text-[10px]">
                      {isCalling ? 'Contacting Server...' : call.isReceivingCall ? 'Incoming Transmission' : callEnded ? 'End of Transmission' : 'Establishing Secure Link...'}
                    </p>
                    {callEnded && <p className="text-rose-500 font-black pt-4">CALL ENDED</p>}
                  </div>
                )}
              </div>
            )}

            {/* Local Video - PIP Inline (Hidden if minimized) */}
            {stream && !callEnded && !isMinimized && (
              <motion.div 
                drag
                dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                className="absolute bottom-32 right-6 md:bottom-28 md:right-10 w-28 md:w-56 aspect-[3/4] md:aspect-video bg-zinc-800 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-40 cursor-move"
              >
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''} ${!localVideoEnabled ? 'opacity-0' : 'opacity-100'}`}
                />
                {!localVideoEnabled && (
                   <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                     <VideoOff size={24} className="text-white/40" />
                   </div>
                )}
              </motion.div>
            )}
          </div>

          {/* BOTTOM CONTROLS (Hidden if minimized) */}
          {!callEnded && !isMinimized && (
            <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center px-6">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 px-4 md:px-5 py-2.5 rounded-[3rem] shadow-2xl flex items-center gap-2 md:gap-5"
              >
                {call.isReceivingCall && !callAccepted ? (
                  <>
                    <button onClick={answerCall} className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"><Phone size={22} /></button>
                    <button onClick={rejectCall} className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20"><PhoneOff size={22} /></button>
                  </>
                ) : (
                  <>
                    <button 
                        onClick={handleToggleMic}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${!localAudioEnabled ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'}`}
                    >
                      {!localAudioEnabled ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    
                    <button 
                        onClick={handleToggleVideo}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${(!localVideoEnabled || call.type === 'voice') ? 'bg-rose-500 text-white' : 'bg-white/10 text-white'}`}
                    >
                      {(!localVideoEnabled || call.type === 'voice') ? <VideoOff size={18} /> : <Video size={18} />}
                    </button>

                    <button 
                        onClick={toggleMirror}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMirrored ? 'bg-primary text-white' : 'bg-white/10 text-white'}`}
                    >
                      <FlipHorizontal size={18} />
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-1 md:mx-2 hidden sm:block" />

                    <button
                      onClick={() => handleEndCall(true)}
                      className="h-10 px-4 md:px-6 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white transition-all font-black uppercase tracking-widest text-[9px] md:text-[10px]"
                    >
                      <PhoneOff size={16} className="mr-2" />
                      <span className="hidden xs:inline">End Call</span>
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          )}
          
          {/* Minimized Footer Label */}
          {isMinimized && (
            <div className="p-2 bg-zinc-900 border-t border-white/5 text-[10px] text-center font-bold text-white truncate px-3">
              {call.name || 'Anonymous'}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
