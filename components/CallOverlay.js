'use client';

import React, { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2, RefreshCw, FlipHorizontal } from 'lucide-react';
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
    setIsMirrored,
    switchCamera
  } = useSocket();

  const myVideo = useRef();
  const userVideo = useRef();

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

  if (!isCalling && !call.isReceivingCall && !callAccepted && !callEnded) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <div className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
          
          {/* Main Video Area */}
          <div className="relative flex-1 bg-black overflow-hidden">
            {/* Remote Video (Full Screen) */}
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg animate-pulse">
                  {call.name ? call.name[0] : '?'}
                </div>
                <h2 className="text-2xl font-semibold text-white">
                  {isCalling ? `Calling ${call.name || 'User'}...` : call.isReceivingCall ? `Incoming Call from ${call.name}` : 'Connecting...'}
                </h2>
                {callEnded && <p className="text-red-400">Call Ended</p>}
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            {stream && (
              <div className="absolute top-4 right-4 w-1/4 min-w-[120px] aspect-video bg-zinc-800 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl z-10 transition-all hover:scale-105">
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
                />
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="h-24 bg-zinc-900/90 border-t border-white/5 flex items-center justify-center space-x-4 md:space-x-6 px-6">
            {call.isReceivingCall && !callAccepted ? (
              <>
                <button
                  onClick={answerCall}
                  className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg shadow-emerald-500/20"
                >
                  <Phone size={28} />
                </button>
                <button
                  onClick={rejectCall}
                  className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-lg shadow-rose-500/20"
                >
                  <PhoneOff size={28} />
                </button>
              </>
            ) : (
              <>
                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <Mic size={20} />
                </button>
                <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                  <Video size={20} />
                </button>
                
                {/* Camera Settings Buttons */}
                <button 
                  onClick={() => setIsMirrored(!isMirrored)}
                  title="Toggle Mirror"
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMirrored ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  <FlipHorizontal size={20} />
                </button>
                
                <button 
                  onClick={switchCamera}
                  title="Switch Camera"
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:rotate-180"
                >
                  <RefreshCw size={20} />
                </button>

                <button
                  onClick={() => handleEndCall(true)}
                  className="w-16 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-lg shadow-rose-500/20 px-4"
                >
                  <PhoneOff size={24} className="mr-2" />
                  <span className="font-medium text-sm">End</span>
                </button>
              </>
            )}
          </div>

          {/* User Info Overlay (When receiving/calling) */}
          {(isCalling || (call.isReceivingCall && !callAccepted)) && (
            <div className="absolute top-8 left-8 flex items-center space-x-4 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800">
                {call.avatar ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${call.avatar}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-cyan-600 text-white font-bold">
                    {call.name ? call.name[0] : '?'}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{call.name || 'User'}</p>
                <p className="text-white/60 text-xs">{isCalling ? 'Ringing...' : 'Incoming call...'}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
