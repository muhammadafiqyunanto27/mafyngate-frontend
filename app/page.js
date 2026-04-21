'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  Mail, 
  MessageCircle,
  Video,
  Bell,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 1. Redirect to dashboard if already logged in (silent background check)
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // 2. Premium Loading State (Unified for everyone)
  if (loading) return <LoadingScreen />;

  // 3. User present? We are redirecting, return null to avoid flicker of landing page
  if (user) return null;
  
  // Gmail Compose Function for Landing Page
  const openGmail = () => {
    const email = "muhammadafiqyunanto@gmail.com";
    const subject = encodeURIComponent("MafynGate | Quick Support Request");
    const body = encodeURIComponent("Hi Development Team,\n\nI have a question/report regarding the gateway:\n\n[Details here]");
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* 1. Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 overflow-hidden shadow-lg shadow-primary/20 flex-shrink-0">
              <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground select-none">
              MafynGate
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-bold text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest px-4">
              Login
            </Link>
            <Link href="/register" className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest flex items-center">
              Join
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-44 pb-28 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-foreground max-w-4xl"
        >
          Your Gateway to Private <br/>
          <span className="text-primary">Communication</span>
        </motion.h1>
        <p className="mt-6 text-base text-muted-foreground max-w-xl font-medium leading-relaxed opacity-80">
          A robust, stateless platform for secure messaging and video calls. 
          Built with speed and privacy at the core.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/register" className="h-12 px-10 rounded-xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center">
            Get Started
          </Link>
          <Link href="/guide" className="h-12 px-10 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/80 transition-all flex items-center gap-2 border border-border">
            User Guide
          </Link>
          <Link href="#support" className="h-12 px-10 rounded-xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all flex items-center">
            Support
          </Link>
        </div>
      </section>

      {/* 3. Features (Grid) */}
      <section className="py-16 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {[
          { icon: Lock, title: 'Secure Gateway', desc: 'Stateless JWT architecture ensures your sessions are fast and private.', color: 'primary' },
          { icon: Video, title: 'WebRTC Calls', desc: 'HD video calls with built-in camera switching and mirror controls.', color: 'emerald-500' },
          { icon: Bell, title: 'Instant Sync', desc: 'Real-time notifications for followers and messages across all tabs.', color: 'indigo-500' }
        ].map((f, i) => (
          <div key={i} className="p-8 rounded-[2rem] bg-card border border-border flex flex-col items-start gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <f.icon size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* 4. Support Section (Standardized with Profile) */}
      <section id="support" className="py-24 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight text-foreground uppercase italic tracking-widest">Connect Support</h2>
            <p className="text-sm text-muted-foreground mt-2 font-medium opacity-70 italic uppercase tracking-[0.2em]">Contact development team directly.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* WhatsApp Card */}
            <button 
              onClick={() => window.open('https://wa.me/6282219785260', '_blank')}
              className="flex flex-col items-center text-center gap-5 p-10 rounded-[2.5rem] bg-card border border-border hover:border-emerald-500 transition-all group shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 duration-500"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner">
                <MessageCircle size={36} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">WhatsApp Support</p>
                <p className="text-lg font-black text-foreground">+62 822 1978 5260</p>
              </div>
            </button>

            {/* Email Card (Same Redirect as Profile) */}
            <button 
              onClick={openGmail}
              className="flex flex-col items-center text-center gap-5 p-10 rounded-[2.5rem] bg-card border border-border hover:border-primary transition-all group shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-95 duration-500"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                <Mail size={36} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1 group-hover:text-primary transition-colors">Gmail Direct</p>
                <p className="text-lg font-black text-foreground">Report a Glitch</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Footer (Standardized) */}
      <footer className="py-6 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 group">
            <div className="w-6 h-6 overflow-hidden flex-shrink-0">
              <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">MafynGate</span>
          </div>

          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40 text-muted-foreground text-center">
            © 2026 muhammad afiq yunanto alright reserved
          </p>

          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest">
            <Link href="/register" className="text-muted-foreground hover:text-primary transition-all">Register</Link>
            <Link href="/login" className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all tracking-[0.2em]">Access Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
