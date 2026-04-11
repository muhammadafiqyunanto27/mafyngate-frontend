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
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

function MessagesContent() {
  const { user, fetchUser } = useAuth();
  const { socket, startCall, isCalling: isInitiatingCall, clearNotificationsFromSender, setUnreadChatsCount, setActiveChatId } = useSocket();
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
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchConnections = async () => {
    try {
      // isHiddenMode flag in API is not needed if we handle it correctly here
      const res = await api.get('/user/connections');
      setUsers(res.data.data);
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
        
        // Remove from current position and move to top
        updatedUsers.splice(userIndex, 1);
        return [targetUser, ...updatedUsers];
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
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedUser || !socket) return;
    
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
        fileName: fileData?.name,
        fileSize: fileData?.size,
        parentId: replyingTo?.id
      });
      setReplyingTo(null);
    }
    
    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = '56px';
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
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-background shadow-sm shrink-0" onClick={(e) => { e.stopPropagation(); setViewingProfile(u); }}>
                    {u.avatar ? <img src={getAvatar(u.avatar)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold bg-primary/10 text-primary">{(u.name || u.email).charAt(0).toUpperCase()}</div>}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-center mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-bold truncate text-sm">{u.name || u.email.split('@')[0]}</p>
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
              <div className="p-4 md:p-6 border-b border-border flex items-center justify-between bg-background/50 backdrop-blur-md z-30">
                <div className="flex items-center gap-4 min-w-0">
                  {isMobileView && <button onClick={() => setShowChat(false)} className="p-2 mr-1"><ArrowLeft className="w-5 h-5" /></button>}
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden border-2 border-background shadow-sm cursor-pointer" onClick={() => setViewingProfile(selectedUser)}>
                    {selectedUser.avatar ? <img src={getAvatar(selectedUser.avatar)} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold">{(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}</div>}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-foreground uppercase tracking-tight text-sm md:text-base truncate cursor-pointer flex items-center gap-2" onClick={() => setViewingProfile(selectedUser)}>
                      {selectedUser.name || selectedUser.email.split('@')[0]}
                      {selectedUser.isPinned && <Pin size={12} className="text-amber-500 fill-amber-500/20" />}
                    </h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors duration-300 ${recipientStatus === 'typing' ? 'text-primary' : recipientStatus === 'online' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                      <span className={`w-1 h-1 rounded-full animate-pulse ${recipientStatus === 'offline' ? 'bg-muted-foreground' : 'bg-current'}`} /> 
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

              <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 custom-scrollbar bg-card/10">
                {messages
                  .filter(m => !innerSearchQuery || (m.content && m.content.toLowerCase().includes(innerSearchQuery.toLowerCase())))
                  .map((msg, i) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id || i} className={`flex group ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-center gap-2 max-w-[85%] md:max-w-[70%] ${isMine ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`opacity-0 group-hover:opacity-100 flex ${isMine ? 'flex-col' : 'flex-col'} gap-1 transition-opacity self-center ${isMine ? 'pr-1' : 'pl-1'}`}>
                          {isMine && (
                            <>
                              <button onClick={() => { setEditingMessage(msg); setNewMessage(msg.content); textareaRef.current?.focus(); }} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-all" title="Edit"><Pencil size={12} /></button>
                              <button onClick={() => handleDeleteSingleMessage(msg.id)} className="p-1.5 hover:bg-rose-500/10 rounded-lg text-muted-foreground hover:text-rose-500 transition-all" title="Delete"><Trash2 size={12} /></button>
                            </>
                          )}
                          <button onClick={() => { setReplyingTo(msg); textareaRef.current?.focus(); }} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-all" title="Reply"><Reply size={12} /></button>
                          <button onClick={() => handleCopyMessage(msg.content)} className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-all" title="Copy"><Copy size={12} /></button>
                        </div>
                        <div className={`px-5 py-3.5 rounded-3xl shadow-sm text-sm font-medium break-words whitespace-pre-wrap ${isMine ? 'bg-primary text-white rounded-br-none shadow-primary/20' : 'bg-muted/50 text-foreground rounded-bl-none border border-border'}`}>
                          {msg.parent && (
                            <div className={`mb-3 p-3 rounded-2xl border-l-4 text-[11px] leading-relaxed max-w-full ${isMine ? 'bg-white/10 border-white/30 text-white/80' : 'bg-muted border-primary/30 text-muted-foreground'}`}>
                               <p className="font-black uppercase tracking-widest text-[9px] mb-1 text-primary">Replying to {msg.parent.sender?.name || 'User'}</p>
                               <p className="truncate line-clamp-2">{msg.parent.type === 'IMAGE' ? '📷 Image' : msg.parent.type === 'VIDEO' ? '🎥 Video' : msg.parent.type === 'FILE' ? '📁 File' : msg.parent.content}</p>
                            </div>
                          )}
                          {msg.type === 'IMAGE' && (
                            <div className="mb-2 relative group-img cursor-pointer overflow-hidden rounded-2xl border border-white/10" onClick={() => window.open(msg.fileUrl.startsWith('http') ? msg.fileUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${msg.fileUrl}`)}>
                              <img src={msg.fileUrl.startsWith('http') ? msg.fileUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${msg.fileUrl}`} className="max-w-full h-auto rounded-xl hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          {msg.type === 'VIDEO' && (
                            <video controls className="max-w-full rounded-xl mb-2">
                               <source src={msg.fileUrl.startsWith('http') ? msg.fileUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${msg.fileUrl}`} type="video/mp4" />
                            </video>
                          )}
                          {msg.type === 'FILE' && (
                            <div className={`flex items-center gap-3 p-3 rounded-2xl mb-2 border ${isMine ? 'bg-white/10 border-white/20' : 'bg-muted border-border'}`}>
                               <FileIcon className="w-6 h-6 text-primary" />
                               <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold truncate">{msg.fileName || 'Document'}</p>
                                  <p className="text-[10px] opacity-60">{(msg.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                               </div>
                               <a href={msg.fileUrl.startsWith('http') ? msg.fileUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${msg.fileUrl}`} download className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                  <Download className="w-4 h-4" />
                               </a>
                            </div>
                          )}
                          {msg.content && msg.content !== msg.fileName && <p>{msg.content}</p>}
                          {msg.isEdited && <span className="text-[8px] italic opacity-50 ml-2">(edited)</span>}
                          <div className={`text-[9px] font-black uppercase mt-1.5 flex items-center gap-1 justify-end opacity-50 ${isMine ? 'text-white' : 'text-muted-foreground'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMine && <CheckCheck className={`w-3 h-3 ${msg.isRead ? 'text-blue-300' : ''}`} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 md:px-10 md:pb-8">
                {replyingTo && (
                  <div className="flex items-center justify-between px-6 py-3 bg-muted border-x border-t border-border rounded-t-[2rem] mb-[-1px] animate-in fade-in slide-in-from-bottom-2 selection:bg-primary/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-1 h-8 rounded-full bg-primary" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Replying to {replyingTo.sender?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground font-medium truncate italic">{replyingTo.type === 'IMAGE' ? '[Image]' : replyingTo.type === 'VIDEO' ? '[Video]' : replyingTo.type === 'FILE' ? '[File]' : replyingTo.content}</p>
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
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all"><Paperclip size={20} /></button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all hidden md:block"><ImageIcon size={20} /></button>
                  </div>
                  <div className="flex-1 relative">
                    <textarea 
                      ref={textareaRef} 
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
                      className="w-full px-6 py-4 bg-muted border border-border rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm min-h-[58px] max-h-[120px] resize-none overflow-y-auto custom-scrollbar" 
                    />
                  </div>
                  <button type="submit" className="p-4 bg-primary text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"><Send className="w-5 h-5" /></button>
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
                 <div className="relative inline-block"><div className="w-20 h-20 rounded-[1.5rem] border-4 border-background overflow-hidden bg-muted shadow-lg">{viewingProfile.avatar ? <img src={getAvatar(viewingProfile.avatar)} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-primary text-white">{(viewingProfile.name || viewingProfile.email).charAt(0).toUpperCase()}</div>}</div><div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background shadow-sm"></div></div>
                 <h2 className="text-lg font-black mt-2 uppercase tracking-tight truncate px-2">{viewingProfile.name || 'Anonymous'}</h2><p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 mb-6 truncate px-4">{viewingProfile.email}</p>
                 <div className="grid grid-cols-2 gap-2 mb-6"><div className="p-2 bg-muted/50 rounded-2xl border border-border"><p className="text-[8px] font-black uppercase text-muted-foreground mb-0.5">Status</p><p className="text-[9px] font-bold text-emerald-500 uppercase">Available</p></div><div className="p-2 bg-muted/50 rounded-2xl border border-border"><p className="text-[8px] font-black uppercase text-muted-foreground mb-0.5">Mutuals</p><p className="text-[9px] font-bold uppercase truncate">Connected</p></div></div>
                 <div className="space-y-2 text-left"><div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50"><Mail className="w-4 h-4 text-primary shrink-0" /><div className="min-w-0"><p className="text-[7px] font-black uppercase text-muted-foreground">Email</p><p className="text-[10px] font-bold truncate">{viewingProfile.email}</p></div></div></div>
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
