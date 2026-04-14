'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  User, 
  MessageSquare,
  Paperclip,
  Image as ImageIcon,
  File as FileIcon,
  Download,
  CheckCheck,
  ArrowLeft,
  Trash2,
  UserCircle,
  Pencil,
  Reply,
  Pin,
  PinOff,
  Copy,
  SquareSlash,
  X,
  EyeOff,
  Eye,
  Lock,
  AlertCircle,
  CheckCircle2,
  Mail,
  Calendar,
  Mic,
  Square,
  Check,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

function MessagesContent() {
  const { user, fetchUser } = useAuth();
  const { socket, startCall, isCalling: isInitiatingCall, clearNotificationsFromSender, setUnreadChatsCount, setActiveChatId, onlineUsers, setOnlineUsers } = useSocket();
  const [users, setUsers] = useState([]); // This stores the current active set (normal or hidden)
  const [selectedUser, setSelectedUser] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [editingMessage, setEditingMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const [showMenu, setShowMenu] = useState(false);
  const [isHiddenMode, setIsHiddenMode] = useState(false);
  const [lockModal, setLockModal] = useState({ open: false, type: 'check', title: '', target: null });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDeletingConvo, setIsDeletingConvo] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [recipientStatus, setRecipientStatus] = useState('offline'); // online, offline, typing
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSearchingInChat, setIsSearchingInChat] = useState(false);
  const [innerSearchQuery, setInnerSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null); // stores message for whom menu is open
  const [swipeOffset, setSwipeOffset] = useState({}); // {msgId: xValue}

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `VN_${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Microphone permission denied' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        clearInterval(recordingTimerRef.current);
        audioChunksRef.current = [];
     }
  };

  const fetchConnections = async () => {
    try {
      const res = await api.get('/user/connections');
      const connectionData = res.data.data;
      setUsers(connectionData);
      
      // Request initial statuses for all these users
      if (socket) {
        connectionData.forEach(u => {
          socket.emit('get_user_status', { targetId: u.id });
        });
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchConnections();
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Real-time Update Listener
  useEffect(() => {
    if (!socket) return;
    const handleRefresh = () => fetchConnections();
    socket.on('connection_update', handleRefresh);
    return () => socket.off('connection_update', handleRefresh);
  }, [socket]);

  // Handle URL search params for quick redirect from Dashboard
  useEffect(() => {
    if (users.length > 0) {
      const userId = searchParams.get('userId');
      if (userId) {
        const userToSelect = users.find(u => u.id === userId);
        if (userToSelect) {
          setSelectedUser(userToSelect);
          if (window.innerWidth < 768) setShowChat(true);
          
          // CRITICAL FIX: Clear the URL parameter after processing it
          // This prevents being "stuck" on this user when switching chats
          const newUrl = window.location.pathname;
          window.history.replaceState(null, '', newUrl);
        }
      }
    }
  }, [users, searchParams]);

  // NEW SEARCH LOGIC: Handles 3 cases
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    // If we are currently in hidden mode, filter the hidden list
    // Otherwise, filter the normal list (checking for password match happens in another effect)
    return users.filter(u => 
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  useEffect(() => {
    if (searchQuery.length >= 4 && !isHiddenMode) {
      handleUnlockAttempt(searchQuery);
    }
  }, [searchQuery, isHiddenMode]);

  const handleUnlockAttempt = async (pwd) => {
    try {
      const res = await api.post('/user/chat/unlock', { password: pwd });
      if (res.data.success) {
        setUsers(res.data.data);
        setIsHiddenMode(true);
        setSearchQuery(''); // Clear search after unlock so we see ALL hidden chats
        if (navigator.vibrate) navigator.vibrate(50);
      }
    } catch (err) {
      // Silent fail - probably just a normal search query
    }
  };

  const handlePinChat = async () => {
    if (!selectedUser) return;
    try {
      await api.patch(`/user/chat/pin/${selectedUser.id}`);
      fetchConnections();
      setShowMenu(false);
    } catch (err) {}
  };

  const handleDeleteConversation = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/user/chat/conversation/${selectedUser.id}`);
      
      // Notify other side via socket
      if (socket) {
        socket.emit('messages_deleted', { 
          targetId: selectedUser.id, 
          messageIds: messages.map(m => m.id),
          everyone: true 
        });
      }

      setMessages([]); 
      setSelectedUser(null); 
      setIsDeletingConvo(false);
      fetchConnections();
    } catch (err) {}
  };

  const handleToggleHide = async () => {
    if (!selectedUser) return;
    try {
      if (isHiddenMode) {
        await api.post('/user/chat/hide', { targetId: selectedUser.id, hide: false });
        // No password needed here because we are already in hide mode, but for safety let's just refresh connections
        setIsHiddenMode(false);
        fetchConnections();
        setShowMenu(false);
        setSelectedUser(null);
      } else {
        if (!user.hasChatLock) {
          setLockModal({ open: true, type: 'set', title: 'Set Lock Password', target: selectedUser.id });
          return;
        }
        await api.post('/user/chat/hide', { targetId: selectedUser.id, hide: true });
        setSelectedUser(null); setShowMenu(false); fetchConnections();
      }
    } catch (err) {}
  };

  const handleSetPassword = async () => {
    if (password.length < 4) { setError('Min 4 chars'); return; }
    try {
      await api.post('/user/chat/lock-password', { password });
      await fetchUser(); // Update hasChatLock locally
      if (lockModal.target) await api.post('/user/chat/hide', { targetId: lockModal.target, hide: true });
      setLockModal({ open: false, type: 'check', title: '', target: null });
      setPassword(''); setSelectedUser(null); fetchConnections();
    } catch (err) { setError('Failed'); }
  };

  const handleResetHidden = async () => {
    if (!confirm('Confirm wipe?')) return;
    try {
      await api.delete('/user/chat/lock-reset');
      setIsHiddenMode(false);
      setLockModal({ open: false, type: 'check', title: '', target: null });
      fetchConnections();
    } catch (err) {}
  };

  useEffect(() => {
    if (!socket) return;
    
    const handleStatusUpdate = (data) => {
      if (selectedUser && data.userId === selectedUser.id) {
        setRecipientStatus(data.status);
      }
    };

    const handleTyping = (data) => {
      if (selectedUser && data.from === selectedUser.id) {
        setRecipientStatus('typing');
      }
    };

    const handleStopTyping = (data) => {
      if (selectedUser && data.from === selectedUser.id) {
        setRecipientStatus('online');
      }
    };

    socket.on('user_status', handleStatusUpdate);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('messages_deleted', (d) => {
      setMessages(prev => prev.filter(m => !d.messageIds.includes(m.id)));
      fetchConnections();
    });
    socket.on('message_updated', (u) => {
      setMessages(prev => prev.map(m => m.id === u.id ? u : m));
      fetchConnections();
    });
    socket.on('messages_read', (d) => {
      if (selectedUser && d.by === selectedUser.id) {
        setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
      }
    });

    return () => { 
      socket.off('user_status', handleStatusUpdate);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('messages_deleted'); 
      socket.off('message_updated'); 
      socket.off('messages_read');
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    if (!socket || !user) return;
    
    const updateListWithNewMessage = (m, isIncoming) => {
      setUsers(prev => {
        const userId = isIncoming ? m.senderId : m.receiverId;
        const userIndex = prev.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          // New contact not in current list? Trigger full fetch to be safe
          fetchConnections();
          return prev;
        }
        
        const updatedUsers = [...prev];
        const targetUser = { ...updatedUsers[userIndex] };
        
        targetUser.lastMessage = { content: m.content, createdAt: m.createdAt };
        if (isIncoming && (!selectedUser || selectedUser.id !== userId)) {
          targetUser.unreadCount = (targetUser.unreadCount || 0) + 1;
        }
        
        updatedUsers[userIndex] = targetUser;

        // Sort: Pinned first, then by last message time
        return updatedUsers.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      });
    };

    const handleReceive = (m) => {
        if (selectedUser && (m.senderId === selectedUser.id || m.senderId === user.id)) {
          setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
        }
        updateListWithNewMessage(m, true);
    };
    
    const handleSent = (m) => {
      setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
      updateListWithNewMessage(m, false);
    };

    socket.on('receive_message', handleReceive);
    socket.on('message_sent', handleSent);
    return () => { socket.off('receive_message'); socket.off('message_sent'); };
  }, [socket, selectedUser, user?.id]);

  useEffect(() => {
    const fetchMsgs = async () => {
      if (!selectedUser) return;
      try {
        const res = await api.get(`/user/chat/messages/${selectedUser.id}`);
        setMessages(res.data.data);
        await api.patch(`/user/chat/read/${selectedUser.id}`);
        if (socket) socket.emit('mark_read', { senderId: selectedUser.id });
        
        // Clear unread count locally
        let newUnreadChatCount = 0;
        setUsers(prev => {
          const updated = prev.map(u => u.id === selectedUser.id ? { ...u, unreadCount: 0 } : u);
          newUnreadChatCount = updated.filter(u => (u.unreadCount || 0) > 0).length;
          return updated;
        });
        
        // Update global sidebar badge count
        setUnreadChatsCount(newUnreadChatCount);

        // Clear notifications from this sender
        clearNotificationsFromSender(selectedUser.id);
        setActiveChatId(selectedUser.id);
        if (socket) {
          socket.emit('join_chat', { targetId: selectedUser.id });
          socket.emit('get_user_status', { targetId: selectedUser.id });
        }
      } catch (err) {}
    };
    fetchMsgs();
    return () => {
      setActiveChatId(null);
      setRecipientStatus('offline');
      if (socket) socket.emit('leave_chat');
    };
  }, [selectedUser, socket]);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: isInitialLoad ? 'auto' : 'smooth' });
        if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [messages, isInitialLoad]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (isSending || (!newMessage.trim() && !selectedFile) || !selectedUser || !socket) return;
    setIsSending(true);
    
    let fileData = null;
    if (selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await api.post('/user/chat/upload', formData);
        fileData = res.data.data;
        setSelectedFile(null);
      } catch (err) {
        setMessage({ type: 'error', text: 'Upload failed' });
        setUploading(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 1000);
        return;
      }
      setUploading(false);
    }

    if (editingMessage) {
      try {
        await api.patch('/user/chat/message', { 
          messageId: editingMessage.id, 
          content: newMessage 
        });
        setEditingMessage(null);
      } catch (err) {}
    } else {
      const type = fileData ? (fileData.type.startsWith('image/') ? 'IMAGE' : fileData.type.startsWith('video/') ? 'VIDEO' : fileData.type.startsWith('audio/') ? 'VOICE' : 'FILE') : 'TEXT';
      socket.emit('send_message', { 
        content: newMessage, 
        receiverId: selectedUser.id,
        type,
        fileUrl: fileData?.url,
        fileName: fileData?.name || selectedFile?.name,
        fileSize: fileData?.size || selectedFile?.size,
        parentId: replyingTo?.id
      });
      setReplyingTo(null);
    }
    
    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = '56px';
    setIsSending(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File too large (max 20MB)' });
        setTimeout(() => setMessage({ type: '', text: '' }), 1000);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDeleteSingleMessage = async (msgId) => {
    if (!confirm('Delete this message for everyone?')) return;
    try {
      await api.delete('/user/chat/messages', { data: { messageIds: [msgId], targetId: selectedUser.id } });
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (socket) socket.emit('messages_deleted', { targetId: selectedUser.id, messageIds: [msgId] });
      fetchConnections();
    } catch (err) {}
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    setMessage({ type: 'success', text: 'Copied to clipboard' });
    setTimeout(() => setMessage({ type: '', text: '' }), 1000);
  };

  const getAvatar = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith('http') ? avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${avatar}`;
  };

  const MessageBubble = ({ msg, isMine, isMobileView }) => {
    const isEditing = editingMessage?.id === msg.id;
    
    // Swipe Handler
    const handleDragEnd = (_, info) => {
      if (info.offset.x > 80) {
        if (navigator.vibrate) navigator.vibrate(50);
        setReplyingTo(msg);
        if (textareaRef.current) textareaRef.current.focus();
      }
    };

    // Long Press Handler
    let pressTimer;
    const startPress = () => {
      pressTimer = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(50);
        setMobileMenuOpen(msg);
      }, 500);
    };
    const cancelPress = () => clearTimeout(pressTimer);

    return (
      <motion.div 
        key={msg.id}
        drag="x"
        dragConstraints={{ left: 0, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className={`flex group relative px-4 md:px-0 ${isMine ? 'justify-end' : 'justify-start'}`}
      >
        {/* Swipe Indicator (Visible during drag) */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity">
          <Reply className="w-6 h-6 text-primary" />
        </div>

        <div 
          className={`flex items-start gap-2 max-w-[90%] sm:max-w-[85%] md:max-w-[450px] ${isMine ? 'flex-row' : 'flex-row-reverse'}`}
          onTouchStart={isMobileView ? startPress : undefined}
          onTouchEnd={isMobileView ? cancelPress : undefined}
          onContextMenu={e => { e.preventDefault(); setMobileMenuOpen(msg); }}
        >
          {/* Desktop Actions (Hover only) */}
          {!isMobileView && (
            <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-0.5 transition-opacity self-center shrink-0">
               <button onClick={() => { setReplyingTo(msg); textareaRef.current?.focus(); }} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all" title="Reply"><Reply size={12} /></button>
               {isMine && <button onClick={() => { setEditingMessage(msg); setNewMessage(msg.content); textareaRef.current?.focus(); }} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all" title="Edit"><Pencil size={12} /></button>}
               <button onClick={() => handleCopyMessage(msg.content)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all" title="Copy"><Copy size={12} /></button>
               {isMine && <button onClick={() => handleDeleteSingleMessage(msg.id)} title="Delete" className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all"><Trash2 size={12} /></button>}
            </div>
          )}

          <div className={`relative px-4 py-2.5 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] text-sm transition-all border ${isMine ? 'bg-primary text-white border-primary/20 rounded-tr-none' : 'bg-muted/40 text-foreground border-border rounded-tl-none'}`}>
            {/* Reply Block */}
            {msg.parent && (
              <div 
                onClick={() => {
                   const parentMsg = document.getElementById(`msg-${msg.parent.id}`);
                   if (parentMsg) parentMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`mb-2 p-2.5 rounded-xl border-l-[3px] text-[11px] cursor-pointer transition-colors max-w-full overflow-hidden ${isMine ? 'bg-white/10 border-white/40 text-white/90' : 'bg-muted border-primary/40 text-muted-foreground'}`}
              >
                <p className="font-extrabold text-[10px] mb-0.5 text-primary-foreground opacity-80">{msg.parent.sender?.name || 'User'}</p>
                <p className="opacity-70 italic line-clamp-2 break-all">{msg.parent.content || '[Media]'}</p>
              </div>
            )}

            {msg.type === 'IMAGE' && (
              <img src={getAvatar(msg.fileUrl)} onClick={() => window.open(getAvatar(msg.fileUrl))} className="max-w-full rounded-xl mb-1.5 cursor-pointer hover:opacity-90 transition-opacity" />
            )}
            {msg.type === 'VIDEO' && (
              <video controls className="max-w-full rounded-xl mb-1.5"><source src={getAvatar(msg.fileUrl)} type="video/mp4" /></video>
            )}
            {msg.type === 'VOICE' && (
              <audio controls className="max-w-full rounded-full mb-1.5 min-w-[200px]" style={{ height: '40px' }}>
                <source src={getAvatar(msg.fileUrl)} type="audio/mpeg" />
              </audio>
            )}
            {msg.type === 'FILE' && (
              <a href={getAvatar(msg.fileUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-background/80 transition-colors mb-1.5 border border-current/10">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-current/20 bg-current/5">
                   <FileIcon size={20} className="text-current" />
                </div>
                <div className="min-w-0 flex-1">
                   <p className="font-bold text-sm truncate">{msg.fileName || 'Attachment'}</p>
                   <p className="text-[10px] opacity-70 mt-0.5">{msg.fileSize ? (msg.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Document'}</p>
                </div>
                <Download size={16} className="shrink-0 opacity-70" />
              </a>
            )}

            {/* Text Content */}
            {msg.content && (
               <div className="mb-0.5 leading-relaxed break-all md:break-words whitespace-pre-wrap">
                  {msg.content}
               </div>
            )}

            {/* Meta (Time + Status) */}
            <div className={`flex items-center justify-end gap-1.5 mt-1 opacity-60 text-[10px] uppercase font-black ${isMine ? 'text-white' : 'text-muted-foreground'}`}>
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {isMine && (
                msg.isRead ? (
                  <CheckCheck className="w-3.5 h-3.5 text-blue-300 drop-shadow-sm" />
                ) : (
                  <Check className="w-3 h-3 opacity-70" />
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout pageTitle="Messages" fullWidth>
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[2000] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[calc(100vh-4rem)] bg-card flex overflow-hidden selection:bg-primary/30">
        
        {/* Sidebar */}
        <div className={`${isMobileView && showChat ? 'hidden' : 'flex'} w-full md:w-80 lg:w-96 border-r border-border flex-col bg-muted/5`}>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isHiddenMode && (
                  <button 
                    onClick={() => { setIsHiddenMode(false); fetchConnections(); }}
                    className="p-1.5 hover:bg-muted rounded-lg transition-all text-muted-foreground mr-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">{isHiddenMode ? 'Hidden Chats' : 'Chat Inbox'}</h2>
                {isHiddenMode && <Lock className="w-4 h-4 text-primary animate-pulse" />}
              </div>
              <div className={`p-2.5 rounded-xl ${isHiddenMode ? 'bg-primary text-white shadow-lg' : 'bg-primary/10 text-primary'}`}><MessageSquare className="w-5 h-5" /></div>
            </div>
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"><Search className="w-4 h-4" /></div>
              <input 
                type="text" 
                suppressHydrationWarning
                placeholder={isHiddenMode ? 'Search hidden...' : 'Search chats...'} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 custom-scrollbar focus:outline-none">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 px-6 opacity-40">
                <User className="w-10 h-10 mx-auto mb-3" />
                <p className="text-xs font-black uppercase tracking-widest">{searchQuery ? 'No results matches' : 'No conversations found'}</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { if (selectedUser?.id !== u.id) { setMessages([]); setIsInitialLoad(true); } setSelectedUser(u); if (isMobileView) setShowChat(true); }}
                  className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all group ${selectedUser?.id === u.id ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'hover:bg-muted border border-transparent'}`}
                >
                  <div className={`${isMobileView ? 'w-10 h-10' : 'w-12 h-12'} rounded-2xl overflow-hidden border-2 border-background shadow-sm shrink-0`} onClick={(e) => { e.stopPropagation(); setViewingProfile(u); }}>
                    {u.avatar ? (
                      <img 
                        src={getAvatar(u.avatar)} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className={`w-full h-full items-center justify-center font-bold bg-primary/10 text-primary ${u.avatar ? 'hidden' : 'flex'} ${isMobileView ? 'text-xs' : ''}`}>
                      {(u.name || "?").charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className={`font-bold truncate ${isMobileView ? 'text-xs' : 'text-sm'}`}>{u.name}</p>
                        {u.isPinned && <Pin size={10} className="text-amber-500 fill-amber-500/20" />}
                      </div>
                      {u.lastMessage && <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">{new Date(u.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <p className="text-xs truncate font-medium opacity-60 italic flex-1">{u.lastMessage ? u.lastMessage.content : 'Start chatting...'}</p>
                       {u.unreadCount > 0 && (
                         <div className="min-w-[18px] h-[18px] bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-300">
                           {u.unreadCount}
                         </div>
                       )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${isMobileView && !showChat ? 'hidden' : 'flex'} flex-1 flex-col bg-card relative overflow-hidden`}>
          {selectedUser ? (
            <>
              <div className="p-3 md:p-6 border-b border-border flex items-center justify-between bg-background/50 backdrop-blur-md z-30">
                <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
                  {isMobileView && <button onClick={() => setShowChat(false)} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft className="w-5 h-5" /></button>}
                  <div className={`${isMobileView ? 'w-8 h-8' : 'w-12 h-12'} rounded-2xl overflow-hidden border-2 border-background shadow-sm cursor-pointer shrink-0`} onClick={() => setViewingProfile(selectedUser)}>
                    {selectedUser.avatar ? (
                      <img 
                        src={getAvatar(selectedUser.avatar)} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className={`w-full h-full items-center justify-center font-bold bg-primary/10 text-primary ${selectedUser.avatar ? 'hidden' : 'flex'} ${isMobileView ? 'text-xs' : ''}`}>
                      {(selectedUser.name || "?").charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-black text-foreground uppercase tracking-tight ${isMobileView ? 'text-xs' : 'text-base'} truncate cursor-pointer flex items-center gap-2`} onClick={() => setViewingProfile(selectedUser)}>
                      {selectedUser.name}
                      {selectedUser.isPinned && <Pin size={12} className="text-amber-500 shrink-0" />}
                    </h3>
                    <p className={`${isMobileView ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-widest flex items-center gap-1 truncate ${recipientStatus === 'typing' ? 'text-primary' : recipientStatus === 'online' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      <span className={`w-1 h-1 rounded-full animate-pulse shrink-0 ${recipientStatus === 'offline' ? 'bg-muted-foreground' : 'bg-current'}`} /> 
                      {recipientStatus === 'typing' ? 'Typing...' : recipientStatus === 'online' ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 relative" ref={menuRef}>
                  <button 
                    disabled={isInitiatingCall}
                    onClick={() => startCall(selectedUser.id, 'voice', selectedUser)} 
                    className={`p-2.5 rounded-xl transition-all ${isInitiatingCall ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button 
                    disabled={isInitiatingCall}
                    onClick={() => startCall(selectedUser.id, 'video', selectedUser)} 
                    className={`p-2.5 rounded-xl transition-all ${isInitiatingCall ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <Video className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setIsSearchingInChat(!isSearchingInChat); setInnerSearchQuery(''); }} 
                    className={`p-2.5 rounded-xl transition-all ${isSearchingInChat ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowMenu(!showMenu)} className={`p-2.5 rounded-xl transition-all ${showMenu ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}><MoreVertical className="w-4 h-4" /></button>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 top-14 w-56 bg-card border border-border rounded-2xl shadow-2xl z-[100] p-1.5">
                        <button onClick={() => { setViewingProfile(selectedUser); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-all text-xs font-bold uppercase tracking-wide text-foreground group"><User className="w-4 h-4 text-primary" /> View Profile</button>
                        <button onClick={handlePinChat} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-all text-xs font-bold uppercase tracking-wide text-foreground group">
                          {selectedUser?.isPinned ? <><PinOff className="w-4 h-4 text-amber-500" /> Unpin Chat</> : <><Pin className="w-4 h-4 text-primary" /> Pin Chat</>}
                        </button>
                        <button onClick={handleToggleHide} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wide group ${isHiddenMode ? 'hover:bg-emerald-500/10 text-emerald-500' : 'hover:bg-indigo-500/10 text-indigo-500'}`}>{isHiddenMode ? <><Eye className="w-4 h-4" /> Unhide Chat</> : <><EyeOff className="w-4 h-4" /> Hide Conversation</>}</button>
                        <div className="h-px bg-border my-1 mx-2" /><button onClick={() => setIsDeletingConvo(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 transition-all text-xs font-bold uppercase tracking-wide text-rose-500"><Trash2 className="w-4 h-4" /> Delete Chat</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Inner Chat Search Bar */}
              <AnimatePresence>
                {isSearchingInChat && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 py-3 bg-muted/30 border-b border-border flex items-center gap-3 overflow-hidden">
                    <Search className="w-3.5 h-3.5 text-primary" />
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Search messages..." 
                      value={innerSearchQuery}
                      onChange={(e) => setInnerSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-[11px] font-bold uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50"
                    />
                    {innerSearchQuery && (
                      <span className="text-[10px] font-black text-primary uppercase mr-2 transition-all">
                        {messages.filter(m => m.content?.toLowerCase().includes(innerSearchQuery.toLowerCase())).length} Found
                      </span>
                    )}
                    <button onClick={() => { setIsSearchingInChat(false); setInnerSearchQuery(''); }} className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all"><X size={14} /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 space-y-4 custom-scrollbar bg-card/10">
                {messages
                  .filter(m => !innerSearchQuery || (m.content && m.content.toLowerCase().includes(innerSearchQuery.toLowerCase())))
                  .map((msg, i) => (
                    <div id={`msg-${msg.id}`} key={msg.id || i}>
                       <MessageBubble 
                        msg={msg} 
                        isMine={msg.senderId === user?.id} 
                        isMobileView={isMobileView} 
                      />
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 md:px-10 md:pb-8">
                {replyingTo && (
                  <div className="flex items-center justify-between px-6 py-3 bg-muted border-x border-t border-border rounded-t-[2rem] mb-[-1px] animate-in fade-in slide-in-from-bottom-2 selection:bg-primary/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1 h-8 rounded-full bg-primary" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Replying to {replyingTo.sender?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate italic">{replyingTo.type === 'IMAGE' ? '[Image]' : replyingTo.type === 'VIDEO' ? '[Video]' : replyingTo.type === 'VOICE' ? '[Voice Note]' : replyingTo.type === 'FILE' ? '[Document]' : replyingTo.content}</p>
                      </div>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all"><X size={16} /></button>
                  </div>
                )}
                {selectedFile && (
                  <div className="flex items-center justify-between px-6 py-3 bg-primary/10 rounded-t-[2rem] border-x border-t border-primary/20 mb-[-1px] animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-5 h-5 text-primary" /> : <FileIcon className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-primary uppercase tracking-widest leading-none mb-1">{selectedFile.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">Ready to send</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all"><X size={16} /></button>
                  </div>
                )}
                {editingMessage && (
                  <div className="flex items-center justify-between px-6 py-2 bg-primary/5 rounded-t-2xl border-x border-t border-primary/10 mb-[-1px]">
                    <div className="flex items-center gap-2 text-primary">
                      <Pencil size={12} className="animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Editing Message</span>
                    </div>
                    <button onClick={() => { setEditingMessage(null); setNewMessage(''); }} className="text-muted-foreground hover:text-rose-500"><X size={14} /></button>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-1">
                    <input type="file" disabled={isSending} ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <button type="button" disabled={isSending} onClick={() => fileInputRef.current?.click()} className={`p-2.5 rounded-xl transition-all ${isSending ? 'opacity-50 cursor-not-allowed text-muted-foreground' : 'hover:bg-muted text-muted-foreground'}`}><Paperclip size={20} /></button>
                    <button type="button" disabled={isSending} onClick={() => { if(fileInputRef.current) { fileInputRef.current.accept = "image/*,video/*"; fileInputRef.current.click(); setTimeout(() => {if(fileInputRef.current) fileInputRef.current.accept = ""}, 1000)} }} className={`p-2.5 rounded-xl transition-all hidden md:block ${isSending ? 'opacity-50 cursor-not-allowed text-muted-foreground' : 'hover:bg-muted text-muted-foreground'}`}><ImageIcon size={20} /></button>
                  </div>
                  <div className="flex-1 relative">
                    {isRecording ? (
                      <div className="w-full flex items-center justify-between px-6 py-4 bg-muted border border-border rounded-[2rem] min-h-[58px]">
                        <div className="flex items-center gap-3 text-rose-500 font-bold animate-pulse">
                          <Mic className="w-5 h-5" /> Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </div>
                        <button type="button" onClick={cancelRecording} className="text-muted-foreground hover:text-rose-500 transition-all font-bold text-xs uppercase tracking-widest flex items-center gap-1.5"><Trash2 className="w-4 h-4" />Cancel</button>
                      </div>
                    ) : (
                      <textarea 
                        ref={textareaRef} 
                        disabled={isSending}
                        placeholder="Type your message..." 
                        value={newMessage} 
                        onChange={(e) => { 
                          setNewMessage(e.target.value); 
                          e.target.style.height = 'auto'; 
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                          
                          // Typing indicator
                          if (socket && selectedUser) {
                            socket.emit('typing', { to: selectedUser.id });
                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = setTimeout(() => {
                              socket.emit('stop_typing', { to: selectedUser.id });
                            }, 2000);
                          }
                        }} 
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} 
                        className={`w-full px-6 py-4 bg-muted border border-border rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm min-h-[58px] max-h-[120px] resize-none overflow-y-auto custom-scrollbar ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`} 
                      />
                    )}
                  </div>
                  {isRecording ? (
                     <button type="button" onClick={stopRecording} className="p-4 bg-rose-500 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"><Square className="w-5 h-5" /></button>
                  ) : newMessage.trim() || selectedFile ? (
                     <button type="submit" disabled={isSending} className={`p-4 rounded-2xl shadow-xl transition-all ${isSending ? 'bg-primary/50 text-white/50 cursor-not-allowed flex items-center justify-center' : 'bg-primary text-white hover:scale-105 active:scale-95 flex items-center justify-center'}`}>
                       {isSending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                     </button>
                  ) : (
                     <button type="button" disabled={isSending} onMouseDown={startRecording} className={`p-4 rounded-2xl shadow-xl transition-all flex items-center justify-center ${isSending ? 'bg-primary/50 text-white/50 cursor-not-allowed' : 'bg-primary text-white hover:scale-105 active:scale-95'}`}><Mic className="w-5 h-5" /></button>
                  )}
                </form>
              </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center p-8 opacity-20"><MessageSquare className="w-16 h-16 mb-6" /><p className="text-xs font-black uppercase tracking-widest italic">Chat Standby</p></div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {/* Profile Modal */}
        {viewingProfile && (
           <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingProfile(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
             <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-card border border-border w-full max-w-[280px] overflow-hidden rounded-[2.5rem] shadow-2xl">
               <div className="h-20 bg-gradient-to-r from-primary to-indigo-600 relative"><button onClick={() => setViewingProfile(null)} className="absolute top-4 right-4 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all"><X className="w-4 h-4" /></button></div>
               <div className="px-5 pb-6 text-center -mt-10">
                 <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-[1.5rem] border-4 border-background overflow-hidden bg-muted shadow-lg">
                      {viewingProfile.avatar ? (
                        <img 
                          src={getAvatar(viewingProfile.avatar)} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className={`w-full h-full items-center justify-center text-2xl font-bold bg-primary text-white ${viewingProfile.avatar ? 'hidden' : 'flex'}`}>
                        {(viewingProfile.name || viewingProfile.email || "?").charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-background shadow-sm ${onlineUsers[viewingProfile.id] === 'online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                 </div>
                 <h2 className="text-lg font-black mt-2 uppercase tracking-tight truncate px-2">{viewingProfile.name || 'Anonymous'}</h2>
                 <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 mb-6 truncate px-4">Secure Profile</p>
                 
                 <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="p-2 bg-muted/50 rounded-2xl border border-border">
                       <p className="text-[8px] font-black uppercase text-muted-foreground mb-0.5">Status</p>
                       <p className={`text-[9px] font-bold uppercase ${onlineUsers[viewingProfile.id] === 'online' ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {onlineUsers[viewingProfile.id] === 'online' ? 'Active' : 'Offline'}
                       </p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-2xl border border-border">
                       <p className="text-[8px] font-black uppercase text-muted-foreground mb-0.5">Member Since</p>
                       <p className="text-[9px] font-bold uppercase truncate">
                          {viewingProfile.createdAt ? new Date(viewingProfile.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Join Date Hidden'}
                       </p>
                    </div>
                 </div>
                 
                 <div className="space-y-2 text-left">
                    <div className="flex flex-col gap-1 p-3 bg-muted/30 rounded-xl border border-border/50">
                       <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-3 h-3 text-primary shrink-0" />
                          <p className="text-[7px] font-black uppercase text-muted-foreground">Biography</p>
                       </div>
                       <p className="text-[10px] font-bold text-foreground leading-relaxed italic">
                          {viewingProfile.bio || "No biography provided by user."}
                       </p>
                    </div>
                 </div>
                 <button onClick={() => setViewingProfile(null)} className="w-full mt-6 py-3 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">Close</button>
               </div>
             </motion.div>
           </div>
        )}

        {lockModal.open && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLockModal({ ...lockModal, open: false })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-border w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6"><Lock className="w-8 h-8" /></div>
              <h2 className="text-xl font-black text-center uppercase tracking-tight mb-2">{lockModal.title}</h2>
              <div className="space-y-4">
                <input type="password" placeholder="Min 4 chars" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:border-primary text-center font-black tracking-widest" />
                {error && <p className="text-[10px] text-rose-500 font-bold uppercase text-center">{error}</p>}
                <button onClick={handleSetPassword} className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Secure Chat</button>
              </div>
            </motion.div>
          </div>
        )}
        {isDeletingConvo && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDeletingConvo(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-border w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl">
               <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-8 h-8" /></div>
               <h2 className="text-xl font-black text-center uppercase tracking-tight mb-2">Delete Chat?</h2>
               <div className="space-y-3"><button onClick={handleDeleteConversation} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl">Wipe History</button><button onClick={() => setIsDeletingConvo(false)} className="w-full text-foreground/50 text-[10px] font-black uppercase tracking-widest mt-2 hover:text-foreground text-center">Cancel</button></div>
             </motion.div>
           </div>
        )}
        {/* Mobile Action Menu (Long Press) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileMenuOpen(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-border w-full max-w-[280px] overflow-hidden rounded-[2.5rem] shadow-2xl p-4">
                <div className="mb-4 text-center">
                   <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Message Action</p>
                   <p className="text-xs truncate font-bold px-4">{mobileMenuOpen.content || '[Media]'}</p>
                </div>
                <div className="space-y-2">
                   <button onClick={() => { setReplyingTo(mobileMenuOpen); setMobileMenuOpen(null); textareaRef.current?.focus(); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
                      <Reply size={18} /><span className="text-xs font-black uppercase tracking-widest">Reply</span>
                   </button>
                   <button onClick={() => { handleCopyMessage(mobileMenuOpen.content); setMobileMenuOpen(null); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-muted transition-all text-muted-foreground">
                      <Copy size={18} /><span className="text-xs font-black uppercase tracking-widest">Copy</span>
                   </button>
                   {mobileMenuOpen.senderId === user?.id && (
                     <>
                        <button onClick={() => { setEditingMessage(mobileMenuOpen); setNewMessage(mobileMenuOpen.content); setMobileMenuOpen(null); textareaRef.current?.focus(); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-muted transition-all text-muted-foreground">
                           <Pencil size={18} /><span className="text-xs font-black uppercase tracking-widest">Edit</span>
                        </button>
                        <button onClick={() => { handleDeleteSingleMessage(mobileMenuOpen.id); setMobileMenuOpen(null); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-rose-500/10 text-rose-500 transition-all font-black">
                           <Trash2 size={18} /><span className="text-xs uppercase tracking-widest">Delete</span>
                        </button>
                     </>
                   )}
                </div>
                <button onClick={() => setMobileMenuOpen(null)} className="w-full mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-all py-2">Cancel</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-card"><div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <MessagesContent />
    </Suspense>
  );
}
