'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import ImageCropper from '../../components/ImageCropper';
import { 
  User, 
  Mail, 
  Shield, 
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
  Lock,
  LifeBuoy,
  MessageCircle
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

export default function ProfilePage() {
  const { user, loading, updateProfile, updateAvatar, deleteAccount } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activities, setActivities] = useState([]);
  const [showFullActivity, setShowFullActivity] = useState(false);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return setMessage({ type: 'error', text: 'Ukuran file maksimal 2MB' });
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (blob) => {
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.jpg');
      await updateAvatar(formData);
      setMessage({ type: 'success', text: 'Profile picture updated!' });
      setShowCropper(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal mengupload foto' });
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  // Direct Gmail Redirect
  const openGmail = () => {
    const email = "muhammadafiqyunanto@gmail.com";
    const subject = encodeURIComponent("MafynGate | Support Request");
    const body = encodeURIComponent("Description:\n\nUser: " + (user.name || user.email));
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
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
    },
    {
      title: 'Support & Bug Report',
      description: 'Found a glitch or need help? Contact our developer team.',
      icon: LifeBuoy,
      fields: [
        { label: 'Email Report', value: 'Send formal bug report', icon: Mail, action: openGmail },
        { label: 'WhatsApp Support', value: 'Instant technical chat', icon: MessageCircle, action: () => window.open('https://wa.me/6282219785260', '_blank') }
      ]
    }
  ];

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="max-w-5xl mx-auto space-y-10 selection:bg-primary/30">
        
        {/* RESTORED: Profile Header (Full Size) */}
        <section className="relative">
          <div className="h-48 rounded-[2.5rem] bg-gradient-to-r from-indigo-700 via-primary-600 to-primary-800 shadow-2xl relative overflow-hidden flex items-end">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
            
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
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="w-32 h-32 rounded-3xl bg-card border-4 border-background p-1.5 shadow-2xl transition-transform group-hover:scale-105 duration-300 overflow-hidden">
                {user.avatar ? (
                  <img 
                    src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.avatar}`} 
                    className="w-full h-full rounded-2xl object-cover"
                    alt={user.name}
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-white text-4xl font-black shadow-inner uppercase">
                    {(user.name || user.email).charAt(0)}
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg border-2 border-background hover:bg-primary-600 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-20 flex items-center justify-center"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
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

        {/* Success/Error Toast (Original Size) */}
        {message.text && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`fixed bottom-10 right-10 p-5 rounded-2xl shadow-2xl z-[150] border flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-rose-500/90 text-white border-rose-400'}`}>
             {message.type === 'success' ? <CheckCircle2 size={24} /> : <X size={24} />}
             <p className="text-xs font-black uppercase tracking-widest italic">{message.text}</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          
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
                   <h3 className="text-lg font-bold text-foreground flex items-center gap-2 uppercase tracking-tight italic">
                      <section.icon className="w-5 h-5 text-primary" />
                      {section.title}
                   </h3>
                   <p className="text-sm text-muted-foreground mt-1 font-medium">{section.description}</p>
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
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">{field.label}</p>
                          <p className="text-foreground font-semibold mt-1.5">{field.value}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-30 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-8">
            {/* RESTORED: Full Activity Logic */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
               <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6 italic uppercase tracking-tight">
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
                    <>
                      {(showFullActivity ? activities : activities.slice(0, 5)).map((activity, i, arr) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <motion.div layout key={activity.id} className="flex gap-4 relative group">
                             {i !== arr.length - 1 && <div className="absolute left-[19px] top-10 bottom-[-10px] w-0.5 bg-border"></div>}
                             <div className={`z-10 w-10 min-w-10 h-10 rounded-full flex items-center justify-center border-2 border-background shadow-sm ${activity.type === 'TASK_COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                                <Icon className="w-5 h-5" />
                             </div>
                             <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground leading-tight truncate">{activity.message}</p>
                                <p className="text-[10px] text-muted-foreground mt-1 uppercase font-black">{getTimeAgo(activity.createdAt)}</p>
                             </div>
                          </motion.div>
                        )
                      })}
                      {activities.length > 5 && (
                        <button onClick={() => setShowFullActivity(!showFullActivity)} className="w-full py-2.5 mt-2 border border-dashed border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
                          {showFullActivity ? 'Show Less' : `Show More (${activities.length - 5}+)`}
                        </button>
                      )}
                    </>
                  )}
               </div>
            </div>

            {/* RESTORED: Dangerous Zone (Full Size) */}
            <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4">
               <div className="flex items-center gap-3 text-rose-500">
                  <div className="p-2 rounded-lg bg-rose-500/10"><LogOut className="w-5 h-5" /></div>
                  <h4 className="font-bold">Dangerous Zone</h4>
               </div>
               <p className="text-xs text-muted-foreground font-medium leading-relaxed">Permanently delete your account and all associated data from our servers. This action is irreversible.</p>
               <button 
                onClick={async () => {
                  if (window.confirm('ARE YOU ABSOLUTELY SURE? This action is permanent.')) {
                    setUpdateLoading(true);
                    try { await deleteAccount(); } catch (err) { alert('Failed to delete account'); } finally { setUpdateLoading(false); }
                  }
                }}
                disabled={updateLoading}
                className="w-full py-4 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-50"
               >
                  {updateLoading ? 'Processing...' : 'Delete Account'}
               </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 hidden md:block">
               {/* Modal Content - Kept original */}
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold">Edit Profile</h2>
                 <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-muted rounded-xl"><X /></button>
               </div>
               <form onSubmit={handleUpdate} className="space-y-4">
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm" placeholder="Name" />
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-sm" placeholder="Email" />
                  <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-xl">{updateLoading ? 'Saving...' : 'Save Changes'}</button>
               </form>
            </motion.div>
          </div>
        )}
        {isChangingPassword && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChangingPassword(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6">
               <h2 className="text-xl font-bold mb-6 italic italic italic">Security Update</h2>
               <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl" placeholder="Old Password" />
                  <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl" placeholder="New Password" />
                  <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl" placeholder="Confirm" />
                  <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl">Confirm Security Update</button>
               </form>
            </motion.div>
          </div>
        )}
        {showCropper && (
          <ImageCropper image={selectedImage} onCropComplete={handleCropComplete} onCancel={() => setShowCropper(false)} loading={avatarLoading} />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
