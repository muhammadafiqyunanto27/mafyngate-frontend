'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSocket } from '../../../context/SocketContext';
import DashboardLayout from '../../../components/DashboardLayout';
import { 
  User, 
  Mail, 
  Shield, 
  Lock, 
  UserPlus, 
  UserMinus,
  CheckCircle2,
  X,
  Clock,
  ChevronLeft,
  Loader2,
  Activity,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../lib/api';
import { getMediaUrl } from '../../../lib/url';
import Lightbox from '../../../components/Lightbox';

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.userId;
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [lightboxMedia, setLightboxMedia] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/user/profile/${userId}`);
      setProfile(res.data.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      if (currentUser && currentUser.id === userId) {
        router.push('/profile');
        return;
      }
      fetchProfile();
    }
  }, [userId, currentUser]);

  // Real-time Update Listener
  useEffect(() => {
    if (!socket || !userId) return;

    const handleConnectionUpdate = (data) => {
      if (data.targetId === userId) {
        fetchProfile();
      }
    };

    socket.on('connection_update', handleConnectionUpdate);
    return () => socket.off('connection_update', handleConnectionUpdate);
  }, [socket, userId]);

  const handleFollowAction = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      if (profile.isFollowing || profile.isPending) {
        await api.delete(`/user/unfollow/${userId}`);
        setProfile(prev => ({ ...prev, isFollowing: false, isPending: false }));
        setMessage({ type: 'success', text: 'Disconnected' });
      } else {
        const res = await api.post(`/user/follow/${userId}`);
        const { status } = res.data;
        setProfile(prev => ({ 
          ...prev, 
          isFollowing: status === 'ACCEPTED', 
          isPending: status === 'PENDING' 
        }));
        
        if (socket) socket.emit('follow_user', { followingId: userId });
        setMessage({ 
          type: 'success', 
          text: status === 'PENDING' ? 'Request sent!' : 'Following!' 
        });
      }
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed' });
      setTimeout(() => setMessage({ type: '', text: '' }), 1000);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout pageTitle="Loading Profile...">
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (!profile) return (
    <DashboardLayout pageTitle="User Not Found">
       <div className="h-[60vh] flex flex-col items-center justify-center p-8 opacity-40">
          <User className="w-20 h-20 mb-6" />
          <p className="text-sm font-black uppercase tracking-widest">User not found</p>
          <button onClick={() => router.back()} className="mt-8 px-6 py-2 bg-muted rounded-xl text-xs font-bold uppercase tracking-widest">Go Back</button>
       </div>
    </DashboardLayout>
  );

  const isLocked = profile.isPrivate && !profile.isFollowing;

  return (
    <DashboardLayout pageTitle={profile.name || "User Profile"}>
      <div className="max-w-4xl mx-auto space-y-10 selection:bg-primary/30 pb-20">
        
        {/* Profile Header */}
        <section className="bg-card border border-border rounded-[3rem] overflow-hidden shadow-2xl relative">
          <div className="h-32 bg-primary/10 relative">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#000_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
             <button onClick={() => router.back()} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 text-foreground rounded-xl transition-all z-20">
                <ChevronLeft className="w-5 h-5" />
             </button>
          </div>
          
          <div className="p-8 md:p-10 pt-0 relative flex flex-col md:flex-row items-end gap-6 font-sans">
            <div className="relative group -mt-12">
              <div className="w-32 h-32 rounded-[2.5rem] bg-card border-[6px] border-background shadow-2xl overflow-hidden ring-1 ring-border/50">
                {profile.avatar ? (
                  <img 
                    src={getMediaUrl(profile.avatar)} 
                    className="w-full h-full rounded-[2rem] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    alt={profile.name}
                    onClick={() => setLightboxMedia(profile.avatar)}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div className={`w-full h-full items-center justify-center text-primary text-4xl font-black uppercase ${profile.avatar ? 'hidden' : 'flex'}`}>
                  {(profile.name || profile.id || '?').charAt(0)}
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col pb-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-foreground tracking-tight truncate">
                  {profile.displayName || profile.name}</h1>
                {profile.isPrivate && <Lock className="w-5 h-5 text-muted-foreground" />}
              </div>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-muted-foreground/30' : 'bg-emerald-500 animate-pulse'}`}></span>
                {isLocked ? 'Private Profile' : 'Gateway Connection Active'}
              </p>
            </div>

            <div className="flex gap-3 pb-2 w-full md:w-auto">
               <button 
                onClick={handleFollowAction}
                disabled={actionLoading}
                className={`flex-1 md:flex-none px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  profile.isFollowing 
                    ? 'bg-rose-500 text-white shadow-rose-500/20' 
                    : profile.isPending
                    ? 'bg-amber-500 text-white'
                    : 'bg-primary text-white shadow-primary/20 hover:bg-primary-600'
                }`}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  profile.isFollowing ? <><UserMinus size={14} /> Unfollow</> : 
                  profile.isPending ? <><Clock size={14} /> Requested</> : 
                  profile.followsMe ? <><UserPlus size={14} /> Follow Back</> : 
                  <><UserPlus size={14} /> {profile.isPrivate ? 'Connect' : 'Follow'}</>
                )}
              </button>
              
              {!isLocked && (
                <button 
                  onClick={() => router.push(`/messages?userId=${userId}`)}
                  className="px-6 py-3 rounded-2xl bg-muted text-foreground font-black text-[10px] uppercase tracking-widest hover:bg-muted/80 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} /> Message
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-8">
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">
                    Profile Bio
                 </h3>
                 {isLocked ? (
                  <div className="py-10 text-center space-y-4">
                     <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto text-muted-foreground/30">
                        <Lock size={40} />
                     </div>
                     <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">This profile is private</p>
                  </div>
                ) : (
                  <p className="text-foreground font-medium text-sm leading-relaxed italic opacity-80 p-5 bg-muted/30 rounded-3xl border border-border/5">
                    {profile.bio || "No bio yet..."}
                  </p>
                )}
              </div>
           </div>

           <div className="space-y-6">
              <div className="bg-card border border-border rounded-[2.5rem] p-6 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Account Status</h4>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black uppercase text-muted-foreground">Type</p>
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${profile.isPrivate ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                         {profile.isPrivate ? 'Private' : 'Public'}
                       </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {message.text && (
            <motion.div key="public-toast" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-10 right-10 p-6 rounded-[2rem] shadow-2xl z-50 flex items-center gap-4 border ${message.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-500/90 border-rose-400 text-white'}`}>
              {message.type === 'success' ? <CheckCircle2 size={24} /> : <X size={24} />}
              <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lightbox Integration */}
        <AnimatePresence>
          {lightboxMedia && (
            <Lightbox 
              media={lightboxMedia}
              onClose={() => setLightboxMedia(null)}
              allowActions={false}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
