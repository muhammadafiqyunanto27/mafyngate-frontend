'use client';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden">
            <div className="relative flex items-center justify-center scale-110 md:scale-125">
                {/* Outer Rotating Ring */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute w-32 h-32 border-t-2 border-primary border-r-2 border-transparent rounded-full shadow-[0_0_15px_rgba(var(--primary),0.2)]"
                />
                
                {/* Secondary Pulse Ring */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: [0, 0.2, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute w-32 h-32 bg-primary/20 rounded-full blur-xl"
                />

                {/* Main Logo Container */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-24 h-24 p-1 bg-card border border-border shadow-2xl shadow-primary/20 overflow-hidden group"
                >
                    {/* Animated Pulse Overlay */}
                    <motion.div 
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent z-10"
                    />
                    <img 
                        src="/logo.png?v=8" 
                        alt="MafynGate" 
                        className="w-full h-full object-cover" 
                    />
                </motion.div>
            </div>
            
            {/* Branding Text */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-12 text-center"
            >
                <h2 className="text-xl font-bold tracking-tighter text-foreground">MafynGate</h2>
                <div className="flex items-center gap-1.5 mt-1 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Initializing Portal</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse [animation-delay:400ms]"></span>
                </div>
            </motion.div>

            {/* Bottom Progress Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-muted/20">
                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 origin-left"
                />
            </div>
        </div>
    );
};

export default LoadingScreen;
