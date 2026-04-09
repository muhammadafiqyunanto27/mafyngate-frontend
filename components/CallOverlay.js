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
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    setIsMinimized
  } = useSocket();

  const myVideo = useRef();
  const userVideo = useRef();
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (stream && myVideo.current) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (callAccepted && remoteStream && userVideo.current) {
      userVideo.current.srcObject = remoteStream;
    }
  }, [callAccepted, remoteStream]);

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  if (!isCalling && !call.isReceivingCall && !callAccepted && !callEnded) return null;

  const getAvatar = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith('http') ? avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${avatar}`;
  };

  // MINI POPUP VERSION (Minimized)
  if (isMinimized) {
    return (
      <motion.div 
        layoutId="call-container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-6 right-6 z-[10000] w-48 h-64 bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-primary/30 flex flex-col group"
      >
        <div className="relative flex-1 bg-black">
          {callAccepted && !callEnded ? (
            <video
              playsInline
              ref={userVideo}
              autoPlay
              className={`w-full h-full object-cover ${remoteIsMirrored ? 'scale-x-[-1]' : ''}`}
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center">
               <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                 {call.name ? call.name[0] : '?'}
               </div>
             </div>
          )}
          
          {/* Controls Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
             <button onClick={() => setIsMinimized(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/40 text-white"><Maximize2 size={16} /></button>
             <button onClick={() => handleEndCall(true)} className="p-2 bg-rose-500 rounded-full hover:bg-rose-600 text-white"><PhoneOff size={16} /></button>
          </div>
        </div>
        <div className="p-2 bg-zinc-900 border-t border-white/5 text-[10px] text-center font-bold text-white truncate px-3">
          {call.name || 'User'}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        layoutId="call-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950 md:bg-black/90 md:backdrop-blur-xl p-0 md:p-6"
      >
        {/* Main Interface Container */}
        <div className="relative w-full h-full md:max-w-5xl md:h-[85vh] bg-zinc-900 md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
          
          {/* Header Controls */}
          <div className="absolute top-6 left-6 right-6 z-50 flex justify-between items-center">
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl text-white transition-all"
            >
              <ChevronDown size={20} />
            </button>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white/80 text-xs font-bold uppercase tracking-widest">
                {callAccepted ? 'Encrypted Connection' : 'Initializing...'}
              </span>
            </div>
            <button 
              onClick={switchCamera}
              className="p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-2xl text-white transition-all"
            >
              <RefreshCw size={20} />
            </button>
          </div>

          {/* Video / Content Layer */}
          <div className="relative flex-1 bg-zinc-950 overflow-hidden">
            {/* Background Blur Effect */}
            <div className="absolute inset-0 z-0 opacity-30">
              {call.avatar && <img src={getAvatar(call.avatar)} className="w-full h-full object-cover blur-3xl scale-125" />}
            </div>

            {/* Remote Video */}
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className={`w-full h-full object-cover relative z-10 ${remoteIsMirrored ? 'scale-x-[-1]' : ''}`}
              />
            ) : (
              <div className="relative z-10 w-full h-full flex flex-col items-center justify-center space-y-6">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative"
                >
                  <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                    {call.avatar ? (
                      <img src={getAvatar(call.avatar)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-indigo-600 text-6xl font-black text-white">
                        {call.name ? call.name[0] : '?'}
                      </div>
                    )}
                  </div>
                  {isCalling && (
                    <div className="absolute -inset-4 border-4 border-primary/30 rounded-[4rem] animate-ping" />
                  )}
                </motion.div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                    {call.name || 'Anonymous'}
                  </h2>
                  <p className="text-white/60 font-bold uppercase tracking-widest text-xs">
                    {isCalling ? 'Contacting Server...' : call.isReceivingCall ? 'Incoming Transmission' : callEnded ? 'End of Transmission' : 'Establishing Secure Link...'}
                  </p>
                  {callEnded && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 font-black pt-4">CALL ENDED</motion.p>}
                </div>
              </div>
            )}

            {/* Local Video - PIP */}
            {stream && !callEnded && (
              <motion.div 
                drag
                dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
                className="absolute bottom-32 right-6 md:bottom-28 md:right-10 w-32 md:w-56 aspect-[3/4] md:aspect-video bg-zinc-800 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl z-40 cursor-move"
              >
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
                />
                {isVideoOff && (
                   <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                     <VideoOff size={24} className="text-white/40" />
                   </div>
                )}
              </motion.div>
            )}
          </div>

          {/* BOTTOM CONTROLS (WhatsApp Style Floating Bar) */}
          {!callEnded && (
            <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center px-6">
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 px-5 py-2.5 rounded-[3rem] shadow-2xl flex items-center gap-3 md:gap-5"
              >
                {call.isReceivingCall && !callAccepted ? (
                  <>
                    <button
                      onClick={answerCall}
                      className="w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg shadow-emerald-500/40"
                    >
                      <Phone size={24} />
                    </button>
                    <button
                      onClick={rejectCall}
                      className="w-13 h-13 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg shadow-rose-500/40"
                    >
                      <PhoneOff size={24} />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                        onClick={toggleMic}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMicMuted ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    
                    <button 
                        onClick={toggleVideo}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-rose-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
                    </button>

                    <button 
                        onClick={toggleMirror}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMirrored ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      <FlipHorizontal size={18} />
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-2 hidden md:block" />

                    <button
                      onClick={() => handleEndCall(true)}
                      className="h-10 px-5 bg-rose-500 hover:bg-rose-600 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-lg shadow-rose-500/40 font-black uppercase tracking-widest text-[9px]"
                    >
                      <PhoneOff size={16} className="mr-2" />
                      End Call
                    </button>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
