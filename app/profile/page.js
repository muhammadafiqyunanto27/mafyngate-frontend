'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { 
  User, 
  Camera, 
  Trash2, 
  Mail, 
  Shield, 
  CheckCircle2,
  X,
  Lock,
  Eye,
  Settings,
  Zap,
  ShieldCheck,
  ChevronRight,
  Loader2,
  ArrowRight,
  UserCircle
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

export default function ProfilePage() {
  const { user, loading, updateUser, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    isPrivate: false
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        isPrivate: user.isPrivate || false
      });
    }
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
    } catch (err) {
      console.error('Update failed:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update identity' });
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploadLoading(true);
    try {
      await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await updateUser();
      setMessage({ type: 'success', text: 'Avatar updated!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload photo.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteAvatar = async () => {
    if (!window.confirm('Remove profile photo?')) return;
    try {
      await api.delete('/user/avatar');
      await updateUser();
      setMessage({ type: 'success', text: 'Avatar removed.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
    } catch (err) {}
  };

  if (loading || !user) return null;

  const getAvatar = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith('http') ? avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${avatar}`;
  };

  return (
    <DashboardLayout pageTitle="Profile Management">
      <div className="max-w-4xl mx-auto space-y-10 pb-20 selection:bg-primary/30">
        
        {/* Profile Header */}
        <section className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="h-32 bg-primary/10 relative">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
          </div>
          <div className="p-8 md:p-10 pt-0 relative flex flex-col md:flex-row items-end gap-6 font-sans">
            <div className="relative group -mt-12">
              <div className="w-32 h-32 rounded-[2.5rem] bg-card border-[6px] border-background shadow-2xl overflow-hidden ring-1 ring-border/50">
                {user.avatar ? (
                  <img src={getAvatar(user.avatar)} className="w-full h-full rounded-[2rem] object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full rounded-[2rem] bg-muted flex items-center justify-center text-primary text-4xl font-black uppercase">
                    {(user.name || user.email).charAt(0)}
                  </div>
                )}
                {uploadLoading && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-[2rem]">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-1 -right-1 p-2.5 bg-primary text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all border-4 border-background"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
            </div>
            
            <div className="flex-1 flex flex-col pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-foreground uppercase tracking-tight truncate">
                  {user.name || user.email.split('@')[0]}
                </h1>
                {user.isPrivate && <Lock size={18} className="text-amber-500" />}
              </div>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {user.email}
              </p>
            </div>

            <div className="flex gap-3 pb-2 w-full md:w-auto">
               <button 
                onClick={() => setIsEditing(true)}
                className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
               >
                 Edit Profile
               </button>
               <button 
                onClick={() => router.push(`/profile/${user.id}`)}
                className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-muted text-foreground text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-all flex items-center justify-center gap-2"
               >
                 Public Preview <ArrowRight size={14} />
               </button>
            </div>
          </div>
        </section>

        {/* Bio & Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-8">
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-2">
                    Profile Bio
                 </h3>
                 <div className="space-y-6">
                    <p className="p-5 bg-muted/30 rounded-3xl text-sm font-medium leading-relaxed italic border border-border/5">
                      {user.bio || "No bio yet..."}
                    </p>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-card border border-border p-6 rounded-[2.5rem] flex items-center justify-between group">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Status</p>
                   <p className="text-sm font-black text-foreground">{user.isPrivate ? 'Private' : 'Public'}</p>
                </div>
                <div className={`p-3 rounded-2xl ${user.isPrivate ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                   {user.isPrivate ? <Lock size={20} /> : <Eye size={20} />}
                </div>
              </div>

              {user.avatar && (
                <button 
                  onClick={deleteAvatar}
                  className="w-full py-4 rounded-2xl bg-rose-500/5 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10 flex items-center justify-center gap-2"
                >
                  <Trash2 size={12} /> Delete Photo
                </button>
              )}
           </div>
        </div>

        {/* Modals & Notifications */}
        <AnimatePresence>
          {isEditing && (
            <div key="edit-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-card border border-border w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black uppercase tracking-tight">Update Details</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-muted rounded-xl transition-all"><X /></button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Display Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-sm font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Bio</label>
                    <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-sm font-bold min-h-[120px] resize-none" />
                  </div>
                  
                  <div className="p-5 bg-muted/40 rounded-3xl border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">Private Mode</p>
                      <p className="text-[10px] text-muted-foreground font-medium italic mt-0.5">Approval required to follow</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isPrivate: !formData.isPrivate})}
                      className={`w-12 h-6 rounded-full transition-all relative ${formData.isPrivate ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${formData.isPrivate ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <button type="submit" className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-2xl mt-4">
                    {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}

          {message.text && (
            <motion.div key="toast" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-10 right-10 p-6 rounded-[2rem] shadow-2xl z-[150] border flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-rose-500/90 text-white border-rose-400'}`}>
               {message.type === 'success' ? <CheckCircle2 size={24} /> : <X size={24} />}
               <p className="text-xs font-black uppercase tracking-[0.2em] italic">{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
