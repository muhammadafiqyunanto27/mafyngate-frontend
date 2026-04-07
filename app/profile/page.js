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
  Smartphone,
  Globe,
  Clock,
  CheckCircle2
} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  const sections = [
    {
      title: 'Personal Information',
      description: 'Update your personal details and how others see you.',
      icon: User,
      fields: [
        { label: 'Full Name', value: 'System Administrator', icon: User },
        { label: 'Email Address', value: user.email, icon: Mail },
        { label: 'Recovery Phone', value: '+1 (555) 000-0000', icon: Smartphone },
      ]
    },
    {
      title: 'Security Settings',
      description: 'Manage your password and account security preferences.',
      icon: Shield,
      fields: [
        { label: 'Password', value: '••••••••••••', icon: Key },
        { label: 'Two-Factor Auth', value: 'Enabled', icon: CheckCircle2, status: 'success' },
      ]
    }
  ];

  const recentActivity = [
    { event: 'Logged in from New Device', time: '2 hours ago', location: 'San Francisco, CA', icon: Globe },
    { event: 'Password Changed Successfully', time: '1 day ago', location: 'Chrome on MacOS', icon: Key },
    { event: 'Security Settings Updated', time: '3 days ago', location: 'Safari on iPhone', icon: Shield },
  ];

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Profile Header */}
        <section className="relative">
          <div className="h-48 rounded-3xl bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
          </div>
          
          <div className="px-8 -mt-16 flex flex-col md:flex-row items-end gap-6 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-card border-4 border-background p-1.5 shadow-xl transition-transform group-hover:scale-[1.02]">
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-primary-500 to-primary-300 flex items-center justify-center text-white text-4xl font-bold shadow-inner uppercase">
                  {user.email.charAt(0)}
                </div>
              </div>
              <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg border-2 border-background hover:bg-primary-600 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 pb-2">
              <h1 className="text-3xl font-bold text-foreground">System Admin</h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Active Professional Account
              </p>
            </div>

            <div className="flex gap-3 pb-2">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-600 transition-all active:scale-95"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </section>

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
                    <div key={fIdx} className={`p-6 flex items-center justify-between group cursor-pointer hover:bg-muted/30 transition-colors ${fIdx !== section.fields.length - 1 ? 'border-b border-border' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                          <field.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{field.label}</p>
                          <p className="text-foreground font-semibold mt-0.5">{field.value}</p>
                        </div>
                      </div>
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
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex gap-4 relative">
                       {i !== recentActivity.length -1 && (
                         <div className="absolute left-[19px] top-10 bottom-[-10px] w-0.5 bg-border"></div>
                       )}
                       <div className={`z-10 w-10 min-w-10 h-10 rounded-full flex items-center justify-center border-2 border-background shadow-sm ${activity.event.includes('Failed') ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                          <activity.icon className="w-5 h-5" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{activity.event}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{activity.time} • {activity.location}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-8 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-bold hover:bg-muted/70 transition-all active:scale-95">
                  View Full Audit Log
               </button>
            </div>

            <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-4">
               <div className="flex items-center gap-3 text-rose-500">
                  <div className="p-2 rounded-lg bg-rose-500/10"><LogOut className="w-5 h-5" /></div>
                  <h4 className="font-bold">Dangerous Zone</h4>
               </div>
               <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete your account and all associated data from our servers.</p>
               <button className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all active:scale-95">
                  Delete Account
               </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
