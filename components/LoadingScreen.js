'use client';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden">
            <div className="relative flex items-center justify-center">
                {/* Outer rotating ring */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute w-24 h-24 border-2 border-primary/20 border-t-primary rounded-full"
                />
                
                {/* Main Logo Container */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-16 h-16 rounded-xl bg-card border border-border overflow-hidden"
                >
                    <img 
                        src="/logo.png?v=8" 
                        alt="MafynGate" 
                        className="w-full h-full object-cover" 
                    />
                </motion.div>
            </div>
            
            {/* Branding Text */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="mt-8 text-center"
            >
                <h2 className="text-lg font-semibold tracking-tight text-foreground">MafynGate</h2>
                <p className="text-xs text-muted-foreground mt-1">Loading...</p>
            </motion.div>

            {/* Bottom Progress Line */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-muted">
                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="h-full bg-primary origin-left"
                />
            </div>
        </div>
    );
};

export default LoadingScreen;