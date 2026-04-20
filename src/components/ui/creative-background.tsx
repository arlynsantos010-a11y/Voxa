"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function CreativeBackground() {
  const [mounted, setMounted] = useState(false);
  const [crosses, setCrosses] = useState<{ top: string; left: string }[]>([]);

  useEffect(() => {
    const newCrosses = [...Array(10)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
    setCrosses(newCrosses);
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-background transition-colors duration-500">
      {/* Gradientes de Profundidad - Adaptables al tema */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      {/* Patrón de Rejilla (Grid) Memphis */}
      <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      {/* Formas Geométricas Flotantes Grandes */}
      <motion.div
        animate={{ 
          rotate: 360,
          y: [0, -20, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] right-[15%] w-64 h-64 border-[1px] border-primary/20 rounded-[40px] rotate-45"
      />

      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: -360
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[15%] left-[10%] w-80 h-80 border-[1px] border-accent/20 rounded-full"
      />

      {/* Triángulos Memphis con Líneas */}
      <motion.div 
        animate={{ y: [0, -30, 0], x: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[5%] opacity-30 dark:opacity-40"
      >
        <svg width="120" height="120" viewBox="0 0 100 100" className="text-primary fill-none stroke-current stroke-[1.5]">
          <path d="M50 10 L90 90 L10 90 Z" />
          <path d="M30 80 L70 80" className="opacity-50" />
          <path d="M40 70 L60 70" className="opacity-50" />
        </svg>
      </motion.div>

      {/* Círculos de Colores Sólidos */}
      <div className="absolute top-[40%] right-[5%] w-12 h-12 bg-primary/20 rounded-full blur-sm" />
      <div className="absolute bottom-[40%] left-[20%] w-8 h-8 bg-accent/30 rounded-full blur-sm" />

      {/* Ondas / ZigZags */}
      <div className="absolute top-[70%] right-[20%] opacity-20 dark:opacity-10 rotate-12">
        <svg width="200" height="40" viewBox="0 0 200 40" className="text-foreground fill-none stroke-current stroke-[3]">
          <path d="M0 20 Q 25 0, 50 20 T 100 20 T 150 20 T 200 20" />
        </svg>
      </div>

      {/* Cruces Memphis */}
      {mounted && crosses.map((pos, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.4, 0.1], rotate: 180 }}
          transition={{ duration: 10 + i * 2, repeat: Infinity }}
          className="absolute text-foreground/20 font-bold text-2xl"
          style={{ 
            top: pos.top, 
            left: pos.left 
          }}
        >
          +
        </motion.div>
      ))}

      {/* Líneas Diagonales de Acento */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_100px,currentColor_101px,currentColor_102px)]" />
      </div>
    </div>
  );
}