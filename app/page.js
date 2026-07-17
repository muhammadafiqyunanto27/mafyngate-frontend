'use client';

import Link from 'next/link';
import { 
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
  const { user, loading, serverError } = useAuth();
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
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] selection:bg-[#8B5CF6]/20 font-sans">
      
      {/* Server Error Banner — visible when backend is down/misconfigured */}
      {serverError && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-rose-600 text-white px-4 py-3 flex items-center justify-center gap-3 text-sm font-bold shadow-lg">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse flex-shrink-0" />
          <span>⚠️ Server Bermasalah: {serverError}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="ml-4 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* 1. Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#09090B]/80 backdrop-blur-md border-b border-[#27272A] h-16 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 overflow-hidden shadow-lg shadow-[#8B5CF6]/20 flex-shrink-0">
              <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#FAFAFA] select-none">
              MafynGate
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-bold text-[#A1A1AA] hover:text-[#FAFAFA] transition-all uppercase tracking-widest px-4">
              Login
            </Link>
            <Link href="/register" className="h-10 px-6 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shadow-lg shadow-[#8B5CF6]/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest flex items-center">
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
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#FAFAFA] max-w-4xl"
        >
          Your Gateway to Private <br/>
          <span className="text-[#8B5CF6]">Communication</span>
        </motion.h1>
        <p className="mt-6 text-base md:text-lg text-[#A1A1AA] max-w-2xl font-light leading-relaxed">
          A robust, stateless platform for secure messaging and video calls. 
          Built with speed and privacy at the core.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/register" className="h-12 px-10 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm shadow-xl shadow-[#8B5CF6]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center">
            Get Started
          </Link>
          <Link href="/guide" className="h-12 px-10 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 border border-[#27272A]">
            User Guide
          </Link>
          <Link href="#support" className="h-12 px-10 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center border border-[#27272A]">
            Support
          </Link>
        </div>
      </section>

      {/* 3. Features (Grid) */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {[
          { icon: Lock, title: 'Secure Gateway', desc: 'Stateless JWT architecture ensures your sessions are fast and private.' },
          { icon: Video, title: 'WebRTC Calls', desc: 'HD video calls with built-in camera switching and mirror controls.' },
          { icon: Bell, title: 'Instant Sync', desc: 'Real-time notifications for followers and messages across all tabs.' }
        ].map((f, i) => (
          <div key={i} className="p-8 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col items-start gap-4 shadow-sm hover:border-[#8B5CF6]/50 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">
              <f.icon size={24} />
            </div>
            <h3 className="text-xl font-semibold text-[#FAFAFA]">{f.title}</h3>
            <p className="text-base text-[#A1A1AA] leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* 4. Support Section */}
      <section id="support" className="py-20 px-6 bg-[#09090B] border-t border-[#27272A]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-[#FAFAFA] uppercase tracking-wider">Connect Support</h2>
            <p className="text-sm text-[#A1A1AA] mt-2 font-light uppercase tracking-[0.2em]">Contact development team directly.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* WhatsApp Card */}
            <button 
              onClick={() => window.open('https://wa.me/6282219785260', '_blank')}
              className="flex flex-col items-center text-center gap-5 p-10 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#22C55E]/50 transition-all duration-300 group shadow-sm hover:scale-[1.02] active:scale-95"
            >
              <div className="w-20 h-20 rounded-lg bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] group-hover:bg-[#22C55E] group-hover:text-black transition-all duration-500 shadow-inner">
                <MessageCircle size={36} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A1A1AA] mb-1">WhatsApp Support</p>
                <p className="text-lg font-bold text-[#FAFAFA]">+62 822 1978 5260</p>
              </div>
            </button>

            {/* Email Card */}
            <button 
              onClick={openGmail}
              className="flex flex-col items-center text-center gap-5 p-10 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#8B5CF6]/50 transition-all duration-300 group shadow-sm hover:scale-[1.02] active:scale-95"
            >
              <div className="w-20 h-20 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-black transition-all duration-500 shadow-inner">
                <Mail size={36} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#A1A1AA] mb-1 group-hover:text-[#8B5CF6] transition-colors">Gmail Direct</p>
                <p className="text-lg font-bold text-[#FAFAFA]">Report a Glitch</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="py-12 border-t border-[#27272A] bg-[#09090B]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 group">
            <div className="w-6 h-6 overflow-hidden flex-shrink-0">
              <img src="/logo.png?v=8" alt="MafynGate" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#FAFAFA]">MafynGate</span>
          </div>

          <p className="text-xs font-normal tracking-wide text-[#A1A1AA] text-center">
            © 2026 Muhammad Afiq Yunanto. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
            <Link href="/register" className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-all">Register</Link>
            <Link href="/login" className="px-5 py-2.5 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all tracking-[0.2em]">Access Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
