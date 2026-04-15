'use client';

import { useState, useEffect, useRef, useMemo, Suspense, memo } from 'react';
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
  FileText,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/url';

const MessageBubble = memo(({ 
  msg, 
  isMine, 
  isMobileView, 
  onMobileMenu, 
  onReply, 
  onEdit, 
  onCopy, 
  onDelete, 
  textareaRef,
  swipeOffset,
  setSwipeOffset,
  onZoomMedia
}) => {
  // getMediaUrl replaces the local getAvatar logic


  let pressTimer;
  const startPress = () => {
    pressTimer = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      onMobileMenu(msg);
    }, 800);
  };
  const cancelPress = () => clearTimeout(pressTimer);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex group relative px-4 md:px-0 ${isMine ? 'justify-end' : 'justify-start'}`}
    >
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragStart={() => cancelPress()}
        onDrag={(e, info) => {
          if (Math.abs(info.offset.x) > 10) {
            setSwipeOffset(prev => ({ ...prev, [msg.id]: info.offset.x }));
          }
        }}
        onDragEnd={(e, info) => {
          // If swiped enough, trigger reply
          if (Math.abs(info.offset.x) > 60) {
            if (navigator.vibrate) navigator.vibrate(20);
            onReply(msg);
            textareaRef.current?.focus();
          }
          setSwipeOffset(prev => ({ ...prev, [msg.id]: 0 }));
        }}
        className={`flex items-start gap-2 max-w-[90%] sm:max-w-[85%] md:max-w-[450px] ${isMine ? 'flex-row' : 'flex-row-reverse'}`}
        onTouchStart={isMobileView ? startPress : undefined}
        onTouchEnd={isMobileView ? cancelPress : undefined}
        onContextMenu={e => { e.preventDefault(); onMobileMenu(msg); }}
      >
        {!isMobileView && (
          <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-0.5 transition-opacity self-center shrink-0">
             <button onClick={() => { onReply(msg); textareaRef.current?.focus(); }} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all" title="Reply"><Reply size={12} /></button>
             {isMine && <button onClick={() => { onEdit(msg); textareaRef.current?.focus(); }} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all" title="Edit"><Pencil size={12} /></button>}
             <button onClick={() => onCopy(msg.content)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-all" title="Copy"><Copy size={12} /></button>
             {isMine && <button onClick={() => onDelete(msg.id)} title="Delete" className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all"><Trash2 size={12} /></button>}
          </div>
        )}

        <div className={`relative px-3 py-2 rounded-2xl shadow-sm text-sm transition-all border ${isMine ? 'bg-primary/20 backdrop-blur-2xl text-white border-primary/30 rounded-tr-none' : 'bg-muted/80 backdrop-blur-2xl text-foreground border-border/50 rounded-tl-none shadow-md'}`}>
          {msg.parent && (
            <div 
              onClick={() => {
                 const parentMsg = document.getElementById(`msg-${msg.parent.id}`);
                 if (parentMsg) parentMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`mb-2 p-2.5 rounded-xl border-l-[3px] text-[11px] cursor-pointer transition-colors max-w-full overflow-hidden bg-white/5 border-white/20 text-white/80`}
            >
              <p className="font-extrabold text-[10px] mb-0.5 opacity-90">{msg.parent.sender?.name || 'User'}</p>
              <p className="opacity-60 italic line-clamp-1 break-all">{msg.parent.content || '[Media]'}</p>
            </div>
          )}

          {msg.type === 'IMAGE' && (
            <div className="max-w-[320px] max-h-[320px] overflow-hidden rounded-2xl mb-1 cursor-pointer hover:opacity-95 transition-all shadow-sm">
              <img 
                src={getMediaUrl(msg.fileUrl)} 
                onClick={() => onZoomMedia(msg)} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          {msg.type === 'VIDEO' && (
            <div className="relative max-w-[320px] max-h-[320px] overflow-hidden rounded-2xl mb-1 cursor-pointer group shadow-sm bg-black/10" onClick={() => onZoomMedia(msg)}>
              <video className="w-full h-full object-cover pointer-events-none">
                <source src={getMediaUrl(msg.fileUrl)} />
              </video>
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                  <Play size={24} className="text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>
          )}
          {msg.type === 'VOICE' && (
            <audio controls className={`max-w-full rounded-full mb-1 min-w-[200px] opacity-70 hover:opacity-100 transition-opacity scale-[0.95] origin-left`} style={{ height: '32px' }}>
              <source src={getMediaUrl(msg.fileUrl)} type="audio/webm" />
              <source src={getMediaUrl(msg.fileUrl)} type="audio/ogg" />
              <source src={getMediaUrl(msg.fileUrl)} type="audio/mp3" />
            </audio>
          )}
          {msg.type === 'FILE' && (
            <a href={getMediaUrl(msg.fileUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-background/50 rounded-xl hover:bg-background/80 transition-colors mb-1.5 border border-current/10">

              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-current/20 bg-current/5">
                 <FileIcon size={20} className="text-current" />
              </div>
              <div className="min-w-0 flex-1">
                 <p className="font-bold text-sm truncate">Attachment</p>
                 <p className="text-[10px] opacity-70 mt-0.5">{msg.fileSize ? (msg.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'Document'}</p>
              </div>
              <Download size={16} className="shrink-0 opacity-70" />
            </a>
          )}

          {msg.content && msg.type !== 'VOICE' && (
             <div className="mb-0.5 leading-relaxed break-all md:break-words whitespace-pre-wrap">
                {(msg.type === 'IMAGE' || msg.type === 'VIDEO') 
                  ? (msg.content !== '[Photo]' && msg.content !== '[Video]' && msg.content !== msg.fileName ? msg.content : null)
                  : msg.content
                }
             </div>
          )}

          <div className={`flex items-center justify-end gap-1.5 mt-0.5 opacity-60 text-[9px] uppercase font-medium ${isMine ? 'text-white' : 'text-muted-foreground'}`}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {isMine && (
              msg.isRead ? (
                <CheckCheck className="w-3.5 h-3.5 text-blue-300 drop-shadow-sm" strokeWidth={3} />
              ) : (
                <Check className="w-3 h-3 opacity-70" strokeWidth={3} />
              )
            )}
          </div>
        </div>
        
        {/* Swipe Handle Indicator */}
        <AnimatePresence>
          {swipeOffset[msg.id] && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: Math.min(Math.abs(swipeOffset[msg.id]) / 40, 1.2),
                opacity: Math.min(Math.abs(swipeOffset[msg.id]) / 30, 1),
                x: isMine ? (swipeOffset[msg.id] < 0 ? swipeOffset[msg.id] : 0) : (swipeOffset[msg.id] > 0 ? swipeOffset[msg.id] : 0)
              }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ 
                right: isMine ? 'auto' : -40,
                left: isMine ? -40 : 'auto',
              }}
              className="absolute top-1/2 -translate-y-1/2 text-primary z-0"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Reply size={16} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

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
  
  const [lightboxMedia, setLightboxMedia] = useState(null);
  const [pendingMedia, setPendingMedia] = useState(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState(null);

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
      fetchConnections(); // Refresh list immediately
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
    let fileToUpload = pendingMedia || selectedFile;
    if (fileToUpload) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', fileToUpload);
        const res = await api.post('/user/chat/upload', formData);
        fileData = res.data.data;
        setPendingMedia(null);
        setPendingPreviewUrl(null);
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
        fileUrl: fileData?.path || fileData?.url,
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
      setPendingMedia(file);
      const url = URL.createObjectURL(file);
      setPendingPreviewUrl(url);
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

  // Use centralized getMediaUrl instead of local getAvatar


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
          <div className="p-4 px-5 space-y-4">
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
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"><Search className="w-3.5 h-3.5" /></div>
              <input 
                type="text" 
                suppressHydrationWarning
                placeholder={isHiddenMode ? 'Search hidden...' : 'Search chats...'} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-11 pr-4 py-2.5 bg-muted border border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-xs" 
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
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all group ${selectedUser?.id === u.id ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'hover:bg-muted border border-transparent'}`}
                >
                  <div className={`${isMobileView ? 'w-9 h-9' : 'w-10 h-10'} rounded-xl overflow-hidden border-2 border-background shadow-sm shrink-0`} onClick={(e) => { e.stopPropagation(); setViewingProfile(u); }}>
                    {u.avatar ? (
                      <img 
                        src={getMediaUrl(u.avatar)} 
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
                       <p className={`text-xs truncate font-medium opacity-60 flex-1 ${u.lastMessage ? 'text-foreground/80' : 'italic'}`}>{u.lastMessage ? u.lastMessage.content : 'Start chatting...'}</p>
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
              <div className="p-2.5 md:p-4 border-b border-border flex items-center justify-between bg-background/50 backdrop-blur-md z-30">
                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                  {isMobileView && <button onClick={() => setShowChat(false)} className="p-2 -ml-2 text-muted-foreground"><ArrowLeft className="w-5 h-5" /></button>}
                  <div className={`${isMobileView ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl overflow-hidden border-2 border-background shadow-sm cursor-pointer shrink-0`} onClick={() => setViewingProfile(selectedUser)}>
                    {selectedUser.avatar ? (
                      <img 
                        src={getMediaUrl(selectedUser.avatar)} 
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
                    className={`p-2 rounded-lg transition-all ${isInitiatingCall ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    disabled={isInitiatingCall}
                    onClick={() => startCall(selectedUser.id, 'video', selectedUser)} 
                    className={`p-2 rounded-lg transition-all ${isInitiatingCall ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <Video className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => { setIsSearchingInChat(!isSearchingInChat); setInnerSearchQuery(''); }} 
                    className={`p-2 rounded-lg transition-all ${isSearchingInChat ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setShowMenu(!showMenu)} className={`p-2 rounded-lg transition-all ${showMenu ? 'bg-primary text-white shadow-lg' : 'hover:bg-muted text-muted-foreground'}`}><MoreVertical className="w-3.5 h-3.5" /></button>
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

              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-4 md:space-y-6" id="chat-scroller">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 pointer-events-none">
                    <MessageSquare className="w-16 h-16 mb-4" />
                    <p className="text-sm font-black uppercase tracking-[0.2em]">End-to-End Encrypted</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble 
                      key={msg.id} 
                      msg={msg} 
                      isMine={msg.senderId === user?.id} 
                      isMobileView={isMobileView}
                      onMobileMenu={setMobileMenuOpen}
                      onReply={setReplyingTo}
                      onEdit={(m) => { setEditingMessage(m); setNewMessage(m.content); }}
                      onCopy={handleCopyMessage}
                      onDelete={handleDeleteSingleMessage}
                      textareaRef={textareaRef}
                      swipeOffset={swipeOffset}
                      setSwipeOffset={setSwipeOffset}
                      onZoomMedia={setLightboxMedia}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 md:p-6 bg-background/50 backdrop-blur-3xl z-40 relative">
                {/* WhatsApp Style Full-screen Media Preview */}
                <AnimatePresence>
                  {pendingMedia && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="fixed inset-0 z-[500] bg-slate-950 flex flex-col"
                    >
                      {/* Close Header */}
                      <div className="p-4 flex items-center justify-between z-10">
                        <button 
                          onClick={() => { setPendingMedia(null); setPendingPreviewUrl(null); }}
                          className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
                        >
                          <ArrowLeft size={24} />
                        </button>
                        <div className="flex flex-col items-end">
                          <p className="text-white font-black text-xs uppercase tracking-widest">Preview</p>
                          <p className="text-white/40 text-[10px] uppercase font-bold">{(pendingMedia.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>

                      {/* Large Media Preview */}
                      <div className="flex-1 flex items-center justify-center p-4">
                        {pendingMedia.type.startsWith('image/') ? (
                          <motion.img 
                            layoutId="media-preview"
                            src={pendingPreviewUrl} 
                            className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl" 
                          />
                        ) : pendingMedia.type.startsWith('video/') ? (
                          <video 
                            src={pendingPreviewUrl} 
                            controls 
                            className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl bg-black" 
                          />
                        ) : (
                          <div className="p-12 bg-white/5 rounded-[3rem] border border-white/10 flex flex-col items-center gap-4">
                            <FileIcon size={60} className="text-primary" />
                            <p className="text-white font-black text-sm uppercase tracking-widest">{pendingMedia.name}</p>
                          </div>
                        )}
                      </div>

                      {/* Caption & Send Area (WhatsApp Style) */}
                      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="max-w-2xl mx-auto flex items-end gap-4">
                             <div className="flex-1 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] p-4 flex items-center gap-4 group focus-within:border-primary/50 transition-all">
                                <textarea 
                                  placeholder="Add a caption..." 
                                  value={newMessage}
                                  onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                                  }}
                                  className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium resize-none min-h-[24px] max-h-[120px]"
                                />
                             </div>
                             <button 
                               onClick={handleSendMessage}
                               disabled={isSending}
                               className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all shrink-0"
                             >
                               {isSending ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={24} className="ml-1" />}
                             </button>
                          </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  {replyingTo && (
                    <motion.div 
                      key="reply-bar"
                      initial={{ height: 0, opacity: 0, y: 10 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: 10 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="flex items-center justify-between px-6 py-3 bg-muted border-x border-t border-border rounded-t-[2rem] mb-[-1px] selection:bg-primary/20 overflow-hidden"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1 h-8 rounded-full bg-primary" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Replying to {replyingTo.sender?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground font-medium truncate italic">{replyingTo.type === 'IMAGE' ? '[Image]' : replyingTo.type === 'VIDEO' ? '[Video]' : replyingTo.type === 'VOICE' ? '[Voice Note]' : replyingTo.type === 'FILE' ? '[Document]' : replyingTo.content}</p>
                        </div>
                      </div>
                      <button onClick={() => setReplyingTo(null)} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all"><X size={16} /></button>
                    </motion.div>
                  )}
                  {editingMessage && (
                    <motion.div 
                      key="edit-bar"
                      initial={{ height: 0, opacity: 0, y: 10 }}
                      animate={{ height: 'auto', opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: 10 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="flex items-center justify-between px-6 py-2 bg-primary/5 rounded-t-2xl border-x border-t border-primary/10 mb-[-1px] overflow-hidden"
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <Pencil size={12} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Editing Message</span>
                      </div>
                      <button onClick={() => { setEditingMessage(null); setNewMessage(''); }} className="text-muted-foreground hover:text-rose-500"><X size={14} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 md:gap-4 p-2 bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] shadow-lg">
                  <div className="flex items-center gap-1 pl-1">
                    <input type="file" disabled={isSending} ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <button type="button" disabled={isSending} onClick={() => fileInputRef.current?.click()} className={`p-2 rounded-xl transition-all ${isSending ? 'opacity-50 cursor-not-allowed text-muted-foreground' : 'hover:bg-muted text-primary'}`}><Paperclip size={20} /></button>
                    <button type="button" disabled={isSending} onClick={() => { if(fileInputRef.current) { fileInputRef.current.accept = "image/*,video/*"; fileInputRef.current.click(); setTimeout(() => {if(fileInputRef.current) fileInputRef.current.accept = ""}, 1000)} }} className={`p-2 rounded-xl transition-all hidden md:block ${isSending ? 'opacity-50 cursor-not-allowed text-muted-foreground' : 'hover:bg-muted text-primary'}`}><ImageIcon size={20} /></button>
                  </div>
                  <div className="flex-1 relative">
                    {isRecording ? (
                      <div className="w-full flex items-center justify-between px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full">
                        <div className="flex items-center gap-3 text-rose-500 font-bold animate-pulse text-[10px] uppercase tracking-widest">
                          <div className="w-2 h-2 bg-rose-500 rounded-full" />
                          RECORDING: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                        </div>
                        <button type="button" onClick={cancelRecording} className="text-rose-500/60 hover:text-rose-500 transition-all font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5"><Trash2 className="w-3.5 h-3.5" />Cancel</button>
                      </div>
                    ) : (
                      <textarea 
                        ref={textareaRef} 
                        disabled={isSending}
                        placeholder="Say something..." 
                        value={newMessage} 
                        onChange={(e) => { 
                          setNewMessage(e.target.value); 
                          e.target.style.height = 'auto'; 
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                          
                          if (socket && selectedUser) {
                            socket.emit('typing', { to: selectedUser.id });
                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = setTimeout(() => {
                              socket.emit('stop_typing', { to: selectedUser.id });
                            }, 2000);
                          }
                        }} 
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} 
                        className={`w-full px-2 py-2 bg-transparent border-none focus:outline-none transition-all font-medium text-sm min-h-[38px] max-h-[120px] resize-none overflow-y-auto custom-scrollbar ${isSending ? 'opacity-50' : ''}`} 
                      />
                    )}
                  </div>
                  {isRecording ? (
                     <button type="button" onClick={stopRecording} className="p-3 bg-rose-500 text-white rounded-full shadow-lg hover:rotate-90 transition-all"><Square className="w-4 h-4" /></button>
                  ) : newMessage.trim() || selectedFile ? (
                     <button type="submit" disabled={isSending} className={`p-3 rounded-full shadow-xl transition-all pr-4 pl-4 ${isSending ? 'bg-primary/50 text-white' : 'bg-primary text-white hover:scale-105 active:scale-95'}`}>
                       {isSending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                     </button>
                  ) : (
                     <button type="button" disabled={isSending} onMouseDown={startRecording} className={`p-3 rounded-full shadow-lg transition-all pr-4 pl-4 ${isSending ? 'bg-primary/50 text-white' : 'bg-primary text-white hover:scale-110 active:scale-90'}`}><Mic className="w-5 h-5" /></button>
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
                          src={getMediaUrl(viewingProfile.avatar)} 
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
        {/* Lightbox / Zoomed Media */}
        <AnimatePresence>
          {lightboxMedia && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setLightboxMedia(null)} 
                className="absolute inset-0 bg-slate-950/98 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 20 }} 
                className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="absolute top-0 right-0 p-4 pointer-events-auto">
                   <button 
                    onClick={() => setLightboxMedia(null)} 
                    className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="w-full h-full flex items-center justify-center pointer-events-auto">
                  {lightboxMedia.type === 'IMAGE' ? (
                    <img 
                      src={getMediaUrl(lightboxMedia.fileUrl)} 
                      className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" 
                    />
                  ) : lightboxMedia.type === 'VIDEO' ? (
                    <video 
                      controls 
                      autoPlay 
                      className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl bg-black"
                    >
                      <source src={getMediaUrl(lightboxMedia.fileUrl)} />
                    </video>
                  ) : null}
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 text-center max-w-sm pointer-events-auto"
                >
                   <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-1">Sent by {lightboxMedia.senderId === user?.id ? 'You' : 'Friend'}</p>
                   <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">
                     {new Date(lightboxMedia.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                   </p>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
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
