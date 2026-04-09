'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../lib/api';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);

  // Call States
  const [call, setCall] = useState({ isReceivingCall: false, from: '', name: '', avatar: '', signal: null, type: 'voice' });
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [targetUser, setTargetUser] = useState(null);

  const connectionRef = React.useRef();

  useEffect(() => {
    if (user) {
      const accessToken = localStorage.getItem('accessToken');
      
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        auth: { token: accessToken }
      });

      const fetchInitialData = async () => {
        try {
          const res = await api.get('/user/notifications');
          setNotifications(res.data.data);
          const unread = res.data.data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error('Failed to fetch initial notifications:', err);
        }
      };
      fetchInitialData();

      newSocket.on('connect', () => {
        console.log('[Socket] Connected as:', user.id);
      });

      newSocket.on('unread_count', (data) => {
        setUnreadCount(data.count);
      });

      newSocket.on('new_notification', (data) => {
        console.log('[Socket] New notification received:', data);
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        setToast(data);
        
        // Play notification sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {}); // Browsers might block auto-play
        } catch (e) {}

        setTimeout(() => setToast(null), 5000);
      });

      // --- Call Listeners ---
      newSocket.on('incoming_call', ({ from, name, avatar, signal, type }) => {
        console.log('[Socket] Incoming call from:', name);
        setCall({ isReceivingCall: true, from, name, avatar, signal, type });
      });

      newSocket.on('call_accepted', (signal) => {
        setCallAccepted(true);
        if (connectionRef.current) {
          connectionRef.current.signal(signal);
        }
      });

      newSocket.on('call_rejected', () => {
        handleEndCall(false);
      });

      newSocket.on('call_ended', () => {
        handleEndCall(false); 
      });

      setSocket(newSocket);
      return () => newSocket.disconnect();
    }
  }, [user]);

  // --- Notification Methods ---
  const requestNotificationPermission = () => {
    if (!('Notification' in window)) return;
    Notification.requestPermission();
  };

  const removeNotification = async (id) => {
    try {
      await api.delete(`/user/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const readAllNotifications = async () => {
    try {
      await api.patch('/user/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const clearNotifications = async () => {
    try {
      await api.delete('/user/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {}
  };

  // --- Call Methods ---
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        console.log('[Stream] Stopping track:', track.kind);
        track.stop();
      });
    }
    setStream(null);
    setRemoteStream(null);
  };

  const handleEndCall = (shouldEmit = true) => {
    if (shouldEmit && socket && (targetUser || call.from)) {
      socket.emit('end_call', { to: targetUser || call.from });
    }
    if (connectionRef.current) connectionRef.current.destroy();
    setCall({ ...call, isReceivingCall: false });
    setCallAccepted(false);
    setIsCalling(false);
    stopStream();
  };

  const startCall = async (userIdToCall, type = 'video') => {
    console.log(`[Call] Initializing ${type} call...`);
    setIsCalling(true);
    setTargetUser(userIdToCall);

    try {
      console.log('[Media] Requesting access to camera/mic...');
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      
      console.log('[Media] Stream acquired successfully:', currentStream.id);
      setStream(currentStream);

      const Peer = (await import('simple-peer')).default;
      const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

      peer.on('signal', (data) => {
        console.log('[Signal] Sending offer signal to:', userIdToCall);
        socket.emit('call_user', {
          userToCall: userIdToCall,
          signalData: data,
          from: user.id,
          name: user.name || user.email.split('@')[0],
          avatar: user.avatar,
          type
        });
      });

      peer.on('stream', (remoteStream) => {
        console.log('[Stream] Remote stream received');
        setRemoteStream(remoteStream);
      });

      connectionRef.current = peer;
    } catch (err) {
      console.error('[Media] Fatal error getting media:', err);
      setIsCalling(false);
    }
  };

  const answerCall = async () => {
    setCallAccepted(true);
    try {
      console.log('[Media] Answering call, requesting media...');
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: call.type === 'video',
        audio: true
      });
      setStream(currentStream);

      const Peer = (await import('simple-peer')).default;
      const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

      peer.on('signal', (data) => {
        socket.emit('answer_call', { signal: data, to: call.from });
      });

      peer.on('stream', (remoteStream) => {
        setRemoteStream(remoteStream);
      });

      peer.signal(call.signal);
      connectionRef.current = peer;
    } catch (err) {
      console.error('[Media] Error answering:', err);
    }
  };

  const rejectCall = () => {
    if (socket && call.from) {
      socket.emit('reject_call', { to: call.from });
    }
    setCall({ ...call, isReceivingCall: false });
  };

  return (
    <SocketContext.Provider value={{ 
      socket, unreadCount, notifications, toast, setNotifications, setUnreadCount,
      requestNotificationPermission, removeNotification, readAllNotifications, clearNotifications,
      call, callAccepted, callEnded, stream, remoteStream, isCalling,
      startCall, answerCall, rejectCall, handleEndCall
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
