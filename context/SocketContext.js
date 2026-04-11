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
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const activeChatIdRef = React.useRef(null);
  const [toast, setToast] = useState(null);

  // Call States
  const [call, setCall] = useState({ isReceivingCall: false, from: '', name: '', avatar: '', signal: null, type: 'voice' });
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
   const [isCalling, setIsCalling] = useState(false);
   const [targetUser, setTargetUser] = useState(null);
   const [isMirrored, setIsMirrored] = useState(true);
   const [remoteIsMirrored, setRemoteIsMirrored] = useState(false);
   const [isMinimized, setIsMinimized] = useState(false);
   const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'

  const connectionRef = React.useRef();

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    if (user) {
      const accessToken = localStorage.getItem('accessToken');
      
      const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        auth: { token: accessToken },
        transports: ['polling', 'websocket'], // Start with polling for better compatibility
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      newSocket.on('connect_error', (err) => {
        console.error('[Socket] Connection Error:', err.message);
        // If websocket fails, it will automatically try polling because of transports array
      });

      newSocket.on('reconnect', (attempt) => {
        console.log('[Socket] Reconnected after', attempt, 'attempts');
      });

      const fetchInitialData = async () => {
        try {
          const [notifRes, unreadChatRes] = await Promise.all([
            api.get('/user/notifications'),
            api.get('/user/chat/unread-conversations')
          ]);
          
          setNotifications(notifRes.data.data);
          setUnreadCount(notifRes.data.data.filter(n => !n.isRead).length);
          setUnreadChatsCount(unreadChatRes.data.data.length);
        } catch (err) {
          console.error('Failed to fetch initial data:', err);
        }
      };
      fetchInitialData();

      newSocket.on('connect', () => {
        console.log('[Socket] Connected as:', user.id);
      });

      newSocket.on('unread_count', (data) => {
        setUnreadCount(data.count);
      });

      newSocket.on('unread_chats_count_refresh', () => {
        const fetchUnread = async () => {
          try {
            const res = await api.get('/user/chat/unread-conversations');
            setUnreadChatsCount(res.data.data.length);
          } catch (err) {}
        };
        fetchUnread();
      });

      newSocket.on('new_notification', (data) => {
        console.log('[Socket] New notification received:', data);
        
        // Suppress COMPLETELY if user is already chatting with this person in active window
        if (data.type === 'CHAT' && activeChatIdRef.current === data.senderId) {
          return;
        }

        setNotifications(prev => {
          // Check if notification with same ID already exists
          const exists = prev.some(n => n.id === data.id);
          if (exists) return prev;
          return [data, ...prev];
        });
        setToast(data);
        
        // Play notification sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(() => {}); // Browsers might block auto-play
        } catch (e) {}

        setTimeout(() => setToast(null), 1000);
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

      newSocket.on('remote_mirror_toggled', ({ isMirrored }) => {
        setRemoteIsMirrored(isMirrored);
      });

      newSocket.on('unread_chats_count', (data) => {
        setUnreadChatsCount(data.count);
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

  const clearNotificationsFromSender = async (senderId) => {
    try {
      await api.delete(`/user/notifications/sender/${senderId}`);
      setNotifications(prev => prev.filter(n => n.senderId !== senderId || n.type !== 'CHAT'));
      // Recalculate unread count
      setUnreadCount(prev => {
        const remainingUnread = notifications.filter(n => (n.senderId !== senderId || n.type !== 'CHAT') && !n.isRead).length;
        return remainingUnread;
      });
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
    console.log('[Call] Ending call and cleaning up...');
    
    if (shouldEmit && socket && (targetUser || call.from)) {
      socket.emit('end_call', { to: targetUser || call.from });
    }

    // 1. Destroy Peer Connection
    if (connectionRef.current) {
      try {
        connectionRef.current.destroy();
      } catch (e) {}
    }

    // 2. Stop All Media Tracks (Camera & Mic)
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log(`[Media] Track ${track.kind} stopped`);
      });
    }

    // 3. Reset States
    setStream(null);
    setRemoteStream(null);
    setCall({ isReceivingCall: false, from: '', name: '', avatar: '', signal: null, type: 'voice' });
    setCallAccepted(false);
    setCallEnded(true);
    setIsCalling(false);
    setTargetUser(null);
    setIsMinimized(false);
    setRemoteIsMirrored(false);

    // 4. Final Cleanup
    connectionRef.current = null;
    
    // Auto-hide the "Call Ended" message after 2 seconds
    setTimeout(() => {
      setCallEnded(false);
    }, 2000);
  };

  const startCall = async (userIdToCall, type = 'video', recipientInfo = {}) => {
    if (isCalling || stream || callAccepted) {
      console.warn('[Call] Already in a call or calling process. Ignoring request.');
      return;
    }
    setCallEnded(false); // Reset call ended status
    setCall({ isReceivingCall: false, from: userIdToCall, name: recipientInfo.name, avatar: recipientInfo.avatar, type });
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
        // Also send initial mirror state
        socket.emit('mirror_toggled', { to: userIdToCall, isMirrored });
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
    if (callAccepted || stream) {
      console.warn('[Call] Already answered or stream exists.');
      return;
    }
    setCallEnded(false); // Reset call ended status
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
        // Also send initial mirror state
        socket.emit('mirror_toggled', { to: call.from, isMirrored });
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

  const toggleMirror = () => {
    const newVal = !isMirrored;
    setIsMirrored(newVal);
    if (socket && (targetUser || call.from)) {
      socket.emit('mirror_toggled', { to: targetUser || call.from, isMirrored: newVal });
    }
  };

  const switchCamera = async () => {
    if (!stream) return;
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);

    try {
      // Stop old tracks first to release hardware
      stream.getTracks().forEach(track => {
        console.log('[Media] Releasing old track:', track.kind);
        track.stop();
      });

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode },
        audio: true
      });

      if (connectionRef.current) {
        const videoTrack = stream.getVideoTracks()[0];
        const newVideoTrack = newStream.getVideoTracks()[0];
        // Replace track in peer connection
        connectionRef.current.replaceTrack(videoTrack, newVideoTrack, stream);
      }

      setStream(newStream);
    } catch (err) {
      console.error('[Media] Switch camera failed:', err);
    }
  };

  return (
    <SocketContext.Provider value={{ 
      socket, unreadCount, unreadChatsCount, notifications, toast, activeChatId,
      setNotifications, setUnreadCount, setUnreadChatsCount, setActiveChatId,
      requestNotificationPermission, removeNotification, readAllNotifications, clearNotifications, clearNotificationsFromSender,
      call, callAccepted, callEnded, stream, remoteStream, isCalling,
      startCall, answerCall, rejectCall, handleEndCall,
      isMirrored, toggleMirror, switchCamera,
      remoteIsMirrored, isMinimized, setIsMinimized
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
