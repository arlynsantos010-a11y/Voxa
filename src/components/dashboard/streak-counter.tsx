"use client";

import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

export function StreakCounter() {
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Simulated fetch from Firebase or LocalStorage
    setStreak(12); // Simulated mock streak
    setXp(2450);   // Simulated mock XP
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-4 bg-background/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-1.5"
      >
        <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
        <span className="font-bold text-orange-500">{streak}</span>
      </motion.div>
      <div className="w-px h-4 bg-white/10 mx-1" />
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-1.5"
      >
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="font-bold text-yellow-400 font-mono">{xp} XP</span>
      </motion.div>
    </div>
  );
}
