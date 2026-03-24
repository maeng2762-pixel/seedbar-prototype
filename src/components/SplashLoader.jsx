import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashLoader({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="global-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#09070f] overflow-hidden"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.5 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[120px] bg-[#5B13EC]/30 rounded-full" 
            />
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              transition={{ duration: 2.5, ease: "easeOut", delay: 0.2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[100px] bg-rose-500/20 rounded-full" 
            />
          </div>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 20 }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            <motion.div 
              animate={{ 
                boxShadow: ["0px 0px 0px 0px rgba(91,19,236,0)", "0px 0px 50px 20px rgba(91,19,236,0.3)", "0px 0px 0px 0px rgba(91,19,236,0)"]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="size-32 bg-primary/20 rounded-3xl overflow-hidden backdrop-blur-md border border-primary/30 shadow-2xl relative"
            >
              <div className="absolute inset-0 border-[2px] border-white/20 rounded-3xl pointer-events-none"></div>
              <img src="/seedbar-logo.png" alt="Seedbar logo" className="w-full h-full object-cover scale-90" />
            </motion.div>
            
            <motion.div className="flex flex-col items-center">
                <motion.h1 
                initial={{ opacity: 0, letterSpacing: "-0.05em" }}
                animate={{ opacity: 1, letterSpacing: "0.15em" }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                className="text-white text-3xl font-extrabold uppercase mt-2 drop-shadow-lg font-sans"
                >
                Seedbar
                </motion.h1>
                <motion.p
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.8, delay: 0.8 }}
                   className="text-primary-light text-[10px] uppercase tracking-[0.3em] mt-3 font-semibold"
                >
                    Choreography Studio
                </motion.p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="flex items-center gap-2 mt-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-ping" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-ping" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" style={{ animationDelay: "300ms" }} />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
