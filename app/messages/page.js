'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import DashboardLayout from '../../components/DashboardLayout';
import { useSearchParams } from 'next/navigation';
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
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChat, setShowChat] = useState(false); // For mobile responsiveness
  const messagesEndRef = useRef(null);

  // Handle auto-select user from URL search params
  useEffect(() => {
    const userIdToSelect = searchParams.get('userId');
    if (userIdToSelect && users.length > 0) {
      const foundUser = users.find(u => u.id === userIdToSelect);
      if (foundUser) {
        setSelectedUser(foundUser);
        if (isMobileView) setShowChat(true);
      }
    }
  }, [searchParams, users, isMobileView]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const res = await api.get('/user/connections');
        setUsers(res.data.data);
      } catch (err) {
        console.error('Failed to fetch connections:', err);
      }
    };
    fetchConnections();

    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.on('receive_message', (message) => {
        if (selectedUser && (message.senderId === selectedUser.id || message.senderId === user.id)) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socket.on('message_sent', (message) => {
        setMessages((prev) => [...prev, message]);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !socket) return;

    socket.emit('send_message', {
      content: newMessage,
      receiverId: selectedUser.id,
      conversationId: 'temp_id', // Would be real in full implementation
    });

    setNewMessage('');
  };

  const filteredUsers = users.filter(u => 
    (u.name || u.email).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith('http') ? avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${avatar}`;
  };

  return (
    <DashboardLayout pageTitle="Messages">
      <div className="h-[calc(100vh-12rem)] bg-card border border-border rounded-[2.5rem] shadow-2xl flex overflow-hidden">
        
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
                      <span className={`text-[10px] font-medium opacity-60 ${selectedUser?.id === u.id ? 'text-white' : 'text-muted-foreground'}`}>12:45</span>
                    </div>
                    <p className={`text-xs truncate font-medium opacity-70 ${selectedUser?.id === u.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                      Click to start conversation...
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${isMobileView && !showChat ? 'hidden' : 'flex'} flex-1 flex-col bg-card relative`}>
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
                  <button className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
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
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={msg.id || i}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] md:max-w-[70%] space-y-1 ${isMine ? 'items-end' : 'items-start'}`}>
                          <div className={`px-5 py-3 rounded-[1.25rem] shadow-sm relative group transition-all ${
                            isMine 
                            ? 'bg-primary text-white rounded-br-none shadow-primary/20' 
                            : 'bg-muted/80 text-foreground rounded-bl-none border border-border'
                          }`}>
                            <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 justify-end opacity-60 ${isMine ? 'text-white' : 'text-muted-foreground'}`}>
                               <span className="text-[10px] font-bold uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               {isMine && <CheckCheck className="w-3 h-3" />}
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
              <div className="p-6 border-t border-border bg-card">
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
                    <input 
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      autoComplete="off"
                      suppressHydrationWarning
                      className="w-full px-6 py-4 bg-muted border border-border rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-sm pr-12"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-4 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary-600 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
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
