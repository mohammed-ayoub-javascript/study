import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotivationOverlayProps {
  motivationMsg: string;
  achievementGlow: boolean;
  currentGlowColor: string | null;
}

export const MotivationOverlay: React.FC<MotivationOverlayProps> = ({
  motivationMsg,
  achievementGlow,
  currentGlowColor,
}) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {motivationMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div
              style={{
                borderColor: currentGlowColor || '',
                boxShadow: `0 0 40px ${currentGlowColor}`,
              }}
              className="bg-black/60 backdrop-blur-xl px-12 py-6 rounded-3xl border-4 shadow-2xl transition-all duration-500"
            >
              <h2
                style={{
                  color: currentGlowColor || '',
                  textShadow: `0 0 20px ${currentGlowColor}`,
                }}
                className="text-5xl font-black text-center italic tracking-widest uppercase"
              >
                {motivationMsg}
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {achievementGlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.8, 0.4, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 pointer-events-none z-40"
            style={{
              boxShadow: `inset 0 0 100px ${currentGlowColor}, inset 0 0 200px ${currentGlowColor}44`,
              background: `radial-gradient(circle, transparent 40%, ${currentGlowColor}22 100%)`,
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
