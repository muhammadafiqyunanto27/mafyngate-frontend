'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/url';
import { 
  Users, 
  Activity, 
  Zap, 
  TrendingUp, 
  ArrowUpRight,
  Plus,
  MessageSquare,
  CheckSquare,
  Bell,
  Send,
  UserPlus
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import TodoList from '../../components/TodoList';
import { motion } from 'framer-motion';

import { useSocket } from '../../context/SocketContext';


export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState({
    connections: 0,
    unreadConversations: [],
    unreadMessages: 0,
    tasksCount: 0,
    notifications: 0,
    activities: [],
    pendingRequests: []
  });

  const fetchStats = useCallback(async () => {
    try {
      const [connRes, todoRes, unreadRes, activityRes, notifRes, unreadConvRes, pendingRes] = await Promise.all([
        api.get('/user/connections'),
        api.get('/todo'),
        api.get('/user/chat/unread-count'),
        api.get('/user/activities'),
        api.get('/user/notifications/unread-count'),
        api.get('/user/chat/unread-conversations'),
        api.get('/user/requests/pending')
      ]);
      
      setDashboardStats({
        connections: connRes.data.data.length,
        unreadConversations: unreadConvRes.data.data,
        unreadMessages: unreadRes.data.count,
        tasksCount: todoRes.data.data.filter(t => !t.completed).length,
        notifications: notifRes.data.count,
        activities: (activityRes.data.data || []).slice(0, 5),
        pendingRequests: pendingRes.data.data || []
      });
    } catch (err) {
      console.error('Stats fetch failed', err);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleUpdate = () => fetchStats();

    socket.on('connection_update', handleUpdate);
    socket.on('new_notification', handleUpdate);
    socket.on('new_message', handleUpdate);
    socket.on('todo_updated', handleUpdate);
    socket.on('activity_logged', handleUpdate);

    return () => {
      socket.off('connection_update', handleUpdate);
      socket.off('new_notification', handleUpdate);
      socket.off('new_message', handleUpdate);
      socket.off('todo_updated', handleUpdate);
      socket.off('activity_logged', handleUpdate);
    };
  }, [socket, user, fetchStats]);

  if (loading || !user) return null;

  const displayStats = [
    { label: 'Unread Chats', value: dashboardStats.unreadMessages, change: 'Real-time', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Connections', value: dashboardStats.connections, change: 'Synced', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Active Tasks', value: dashboardStats.tasksCount, change: 'Sprint', icon: CheckSquare, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Pending Requests', value: dashboardStats.pendingRequests.length, change: 'Alert', icon: UserPlus, color: 'text-indigo-500 bg-indigo-500/10' },
  ];

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6 md:space-y-10 pb-10">
        
        {/* Top Hero Banner */}
        <section className="relative group">
           <div className="p-6 md:p-10 rounded-none md:rounded-[3.5rem] bg-gradient-to-br from-indigo-700 via-primary-600 to-primary-800 text-white shadow-2xl overflow-hidden relative border-y md:border border-white/10">
              <div className="absolute top-0 right-0 w-[40%] h-full bg-white/5 skew-x-[-20deg] translate-x-[20%] transition-transform group-hover:translate-x-[15%] duration-700"></div>
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center px-4 md:px-0">
                 <div className="space-y-4 md:space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] md:text-xs font-bold backdrop-blur-md border border-white/10 uppercase tracking-widest">
                       <Zap className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" />
                       <span>Your Private Gateway is Active</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1]">
                       Welcome back, <span className="text-indigo-200">{user.name || user.email.split('@')[0]}</span>
                    </h2>
                    <p className="text-white/70 max-w-lg text-base md:text-lg font-medium leading-relaxed">
                       You have <span className="text-white font-bold">{dashboardStats.unreadMessages} messages</span> and <span className="text-white font-bold">{dashboardStats.tasksCount} tasks</span> waiting.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3 md:gap-4 justify-center md:justify-start">
                       <button 
                         onClick={() => router.push('/messages')}
                         className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-indigo-700 font-black text-sm shadow-xl hover:shadow-indigo-500/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          Start Messaging <Send className="w-4 h-4" />
                       </button>
                    </div>
                 </div>
                 <div className="hidden lg:flex justify-center">
                    <div className="relative">
                       <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
                       <MessageSquare className="w-40 h-40 text-white relative z-10 drop-shadow-2xl" />
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Stats Grid - Fixed Paddings for Desktop/Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 px-3 md:px-0">
          {displayStats.map((stat, idx) => (
             <motion.div 
               key={idx}
               whileHover={{ y: -8, scale: 1.02 }}
               className="p-4 md:p-8 rounded-[1.5rem] md:rounded-[40px] bg-card border border-border flex flex-col justify-between group transition-all duration-500 hover:border-primary/50 relative overflow-hidden shadow-sm"
             >
               <div className="flex items-start justify-between mb-1 md:mb-8">
                  <div className={`p-2.5 md:p-4 rounded-xl md:rounded-2xl ${stat.color} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500 max-[450px]:hidden`}>
                     <stat.icon className="w-4 md:w-6 h-4 md:h-6" />
                  </div>
                  <span className={`text-[8px] md:text-[10px] font-black px-2 md:px-2.5 py-0.5 md:py-1 rounded-full ${stat.change.includes('+') || stat.change === 'New' || stat.change === 'Real-time' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
                    {stat.change}
                  </span>
               </div>
               <div>
                  <p className="text-[8px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 md:mb-1 truncate">{stat.label}</p>
                  <p className="text-xl md:text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
               </div>
             </motion.div>
          ))}
        </div>


        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch px-0 md:px-0">
          
          {/* Left Side: Tasks */}
          <div className="lg:col-span-2 flex flex-col">
             <div className="flex-1 bg-card border-y md:border border-border rounded-none md:rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                <TodoList />
             </div>
             
             {/* Pending Requests Section */}
             {dashboardStats.pendingRequests && dashboardStats.pendingRequests.length > 0 && (
                <div className="mt-8 bg-card border border-border rounded-[3rem] p-8 shadow-sm">
                   <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black text-foreground text-lg uppercase tracking-tight flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                         Connection Requests
                      </h3>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black">{dashboardStats.pendingRequests.length} NEW</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dashboardStats.pendingRequests.map((req) => (
                        <div key={req.id} className="p-4 rounded-[2rem] bg-muted/30 border border-border flex items-center justify-between gap-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary overflow-hidden">
                                {req.follower.avatar ? (
                                  <img 
                                    src={getMediaUrl(req.follower.avatar)} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                  />
                                ) : null}
                                <div className={`w-full h-full items-center justify-center ${req.follower.avatar ? 'hidden' : 'flex'}`}>
                                  {(req.follower.name || "?").charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                 <p className="text-sm font-bold truncate text-foreground">{req.follower.name}</p>
                                 <p className="text-[10px] text-muted-foreground font-medium truncate italic opacity-60">Wants to connect</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <button 
                                onClick={async () => {
                                  await api.post(`/user/requests/accept/${req.followerId}`);
                                  fetchStats();
                                }}
                                className="p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-105 transition-all"
                              >
                                <CheckSquare size={16} />
                              </button>
                              <button 
                                onClick={async () => {
                                  await api.post(`/user/requests/decline/${req.followerId}`);
                                  fetchStats();
                                }}
                                className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all"
                              >
                                <Plus size={16} className="rotate-45" />
                              </button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>

          {/* Right Side: Connections & Logs */}
          <div className="flex flex-col gap-6 md:gap-8 px-3 md:px-0">
             <div className="flex-1 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-card border border-border space-y-6 md:space-y-8 group transition-all duration-500 hover:border-primary/20 shadow-sm hover:shadow-xl flex flex-col min-h-[320px]">
                <div className="flex items-center justify-between">
                   <h3 className="font-black text-foreground text-sm md:text-lg uppercase tracking-tight flex items-center gap-2">
                      <MessageSquare className="w-4 md:w-5 h-4 md:h-5 text-emerald-500" />
                      Quick Inbox
                   </h3>
                </div>
                
                <div className="flex-1 space-y-3">
                  {dashboardStats.unreadConversations.length > 0 ? (
                    dashboardStats.unreadConversations.slice(0, 3).map((conn, i) => (
                      <div key={i} className="flex items-center justify-between group/user p-3 rounded-2xl hover:bg-muted transition-all cursor-pointer border border-transparent hover:border-emerald-500/20" onClick={() => router.push(`/messages?userId=${conn.id}`)}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-500 border border-emerald-500/20 overflow-hidden">
                              {conn.avatar ? (
                                <img 
                                  src={getMediaUrl(conn.avatar)} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                              ) : null}
                              <div className={`w-full h-full items-center justify-center ${conn.avatar ? 'hidden' : 'flex'}`}>
                                {(conn.name || "?").charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card"></div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground truncate">{conn.name}</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase opacity-60 italic">Wait Message</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                      <Zap className="w-7 h-7 text-muted-foreground" />
                      <p className="text-xs font-black text-foreground uppercase tracking-widest">Inbox Cleared</p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => router.push('/messages')}
                  className="w-full py-4 rounded-2xl bg-muted/50 hover:bg-primary hover:text-white text-[10px] font-black uppercase transition-all active:scale-95 tracking-widest border border-border hover:border-primary shadow-sm"
                >
                  All Messages
                </button>
             </div>

             <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10 flex flex-col space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-primary">
                         <Activity className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <h4 className="text-lg font-black tracking-tight uppercase">Signals</h4>
                   </div>
                   
                   <div className="space-y-4">
                      {dashboardStats.activities.length > 0 ? dashboardStats.activities.map((item, i) => (
                        <div key={i} className="flex gap-4 group/item">
                          <div className="flex flex-col items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {i < dashboardStats.activities.length - 1 && <div className="flex-1 w-px bg-white/10 my-1" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white/90 truncate">{item.message}</p>
                            <p className="text-[9px] text-white/40 uppercase font-black">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Active</p>
                          </div>
                        </div>
                      )) : (
                        <p className="text-[10px] font-bold text-white/30 uppercase text-center py-4">No Signals</p>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
