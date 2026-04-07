'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Camera, 
  ChevronRight, 
  Key, 
  LogOut,
  Clock,
  CheckCircle2,
  Zap,
  Activity,
  MessageSquare,
  CheckCircle,
  X,
  Lock
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

export default function ProfilePage() {
  const { user, loading, updateProfile, deleteAccount } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activities, setActivities] = useState([]);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      const res = await api.get('/user/activities');
      setActivities(res.data.data);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchActivities();
      const interval = setInterval(fetchActivities, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditing(false);
        setMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/user/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsChangingPassword(false);
        setMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'LOGIN': return Zap;
      case 'REGISTER': return User;
      case 'TASK_CREATED': return MessageSquare;
      case 'TASK_COMPLETED': return CheckCircle;
      case 'PROFILE_UPDATED': return User;
      case 'PASSWORD_CHANGED': return Lock;
      default: return Activity;
    }
  };

  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const sections = [
    {
      title: 'Personal Information',
      description: 'Update your personal details and how others see you.',
      icon: User,
      fields: [
        { label: 'Display Name', value: user.name || 'Not set', icon: User },
        { label: 'Email Address', value: user.email, icon: Mail },
      ]
    },
    {
      title: 'Security Settings',
      description: 'Manage your password and account security preferences.',
      icon: Shield,
      fields: [
        { label: 'Password', value: '••••••••••••', icon: Key, action: () => setIsChangingPassword(true) },
      ]
    }
  ];

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Profile Header */}
        <section className="relative">
          <div className="h-48 rounded-[2.5rem] bg-gradient-to-r from-indigo-700 via-primary-600 to-primary-800 shadow-2xl relative overflow-hidden flex items-end">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
            
            {/* Username inside blue banner - positioned 5px above boundary */}
            <div className="relative z-20 pl-[11.5rem] pb-[5px] hidden md:block">
               <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-black text-white drop-shadow-lg tracking-tight"
               >
                 {user.name || user.email.split('@')[0]}
               </motion.h1>
            </div>
          </div>
          
          <div className="px-8 -mt-16 flex flex-col md:flex-row items-end gap-6 relative z-10 font-sans">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-card border-4 border-background p-1.5 shadow-2xl transition-transform group-hover:scale-105 duration-300">
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white text-4xl font-black shadow-inner uppercase">
                  {(user.name || user.email).charAt(0)}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg border-2 border-background hover:bg-primary-600 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-20">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            {/* Email section - Fixed positioning 5px below boundary */}
            <div className="flex-1 flex flex-col self-start mt-[69px]">
              <h1 className="text-2xl font-black text-foreground md:hidden mb-1">
                {user.name || user.email.split('@')[0]}
              </h1>
              <div className="flex flex-col gap-0.5">
                <p className="text-muted-foreground font-bold flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {user.email}
                </p>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-60 ml-4">
                  Authenticated User
                </div>
              </div>
            </div>

            <div className="flex gap-3 pb-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-600 transition-all active:scale-95"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditing(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10"
              >
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                  <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 rounded-xl h-10 w-10 flex items-center justify-center hover:bg-muted text-muted-foreground transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="p-6 space-y-5">
                  {message.text && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Display Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <User className="w-5 h-5" />
                      </div>
                      <input 
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input 
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={updateLoading}
                      className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updateLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Change Password Modal */}
        <AnimatePresence>
          {isChangingPassword && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsChangingPassword(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10"
              >
                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/30">
                  <h2 className="text-xl font-bold text-foreground">Change Password</h2>
                  <button 
                    onClick={() => setIsChangingPassword(false)}
                    className="p-2 rounded-xl h-10 w-10 flex items-center justify-center hover:bg-muted text-muted-foreground transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePasswordUpdate} className="p-6 space-y-5">
                  {message.text && (
                    <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {message.text}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Current Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-5 h-5" />
                      </div>
                      <input 
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">New Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Key className="w-5 h-5" />
                      </div>
                      <input 
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <input 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="flex-1 py-3 px-4 rounded-xl border border-border font-bold text-sm hover:bg-muted transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={updateLoading}
                      className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {updateLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-8">
            {sections.map((section, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm"
              >
                <div className="p-6 border-b border-border bg-muted/30">
                   <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <section.icon className="w-5 h-5 text-primary" />
                      {section.title}
                   </h3>
                   <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                </div>
                <div className="p-0">
                  {section.fields.map((field, fIdx) => (
                    <div 
                      key={fIdx} 
                      onClick={field.action}
                      className={`p-6 flex items-center justify-between group cursor-pointer hover:bg-muted/30 transition-colors ${fIdx !== section.fields.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                          <field.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{field.label}</p>
                          <p className="text-foreground font-semibold mt-0.5">{field.value}</p>
                        </div>
                      </div>
                      {field.action && (
                        <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                          CHANGE
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
               <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Activity
               </h3>
               <div className="space-y-6">
                  {activities.length === 0 ? (
                    <div className="text-center py-10 px-4 border-2 border-dashed border-border rounded-2xl">
                      <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-xs text-muted-foreground font-medium italic">No recent activity detected</p>
                    </div>
                  ) : (
                    activities.map((activity, i) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex gap-4 relative group">
                           {i !== activities.length - 1 && (
                             <div className="absolute left-[19px] top-10 bottom-[-10px] w-0.5 bg-border group-hover:bg-primary/20 transition-colors"></div>
                           )}
                           <div className={`z-10 w-10 min-w-10 h-10 rounded-full flex items-center justify-center border-2 border-background shadow-sm transition-transform group-hover:scale-110 ${activity.type === 'TASK_COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                              <Icon className="w-5 h-5" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground leading-tight">{activity.message}</p>
                              <p className="text-[11px] text-muted-foreground mt-1 font-medium">{getTimeAgo(activity.createdAt)} • System Action</p>
                           </div>
                        </div>
                      )
                    })
                  )}
               </div>
            </div>

            <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4">
               <div className="flex items-center gap-3 text-rose-500">
                  <div className="p-2 rounded-lg bg-rose-500/10"><LogOut className="w-5 h-5" /></div>
                  <h4 className="font-bold">Dangerous Zone</h4>
               </div>
               <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete your account and all associated data from our servers.</p>
               <button 
                onClick={async () => {
                  if (window.confirm('ARE YOU ABSOLUTELY SURE? This action is permanent and cannot be undone.')) {
                    setUpdateLoading(true);
                    try {
                      await deleteAccount();
                    } catch (err) {
                      alert('Failed to delete account');
                      setUpdateLoading(false);
                    }
                  }
                }}
                disabled={updateLoading}
                className="w-full py-4 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
               >
                  {updateLoading ? 'Deleting...' : 'Delete Account'}
               </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
