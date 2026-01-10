import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BreakMessageProps {
  showBreakMessage: boolean;
}

export const BreakMessage: React.FC<BreakMessageProps> = ({ showBreakMessage }) => {
  return (
    <AnimatePresence>
      {showBreakMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
        >
          <div className="bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-md px-12 py-8 rounded-2xl border-2 border-white/30 shadow-2xl">
            <h2 className="text-4xl font-bold text-white text-center drop-shadow-md mb-4">
              ارتاح قليلا
            </h2>
            <p className="text-xl text-white text-center opacity-90">خذ استراحة لمدة 5 دقائق</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};