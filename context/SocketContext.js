'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../lib/api';
import { API_URL } from '../lib/config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState({}); // userId -> 'online' | 'offline'
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
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState(true);
  const [remoteAudioEnabled, setRemoteAudioEnabled] = useState(true);
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true);
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true);
  const [answerCallParam, setAnswerCallParam] = useState(false);

  const connectionRef = React.useRef();
  const streamRef = React.useRef(null);
  const callRef = React.useRef(call);
  const targetUserRef = React.useRef(targetUser);
  const socketRef = React.useRef(null);
  const ringtoneRef = React.useRef(null);
  const outgoingRef = React.useRef(null);

  // Keep refs in sync with state for use in long-lived socket listeners
  useEffect(() => { streamRef.current = stream; }, [stream]);
  useEffect(() => { callRef.current = call; }, [call]);
  useEffect(() => { targetUserRef.current = targetUser; }, [targetUser]);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    if (user) {
      const accessToken = localStorage.getItem('accessToken');

      const newSocket = io(API_URL, {
        auth: { token: accessToken },
        transports: ['websocket', 'polling'], // Prioritize websocket for stability on Railway/Vercel
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

      newSocket.on('user_status', (data) => {
        setOnlineUsers(prev => ({ ...prev, [data.userId]: data.status }));
      });

      newSocket.on('unread_chats_count_refresh', () => {
        const fetchUnread = async () => {
          try {
            const res = await api.get('/user/chat/unread-conversations');
            setUnreadChatsCount(res.data.data.length);
          } catch (err) { }
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
          const audio = new Audio('/notification.wav');
          audio.play().catch(() => { }); // Browsers might block auto-play
        } catch (e) { }

        setTimeout(() => setToast(null), 1000);
      });

      // --- Call Listeners ---
      newSocket.on('incoming_call', ({ from, name, avatar, signal, type }) => {
        console.log('[Socket] Incoming call from:', name);
        setCall({ isReceivingCall: true, from, name, avatar, signal, type });

        // Start Ringtone & Vibration
        try {
          if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
          }
          const ring = new Audio('/ringtone.mp3'); // User should add this file
          ring.loop = true;
          ring.play().catch(() => {
            // Fallback if file not found or blocked
            const fallback = new Audio('/notification.wav');
            fallback.loop = true;
            fallback.play().catch(() => { });
            ringtoneRef.current = fallback;
          });
          ringtoneRef.current = ring;

          if ('vibrate' in navigator) {
            navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
          }
        } catch (e) { }
      });

      newSocket.on('call_accepted', (signal) => {
        setCallAccepted(true);
        if (ringtoneRef.current) ringtoneRef.current.pause();
        if (outgoingRef.current) outgoingRef.current.pause();
        if ('vibrate' in navigator) navigator.vibrate(0);
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

      newSocket.on('remote_media_changed', ({ type, isEnabled }) => {
        if (type === 'video') setRemoteVideoEnabled(isEnabled);
        if (type === 'audio') setRemoteAudioEnabled(isEnabled);
      });

      newSocket.on('unread_chats_count', (data) => {
        setUnreadChatsCount(data.count);
      });

      setSocket(newSocket);
      return () => {
        newSocket.disconnect();
        // Ensure call is ended and hardware released on unmount or socket change
        handleEndCall(false);
      };
    } else {
      // If user logs out, ensure everything is stopped
      handleEndCall(false);
    }
  }, [user]);

  // Secondary backup effect to ensure media stops if user vanishes
  useEffect(() => {
    if (!user) {
      handleEndCall(false);
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
    } catch (err) { }
  };

  const readAllNotifications = async () => {
    try {
      await api.patch('/user/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { }
  };

  const clearNotifications = async () => {
    try {
      await api.delete('/user/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) { }
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
    } catch (err) { }
  };

  // Handle auto-answer from deep-links (Push Notifications)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('answerCall') === 'true') {
      console.log('[Socket] Detected answerCall from notification deep-link');
      // Use a brief delay to ensure the rest of the app/context is ready
      const timer = setTimeout(() => {
        setAnswerCallParam(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (call.isReceivingCall && !callAccepted && !stream && answerCallParam) {
      console.log('[Socket] Deep-link answer detected. Answering call...');
      answerCall();
      setAnswerCallParam(false);
      // Clear param to avoid re-triggering
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [call.isReceivingCall, callAccepted, stream, answerCallParam]);

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

    // Use the latest values from refs to avoid stale closures in socket listeners
    const currentStream = streamRef.current;
    const currentPeer = connectionRef.current;
    const currentTarget = targetUserRef.current || callRef.current.from;
    const currentSocket = socketRef.current;

    // Check if there was actually an active call or calling process
    const wasActive = isCalling || callAccepted || callRef.current.isReceivingCall;

    // 0. Stop all sounds
    if (ringtoneRef.current) ringtoneRef.current.pause();
    if (outgoingRef.current) outgoingRef.current.pause();
    if ('vibrate' in navigator) navigator.vibrate(0);

    // 1. Reset states IMMEDIATELY to stop UI loops
    setIsCalling(false);
    setCallAccepted(false);

    // Only show "Call Ended" message if there was an actual call happening
    if (wasActive) {
      setCallEnded(true);
    }
    setTargetUser(null);
    setIsMinimized(false);
    setRemoteIsMirrored(false);
    setRemoteVideoEnabled(true);
    setRemoteAudioEnabled(true);
    setLocalVideoEnabled(true);
    setLocalAudioEnabled(true);

    // 2. Emit signal to partner
    if (shouldEmit && currentSocket && currentTarget) {
      console.log('[Socket] Emitting end_call to:', currentTarget);
      currentSocket.emit('end_call', { to: currentTarget });
    }

    // 3. Destroy Peer Connection
    if (currentPeer) {
      try {
        currentPeer.destroy();
        console.log('[Media] Peer connection destroyed');
      } catch (e) {
        console.warn('[Cleanup] Peer destroy error:', e);
      }
      connectionRef.current = null;
    }

    // 4. Stop All Media Tracks (Camera & Mic) via hardware shutdown
    if (currentStream) {
      currentStream.getTracks().forEach(track => {
        track.stop();
        console.log(`[Media] Track ${track.kind} stopped permanently`);
      });
    }

    // Only clear binary streams and peer connection immediately
    setStream(null);
    setRemoteStream(null);

    // We keep the 'name' and 'avatar' in the call state for 2 seconds 
    // so the 'Call Ended' screen shows who we were talking to
    setCall(prev => ({ ...prev, isReceivingCall: false, from: '', signal: null }));

    // Auto-hide the "Call Ended" message after 2 seconds and clear the identity then
    setTimeout(() => {
      setCallEnded(false);
      setCall({ isReceivingCall: false, from: '', name: '', avatar: '', signal: null, type: 'voice' });
    }, 2000);
  };

  const toggleMediaHardware = async (type) => {
    if (!stream) return;

    const currentTo = targetUser || call.from;

    if (type === 'video') {
      const videoTrack = stream.getVideoTracks()[0];
      if (localVideoEnabled) {
        // TURN OFF: Truly stop the track and release hardware
        if (videoTrack) videoTrack.stop();
        setLocalVideoEnabled(false);
        if (socket && currentTo) {
          socket.emit('media_state_changed', { to: currentTo, type: 'video', isEnabled: false });
        }
      } else {
        // TURN ON / UPGRADE: Start a fresh track
        try {
          console.log('[Media] Powering on camera hardware...');
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode },
            audio: false
          });
          const newVideoTrack = newStream.getVideoTracks()[0];

          if (connectionRef.current && videoTrack) {
            console.log('[Media] Swapping tracks in peer connection');
            connectionRef.current.replaceTrack(videoTrack, newVideoTrack, stream);
          }

          // Update the stream tracks
          if (videoTrack) stream.removeTrack(videoTrack);
          stream.addTrack(newVideoTrack);

          setLocalVideoEnabled(true);
          // If it was a voice call, treat this as an upgrade
          if (call.type === 'voice') {
            setCall(prev => ({ ...prev, type: 'video' }));
          }

          if (socket && currentTo) {
            socket.emit('media_state_changed', { to: currentTo, type: 'video', isEnabled: true });
          }
        } catch (err) {
          console.error('[Media] Failed to power on camera:', err);
        }
      }
    }
    else if (type === 'audio') {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setLocalAudioEnabled(audioTrack.enabled);
        if (socket && currentTo) {
          socket.emit('media_state_changed', { to: currentTo, type: 'audio', isEnabled: audioTrack.enabled });
        }
      }
    }
  };

  const upgradeToVideo = async () => {
    console.log('[Media] Triggering upgrade to video...');
    await toggleMediaHardware('video');
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
      // ALWAYS request video:true even for voice calls to warm up the connection
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      console.log('[Media] Stream acquired successfully:', currentStream.id);

      // If voice call, immediately stop the video track to turn off the light
      if (type === 'voice') {
        const videoTrack = currentStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
          setLocalVideoEnabled(false);
        }
      }

      setStream(currentStream);

      const Peer = (await import('simple-peer')).default;
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: currentStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ]
        }
      });

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

      // Start Outgoing sound
      try {
        const out = new Audio('/outgoing.mp3'); // User should add this file
        out.loop = true;
        out.play().catch(() => { });
        outgoingRef.current = out;
      } catch (e) { }

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

    // IMMEDIATELY stop ringtone on answer
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
    if ('vibrate' in navigator) navigator.vibrate(0);

    try {
      console.log('[Media] Answering call, requesting media...');
      // ALWAYS request video:true to ensure connection consistency
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // If voice call, immediately stop the video track
      if (call.type === 'voice') {
        const videoTrack = currentStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
          setLocalVideoEnabled(false);
        }
      }

      setStream(currentStream);

      const Peer = (await import('simple-peer')).default;
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: currentStream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ]
        }
      });

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
      socket, unreadCount, unreadChatsCount, notifications, toast, activeChatId, onlineUsers,
      setNotifications, setUnreadCount, setUnreadChatsCount, setActiveChatId, setOnlineUsers,
      requestNotificationPermission, removeNotification, readAllNotifications, clearNotifications, clearNotificationsFromSender,
      call, callAccepted, callEnded, stream, remoteStream, isCalling,
      startCall, answerCall, rejectCall, handleEndCall,
      isMirrored, toggleMirror, switchCamera,
      remoteIsMirrored, isMinimized, setIsMinimized,
      remoteVideoEnabled, remoteAudioEnabled,
      localVideoEnabled, localAudioEnabled,
      toggleMediaHardware, upgradeToVideo
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
