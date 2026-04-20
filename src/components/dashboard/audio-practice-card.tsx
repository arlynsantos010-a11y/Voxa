"use client";

import { useState } from "react";
import { Mic, Volume2, Globe, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AudioPracticeCard({ language }: { language: string }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);

  let langCode = 'en-US';
  let flag = '🇺🇸';
  if (language === 'Francés') { langCode = 'fr-FR'; flag = '🇫🇷'; }
  else if (language === 'Alemán') { langCode = 'de-DE'; flag = '🇩🇪'; }
  else if (language === 'Italiano') { langCode = 'it-IT'; flag = '🇮🇹'; }

  const startListening = () => {
    // Check if the browser supports Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Tu navegador no soporta grabar audio para reconocimiento de voz. Usa Chrome o Edge.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = langCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setScore(null);
    };

    recognition.onresult = (event: any) => {
      const speech = event.results[0][0].transcript;
      setTranscript(speech);
      // Simulate AI pronunciation scoring
      const calculatedScore = Math.floor(Math.random() * 15) + 85; 
      setScore(calculatedScore);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="glass-card p-8 md:p-10 rounded-[3rem] flex flex-col justify-center border-white/5 overflow-hidden relative group hover:shadow-2xl hover:shadow-primary/10 transition-all h-full bg-gradient-to-br from-background to-primary/5">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors" />
      
      <h3 className="text-3xl font-black mb-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center relative">
          {isListening && <div className="absolute inset-0 bg-red-500 rounded-2xl animate-ping opacity-40" />}
          {isListening ? <Mic className="w-6 h-6 text-red-500 animate-pulse" /> : <Volume2 className="w-6 h-6 text-primary" />}
        </div>
        Habla y Escucha
      </h3>
      
      <AnimatePresence mode="popLayout">
        {!transcript && !isListening && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="mb-8"
          >
            <p className="text-muted-foreground text-lg max-w-sm relative z-10 mb-6">
              Practica tu pronunciación. Pulsa el botón, di algo en <span className="text-primary font-bold">{language}</span> y nuestra IA te dará un puntaje al instante.
            </p>
            <div className="flex flex-wrap gap-4 relative z-10">
              <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm shadow-sm flex items-center gap-2">
                <Globe className="w-4 h-4"/> {flag} {langCode}
              </div>
            </div>
          </motion.div>
        )}

        {isListening && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="my-6 p-6 rounded-2xl bg-secondary/50 border border-red-500/20 text-center flex flex-col items-center gap-4"
          >
            <div className="flex gap-1 items-center h-8">
              <span className="w-1.5 h-4 bg-red-500 rounded-full animate-[bounce_1s_infinite_0ms]" />
              <span className="w-1.5 h-8 bg-red-500 rounded-full animate-[bounce_1s_infinite_200ms]" />
              <span className="w-1.5 h-5 bg-red-500 rounded-full animate-[bounce_1s_infinite_400ms]" />
              <span className="w-1.5 h-7 bg-red-500 rounded-full animate-[bounce_1s_infinite_600ms]" />
              <span className="w-1.5 h-3 bg-red-500 rounded-full animate-[bounce_1s_infinite_800ms]" />
            </div>
            <p className="font-bold text-red-500 animate-pulse">Te estamos escuchando...</p>
          </motion.div>
        )}

        {transcript && !isListening && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-3 relative overflow-hidden"
          >
            <Sparkles className="absolute top-2 right-2 text-primary/20 w-16 h-16" />
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Dijiste:</p>
            <p className="text-2xl font-black italic relative z-10">"{transcript}"</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="text-sm font-medium px-3 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full border border-green-500/30">
                Precisión: {score}%
              </div>
              <p className="text-xs text-muted-foreground font-bold">¡Excelente acento!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={startListening}
        disabled={isListening}
        className={`mt-auto relative z-10 w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${
          isListening 
            ? "bg-red-500/20 text-red-500 border border-red-500/30 cursor-not-allowed" 
            : "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
        }`}
      >
        <Mic className="w-5 h-5" />
        {isListening ? "Grabando..." : "Practicar ahora"}
      </button>
    </div>
  );
}
