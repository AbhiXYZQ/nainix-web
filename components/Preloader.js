'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Marketplace platforms value speed; 2.4s is a sweet spot for "premium loading"
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: -10,
            transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0e0e0e]"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Subtle Brand Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative flex flex-col items-center"
            >
              <h2 className="text-3xl font-bold tracking-[0.25em] text-white/90 uppercase">
                Nainix
              </h2>
              <div className="h-[1px] w-8 bg-primary/40 mt-1" />
            </motion.div>

            {/* The Marketplace Loading Line */}
            <div className="w-56 h-[3px] bg-white/5 rounded-full overflow-hidden relative">
              {/* Primary Progress Fill */}
              <motion.div
                initial={{ width: "0%", x: "-5%" }}
                animate={{ width: "100%", x: "0%" }}
                transition={{ 
                  duration: 2.2, 
                  ease: [0.65, 0, 0.35, 1] 
                }}
                className="h-full bg-gradient-to-r from-primary via-accent to-primary"
              />
              
              {/* Premium Shimmer Overlay */}
              <motion.div
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </div>

            {/* Status Feedback */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3"
            >
               <span className="text-[10px] tracking-[0.4em] text-white uppercase font-medium">
                  Direct Hiring • 0% Commission
               </span>
            </motion.div>
          </div>

          {/* Bottom Branding / Trust Factor */}
          <div className="absolute bottom-12 overflow-hidden px-8">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 0.2, y: 0 }}
               transition={{ delay: 1 }}
               className="text-[9px] tracking-[0.2em] text-white uppercase text-center max-w-xs"
             >
                The Future of Professional Freelancing
             </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



