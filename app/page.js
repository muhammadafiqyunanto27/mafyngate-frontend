import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white selection:bg-indigo-500 selection:text-white">
      
      {/* Decorative background effects */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <main className="relative z-10 text-center px-6 max-w-3xl">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
          <span className="text-sm font-medium text-indigo-300">v1.0 Production Ready</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">
          MafynGate
        </h1>
        
        <p className="mt-4 text-xl md:text-2xl text-gray-300 font-light mb-10 leading-relaxed">
          Secure, stateless authentication. Experience lightning-fast JWT architecture and a beautifully crafted UI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95"
          >
            Access Portal
          </Link>
          
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-300 backdrop-blur-md active:scale-95"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <p className="text-sm text-gray-500">
             Try accessing the <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4">Secured Dashboard</Link> without logging in first.
          </p>
        </div>
      </main>
    </div>
  );
}
