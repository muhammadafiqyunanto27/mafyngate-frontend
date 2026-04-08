'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
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
  Send
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
    activities: []
  });

  const fetchStats = async () => {
    try {
      const [connRes, todoRes, unreadRes, activityRes, notifRes, unreadConvRes] = await Promise.all([
        api.get('/user/connections'),
        api.get('/todo'),
        api.get('/user/chat/unread-count'),
        api.get('/user/activities'),
        api.get('/user/notifications/unread-count'),
        api.get('/user/chat/unread-conversations')
      ]);
      
      setDashboardStats({
        connections: connRes.data.data.length,
        unreadConversations: unreadConvRes.data.data,
        unreadMessages: unreadRes.data.count,
        tasksCount: todoRes.data.data.filter(t => !t.completed).length,
        notifications: notifRes.data.count,
        activities: (activityRes.data.data || []).slice(0, 5)
      });
    } catch (err) {
      console.error('Stats fetch failed', err);
    }
  };

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    
    if (user) {
      fetchStats();

      if (socket) {
        socket.on('receive_message', fetchStats);
        socket.on('new_notification', fetchStats);
        socket.on('todo_updated', fetchStats);
        socket.on('activity_logged', fetchStats);
        socket.on('mark_read', fetchStats);

        return () => {
          socket.off('receive_message');
          socket.off('new_notification');
          socket.off('todo_updated');
          socket.off('activity_logged');
          socket.off('mark_read');
        };
      }
    }
  }, [user, loading, router, socket]);

  if (loading || !user) return null;

  const displayStats = [
    { label: 'Unread Chats', value: dashboardStats.unreadMessages, change: 'Real-time', icon: MessageSquare, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Connections', value: dashboardStats.connections, change: 'Synced', icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Active Tasks', value: dashboardStats.tasksCount, change: 'Sprint', icon: CheckSquare, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Notifications', value: dashboardStats.notifications, change: 'Alert', icon: Bell, color: 'text-indigo-500 bg-indigo-500/10' },
  ];

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-10 pb-10">
        
        {/* Top Hero Banner */}
        <section className="relative group">
           <div className="p-6 md:p-10 rounded-3xl md:rounded-[3rem] bg-gradient-to-br from-indigo-700 via-primary-600 to-primary-800 text-white shadow-2xl overflow-hidden relative border border-white/10">
              <div className="absolute top-0 right-0 w-[40%] h-full bg-white/5 skew-x-[-20deg] translate-x-[20%] transition-transform group-hover:translate-x-[15%] duration-700"></div>
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                 <div className="space-y-4 md:space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] md:text-xs font-bold backdrop-blur-md border border-white/10 uppercase tracking-widest">
                       <Zap className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" />
                       <span>Your Private Gateway is Active</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.1]">
                       Welcome back, <span className="text-indigo-200">{user.name || user.email.split('@')[0]}</span>
                    </h2>
                    <p className="text-white/70 max-w-lg text-base md:text-lg font-medium leading-relaxed">
                       You have <span className="text-white font-bold">{dashboardStats.unreadMessages} unread messages</span> and <span className="text-white font-bold">{dashboardStats.tasksCount} tasks</span> waiting for you today.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3 md:gap-4">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {displayStats.map((stat, idx) => (
             <motion.div 
               key={idx}
               whileHover={{ y: -8, scale: 1.02 }}
               className="p-6 md:p-8 rounded-3xl md:rounded-[40px] bg-card border border-border flex flex-col justify-between group transition-all duration-500 hover:border-primary/50"
             >
               <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${stat.color} shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500`}>
                     <stat.icon className="w-5 md:w-6 h-5 md:h-6" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] md:text-[10px] font-black px-2 md:px-2.5 py-0.5 md:py-1 rounded-full ${stat.change.includes('+') || stat.change === 'New' || stat.change === 'Real-time' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 bg-slate-500/10'}`}>
                      {stat.change}
                    </span>
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
               </div>
             </motion.div>
          ))}
        </div>


        {/* Main Workspace Grid - Perfection in Symmetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
          
          {/* Left Side: Tasks */}
          <div className="lg:col-span-2 flex flex-col">
             <div className="flex-1 bg-card border border-border rounded-3xl md:rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                <TodoList />
             </div>
          </div>

          {/* Right Side: Connections & Logs */}
          <div className="flex flex-col gap-6 md:gap-8">
             {/* Quick Inbox */}
             <div className="flex-1 p-6 md:p-8 rounded-3xl md:rounded-[3rem] bg-card border border-border space-y-6 md:space-y-8 group transition-all duration-500 hover:border-primary/20 shadow-sm hover:shadow-xl flex flex-col min-h-[320px]">
                <div className="flex items-center justify-between">
                   <h3 className="font-black text-foreground text-lg uppercase tracking-tight flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-emerald-500" />
                      Quick Inbox
                   </h3>
                   {dashboardStats.unreadMessages > 0 && (
                     <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-pulse border border-emerald-500/20">
                       {dashboardStats.unreadMessages} New
                     </div>
                   )}
                </div>
                
                <div className="flex-1 space-y-3">
                  {dashboardStats.unreadConversations.length > 0 ? (
                    dashboardStats.unreadConversations.slice(0, 3).map((conn, i) => (
                      <div key={i} className="flex items-center justify-between group/user p-3 rounded-2xl hover:bg-muted transition-all cursor-pointer border border-transparent hover:border-emerald-500/20" onClick={() => router.push(`/messages?userId=${conn.id}`)}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-500 border border-emerald-500/20 overflow-hidden">
                              {conn.avatar ? <img src={conn.avatar} className="w-full h-full object-cover" alt="" /> : conn.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card"></div>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{conn.name || conn.email.split('@')[0]}</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase opacity-60">Message Waiting</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-16 h-16 rounded-[2rem] bg-muted/50 flex items-center justify-center border border-border">
                        <Zap className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-foreground uppercase tracking-widest">Inbox Cleared</p>
                      </div>
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

             {/* System Stream */}
             <div className="p-6 md:p-8 rounded-3xl md:rounded-[3rem] bg-slate-900 border border-slate-800 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="relative z-10 flex flex-col space-y-6">
                   <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-primary">
                         <Activity className="w-5 h-5" />
                      </div>
                      <h4 className="text-lg font-black tracking-tight uppercase">System Stream</h4>
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
                        <p className="text-[10px] font-bold text-white/30 uppercase text-center py-4">No recent signals</p>
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
