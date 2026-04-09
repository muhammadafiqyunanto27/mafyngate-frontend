'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Smile, 
  Paperclip, 
  User, 
  MessageSquare,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  Trash2,
  X,
  Copy,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, startCall } = useSocket();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false); // For mobile responsiveness
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);


  // Listen for real-time message deletions and edits
  useEffect(() => {
    if (socket) {
      socket.on('messages_deleted', (data) => {
        const { messageIds } = data;
        setMessages(prev => prev.filter(m => !messageIds.includes(m.id)));
        setSelectedMessages(prev => prev.filter(id => !messageIds.includes(id)));
      });
      
      socket.on('message_updated', (updatedMsg) => {
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
      });

      return () => {
        socket.off('messages_deleted');
        socket.off('message_updated');
      };
    }
  }, [socket]);

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    // Could add a toast here
  };

  const handleStartEdit = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.content);
    textareaRef.current?.focus();
    // Trigger height recalculation
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }, 0);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
    if (textareaRef.current) textareaRef.current.style.height = '56px';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    if (editingMessage) {
      try {
        const res = await api.patch('/user/chat/message', { 
          messageId: editingMessage.id, 
          content: newMessage 
        });
        const updated = res.data.data;
        
        // Update local state
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
        
        // Broadcast
        socket.emit('edit_message', { 
          message: updated, 
          receiverId: selectedUser.id,
          conversationId: updated.conversationId 
        });

        setEditingMessage(null);
        setNewMessage('');
      } catch (err) {
        console.error('Edit failed:', err);
      }
    } else {
      socket.emit('send_message', {
        content: newMessage,
        receiverId: selectedUser.id,
        conversationId: 'temp_id', // Would be real in full implementation
      });
      setNewMessage('');
    }

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '56px';
    }
  };

  const toggleMessageSelection = (id) => {
    if (selectedMessages.includes(id)) {
      setSelectedMessages(prev => prev.filter(mId => mId !== id));
    } else {
      setSelectedMessages(prev => [...prev, id]);
    }
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    try {
      await api.delete('/user/chat/messages', { data: { messageIds: selectedMessages } });
      
      // Update local state
      setMessages(prev => prev.filter(m => !selectedMessages.includes(m.id)));
      
      if (socket && selectedUser) {
        // We calculate conversationId or just use the current room
        const convoId = messages.find(m => m.id === selectedMessages[0])?.conversationId;
        socket.emit('delete_messages', { 
          messageIds: selectedMessages, 
          conversationId: convoId,
          receiverId: selectedUser.id
        });
      }
      
      setSelectedMessages([]);
      setSelectionMode(false);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };



  // Fetch connections and handle initial setup
  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await api.get('/user/connections');
        const connUsers = res.data.data;
        setUsers(connUsers);
        
        // Handle auto-select user from URL using Native API (fix build issue)
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          const userIdToSelect = searchParams.get('userId');
          if (userIdToSelect) {
            const foundUser = connUsers.find(u => u.id === userIdToSelect);
            if (foundUser) {
              setSelectedUser(foundUser);
              if (isMobileView) setShowChat(true);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch connections:', err);
      }
    };
    fetchConnections();

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileView]);

  useEffect(() => {
    if (socket && user) {
      socket.on('receive_message', (message) => {
        if (selectedUser && (message.senderId === selectedUser.id || message.senderId === user.id)) {
          setMessages((prev) => {
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
      });

      socket.on('message_sent', (message) => {
        setMessages((prev) => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
      });

      return () => {
        socket.off('receive_message');
        socket.off('message_sent');
      };
    }
  }, [socket, selectedUser, user?.id]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const res = await api.get(`/user/chat/messages/${selectedUser.id}`);
        setMessages(res.data.data);
        
        // Mark as read (Database)
        await api.patch(`/user/chat/read/${selectedUser.id}`);
        
        // Update Navbar badge (Socket)
        if (socket) {
          socket.emit('mark_read', { senderId: selectedUser.id });
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    isInitialLoad.current = true;
  }, [selectedUser]);

  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      if (isInitialLoad.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        isInitialLoad.current = false;
      } else {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);



  const filteredUsers = users.filter(u => 
    (u.name || u.email).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith('http') ? avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${avatar}`;
  };

  return (
    <DashboardLayout pageTitle="Messages" fullWidth>
      <div className="h-[calc(100vh-4rem)] bg-card flex overflow-hidden">
        
        {/* User List Sidebar */}
        <div className={`${isMobileView && showChat ? 'hidden' : 'flex'} w-full md:w-80 lg:w-96 border-r border-border flex-col bg-muted/10`}>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Chats</h2>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <input 
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                suppressHydrationWarning
                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1 custom-scrollbar">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 px-6">
                 <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 opacity-50">
                    <User className="w-8 h-8 text-muted-foreground" />
                 </div>
                 <p className="text-sm font-bold text-muted-foreground">No users found</p>
              </div>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setMessages([]); // Real implementation would fetch history
                    if (isMobileView) setShowChat(true);
                  }}
                  className={`w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all group ${selectedUser?.id === u.id ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]' : 'hover:bg-muted'}`}
                >
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 flex-shrink-0 ${selectedUser?.id === u.id ? 'border-primary-foreground/30' : 'border-background shadow-sm'}`}>
                      {u.avatar ? (
                        <img src={getAvatarUrl(u.avatar)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center font-bold text-lg ${selectedUser?.id === u.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${selectedUser?.id === u.id ? 'bg-emerald-400 border-primary' : 'bg-emerald-500 border-background'}`}></div>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className={`font-bold truncate text-sm ${selectedUser?.id === u.id ? 'text-white' : 'text-foreground'}`}>
                        {u.name || u.email.split('@')[0]}
                      </p>
                      {u.lastMessage && (
                        <span className={`text-[10px] font-medium opacity-60 flex-shrink-0 ${selectedUser?.id === u.id ? 'text-white' : 'text-muted-foreground'}`}>
                          {new Date(u.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate font-medium opacity-70 ${selectedUser?.id === u.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                      {u.lastMessage ? u.lastMessage.content : 'Click to start conversation...'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${isMobileView && !showChat ? 'hidden' : 'flex'} flex-1 flex-col bg-card relative min-w-0 overflow-hidden`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-border flex items-center justify-between bg-muted/5 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4 min-w-0">
                  {isMobileView && (
                    <button onClick={() => setShowChat(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all">
                       <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <div className="relative">
                    <div className="w-10 md:w-12 h-10 md:h-12 rounded-2xl overflow-hidden border-2 border-background shadow-sm">
                      {selectedUser.avatar ? (
                        <img src={getAvatarUrl(selectedUser.avatar)} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold bg-primary/10 text-primary">
                          {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background"></div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-foreground truncate uppercase tracking-tight text-sm md:text-base">
                      {selectedUser.name || selectedUser.email.split('@')[0]}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-[10px] md:text-xs text-emerald-500 font-bold uppercase tracking-widest">Online Now</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {selectionMode ? (
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-lg">
                         {selectedMessages.length} Selected
                       </span>
                       <button 
                         onClick={handleDeleteMessages}
                         disabled={selectedMessages.length === 0}
                         className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all disabled:opacity-50"
                         title="Delete Selected"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => { setSelectionMode(false); setSelectedMessages([]); }}
                         className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all"
                       >
                         <X className="w-4 h-4" />
                       </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => startCall(selectedUser.id, 'voice')}
                        className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all group"
                        title="Voice Call"
                      >
                        <Phone className="w-4 h-4 group-hover:text-primary transition-colors" />
                      </button>
                      <button 
                        onClick={() => startCall(selectedUser.id, 'video')}
                        className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all group"
                        title="Video Call"
                      >
                        <Video className="w-4 h-4 group-hover:text-primary transition-colors" />
                      </button>
                      <button 
                        onClick={() => setSelectionMode(true)}
                        className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all group"
                        title="Manage Messages"
                      >
                        <MessageSquare className="w-4 h-4 group-hover:text-primary transition-colors" />
                      </button>
                      <button className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <div className="p-4 rounded-full bg-muted">
                        <MessageSquare className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest">End-to-End Encrypted</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMine = msg.senderId === user?.id;
                    const isSelected = selectedMessages.includes(msg.id);
                    
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={msg.id || i}
                        className={`flex group/msg relative mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[92%] md:max-w-[80%] min-w-0 flex gap-3 ${isMine ? 'flex-row-reverse items-end' : 'items-start'}`}>
                          
                          {/* Selection Checkbox */}
                          {selectionMode && isMine && (
                            <button 
                              onClick={() => toggleMessageSelection(msg.id)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mb-3 ${
                                isSelected ? 'bg-primary border-primary text-white scale-110 shadow-lg' : 'border-muted-foreground/30 hover:border-primary'
                              }`}
                            >
                               {isSelected && <Check className="w-3 h-3 stroke-[4px]" />}
                            </button>
                          )}

                          <div className="relative group">
                            {/* Message Toolbar */}
                            {!selectionMode && (
                              <div className={`absolute -top-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20 ${isMine ? 'right-0' : 'left-0'}`}>
                                <button 
                                  onClick={() => handleCopyMessage(msg.content)}
                                  className="p-2 rounded-lg bg-card border border-border shadow-md hover:bg-muted text-muted-foreground transition-all"
                                  title="Copy"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {isMine && (
                                  <button 
                                    onClick={() => handleStartEdit(msg)}
                                    className="p-2 rounded-lg bg-card border border-border shadow-md hover:bg-muted text-muted-foreground transition-all"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}

                            <div 
                              onClick={() => selectionMode && isMine && toggleMessageSelection(msg.id)}
                              className={`px-5 py-3 rounded-[1.25rem] shadow-sm relative transition-all cursor-default ${
                                selectionMode && isMine ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' : ''
                              } ${
                                isMine 
                                ? `bg-primary text-white rounded-br-none shadow-primary/20 ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}` 
                                : 'bg-muted/80 text-foreground rounded-bl-none border border-border'
                              }`}
                            >
                              <p className="text-sm font-medium leading-relaxed break-all whitespace-pre-wrap">{msg.content}</p>
                              <div className={`flex items-center gap-1.5 mt-1 justify-end opacity-60 ${isMine ? 'text-white' : 'text-muted-foreground'}`}>
                                 {msg.isEdited && <span className="text-[9px] font-bold uppercase italic">Edited</span>}
                                 <span className="text-[10px] font-bold uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                 {isMine && <CheckCheck className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 md:pt-6 md:pb-8 md:px-10 border-t border-border bg-card">
                <AnimatePresence>
                  {editingMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mb-4 p-3 bg-primary/10 rounded-2xl flex items-center justify-between border border-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/20 text-primary">
                          <Edit2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-primary tracking-widest">Editing Message</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px] font-medium">{editingMessage.content}</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCancelEdit}
                        className="p-2 rounded-xl hover:bg-primary/20 text-primary transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSendMessage} className="flex items-center gap-3 md:gap-4">
                  <div className="flex gap-1 md:gap-2">
                    <button type="button" className="p-3 rounded-2xl hover:bg-muted text-muted-foreground transition-all">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button type="button" className="hidden sm:flex p-3 rounded-2xl hover:bg-muted text-muted-foreground transition-all">
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <textarea 
                      ref={textareaRef}
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      rows={1}
                      autoComplete="off"
                      suppressHydrationWarning
                      className="w-full px-6 py-4 bg-muted border border-border rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-sm pr-12 resize-none overflow-y-auto custom-scrollbar leading-tight min-h-[56px] max-h-[120px]"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`p-4 rounded-2xl text-white shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center ${editingMessage ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-primary shadow-primary/30'}`}
                  >
                    {editingMessage ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-primary/20 to-indigo-500/20 flex items-center justify-center mb-8 animate-pulse">
                <MessageSquare className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-black text-foreground uppercase tracking-tight mb-3">Your Messages</h2>
              <p className="text-muted-foreground max-w-sm text-sm font-medium leading-relaxed">
                Pilih pengguna dari daftar di sebelah kiri untuk mulai mengobrol secara real-time.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
