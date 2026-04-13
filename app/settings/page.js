'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Shield, 
  Key, 
  LogOut,
  Mail,
  MessageCircle,
  LifeBuoy,
  ChevronRight,
  X,
  CheckCircle2,
  Lock,
  ArrowLeft,
  AtSign
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api';

export default function SettingsPage() {
  const { user, loading, deleteAccount, updateUser, updateProfile } = useAuth();
  const router = useRouter();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailData, setEmailData] = useState({
    newEmail: ''
  });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) setEmailData({ newEmail: user.email });
  }, [user, loading, router]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
      return;
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
      }, 1000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to change password' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    if (!emailData.newEmail || emailData.newEmail === user.email) {
      return setIsChangingEmail(false);
    }
    setUpdateLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.patch('/user/me', { email: emailData.newEmail });
      await updateUser();
      setMessage({ type: 'success', text: 'Email updated successfully!' });
      setTimeout(() => {
        setIsChangingEmail(false);
        setMessage({ type: '', text: '' });
      }, 1000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Email update failed' 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
    } finally {
      setUpdateLoading(false);
    }
  };

  const openGmail = () => {
    const email = "muhammadafiqyunanto@gmail.com";
    const subject = encodeURIComponent("MafynGate | Support Request");
    const body = encodeURIComponent("Description:\n\nUser: " + (user?.name || user?.email));
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
  };

  if (loading || !user) return null;

  return (
    <DashboardLayout pageTitle="Account Settings">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4 md:px-0 pb-20 selection:bg-primary/30">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0 pb-6 border-b border-border text-center md:text-left">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight">Settings</h1>
            <p className="text-xs md:text-sm text-muted-foreground font-medium italic">Manage your account security and support access.</p>
          </div>
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield size={28} className="md:w-8 md:h-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6 md:space-y-8">
            {/* Security Section */}
            <div className="bg-card border border-border rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
               <div className="p-6 md:p-8 border-b border-border bg-muted/20">
                  <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                     <Lock size={14} className="md:w-4 md:h-4" /> Security & Identity
                  </h3>
               </div>
               <div className="p-1 md:p-2 space-y-1">
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full p-5 md:p-6 flex items-center justify-between group hover:bg-muted/50 rounded-2xl md:rounded-3xl transition-all"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-2.5 md:p-3 bg-indigo-500/10 text-indigo-500 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
                        <Key size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-foreground">Change Password</p>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Update your security keys</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>

                  <button 
                    onClick={() => setIsChangingEmail(true)}
                    className="w-full p-5 md:p-6 flex items-center justify-between group hover:bg-muted/50 rounded-2xl md:rounded-3xl transition-all"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-2.5 md:p-3 bg-amber-500/10 text-amber-500 rounded-xl md:rounded-2xl group-hover:scale-110 transition-transform">
                        <AtSign size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold text-foreground">Change Email</p>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5 truncate overflow-hidden">Current: {user.email}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
               </div>
            </div>

            {/* Support Section */}
            <div className="bg-card border border-border rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-sm">
               <div className="p-6 md:p-8 border-b border-border bg-muted/20">
                  <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                     <LifeBuoy size={14} className="md:w-4 md:h-4" /> Support Gateway
                  </h3>
               </div>
               <div className="p-1 md:p-2 space-y-1">
                  <button onClick={openGmail} className="w-full p-5 md:p-6 flex items-center justify-between group hover:bg-muted/50 rounded-2xl md:rounded-3xl transition-all">
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-2.5 md:p-3 bg-primary/10 text-primary rounded-xl md:rounded-2xl shrink-0">
                        <Mail size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-foreground">Email Developer</p>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Send bug report via Gmail</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  </button>

                  <button onClick={() => window.open('https://wa.me/6282219785260', '_blank')} className="w-full p-5 md:p-6 flex items-center justify-between group hover:bg-muted/50 rounded-2xl md:rounded-3xl transition-all">
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-2.5 md:p-3 bg-emerald-500/10 text-emerald-500 rounded-xl md:rounded-2xl shrink-0">
                        <MessageCircle size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-bold text-foreground">WhatsApp Support</p>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Instant technical feedback</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                  </button>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Danger Zone */}
<div className="p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] bg-rose-500/5 border border-rose-500/20 space-y-5 md:space-y-6">
               <div className="flex items-center gap-3 text-rose-500 justify-center md:justify-start">
                  <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-rose-500/10 shrink-0"><LogOut size={18} className="md:w-5 md:h-5" /></div>
                  <h4 className="font-black uppercase tracking-tight text-sm md:text-base">Dangerous Zone</h4>
               </div>
               <p className="text-[11px] md:text-xs text-muted-foreground font-medium leading-relaxed italic text-center md:text-left">Warning: Permanently delete your operational gateway and all associated neural data. This cannot be undone.</p>
               <button 
                onClick={async () => {
                  if (window.confirm('WIPE ALL DATA? This is irreversible.')) {
                    setUpdateLoading(true);
                    try { await deleteAccount(); } catch (err) { alert('Failed'); } finally { setUpdateLoading(false); }
                  }
                }}
                disabled={updateLoading}
                className="w-full py-4 rounded-2xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 shadow-xl shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
               >
                  {updateLoading ? 'Processing Request...' : 'Terminate Account'}
               </button>
            </div>
          </div>

        </div>
      </div>

      <AnimatePresence>
        {/* Change Password Modal */}
          <div key="pass-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChangingPassword(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-card border border-border w-full max-w-sm rounded-3xl md:rounded-[2.5rem] shadow-2xl p-6 md:p-8">
               <div className="flex justify-between items-center mb-6 md:mb-8">
                 <h2 className="text-lg md:text-xl font-black uppercase tracking-tight">Update Password</h2>
                 <button onClick={() => setIsChangingPassword(false)} className="p-2 hover:bg-muted rounded-xl transition-all shrink-0"><X size={20} /></button>
               </div>
               <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Current Password</label>
                    <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-sm font-bold" placeholder="Old Password" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">New Password</label>
                    <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-sm font-bold" placeholder="New Password" />
                  </div>
                  <div className="space-y-1 pb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Verify Password</label>
                    <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-sm font-bold" placeholder="Confirm New Password" />
                  </div>
                  <button type="submit" className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                    {updateLoading ? 'Updating...' : 'Authorize Change'}
                  </button>
               </form>
            </motion.div>
          </div>
        )}

        {/* Change Email Modal */}
          <div key="email-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChangingEmail(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-card border border-border w-full max-w-sm rounded-3xl md:rounded-[2.5rem] shadow-2xl p-6 md:p-8">
               <div className="flex justify-between items-center mb-6 md:mb-8">
                 <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-amber-500">Change Email</h2>
                 <button onClick={() => setIsChangingEmail(false)} className="p-2 hover:bg-muted rounded-xl transition-all shrink-0"><X size={20} /></button>
               </div>
               <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div className="space-y-1 pb-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">New Email Address</label>
                    <input type="email" value={emailData.newEmail} onChange={(e) => setEmailData({newEmail: e.target.value})} className="w-full px-5 py-4 bg-muted border border-border rounded-2xl text-sm font-bold" placeholder="Enter new email..." />
                  </div>
                  <button type="submit" className="w-full py-4 bg-amber-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                    {updateLoading ? 'Syncing...' : 'Update Email'}
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
    </DashboardLayout>
  );
}
