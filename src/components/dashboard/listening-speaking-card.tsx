"use client";

import { useState } from "react";
import { Mic, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { triggerSuccessConfetti } from "@/lib/confetti";

export function ListeningSpeakingCard({ language, lesson }: { language: string, lesson: any }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchStatus, setMatchStatus] = useState<"idle" | "success" | "fail">("idle");

  const { word: targetWord, code: langCode, flag } = lesson;

  const playAudio = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetWord);
    utterance.lang = langCode;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Tu navegador no soporta grabación de reconocimiento de voz.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = langCode;
    recognition.interimResults = false;
    
    recognition.onstart = () => { setIsListening(true); setTranscript(""); setMatchStatus("idle"); };
    recognition.onresult = (event: any) => { 
      const result = event.results[0][0].transcript;
      setTranscript(result); 
      
      const cleanTarget = targetWord.trim().toLowerCase().replace(/[.,!?¡¿]/g, "");
      const cleanResult = result.trim().toLowerCase().replace(/[.,!?¡¿]/g, "");
      
      if (cleanResult.includes(cleanTarget) || cleanTarget === cleanResult) {
        setMatchStatus("success");
        triggerSuccessConfetti();
      } else {
        setMatchStatus("fail");
      }
    };
    recognition.onend = () => { setIsListening(false); };
    recognition.onerror = () => { setIsListening(false); };
    recognition.start();
  };

  return (
    <div className="glass-card p-4 sm:p-6 rounded-[2rem] sm:rounded-[3rem] border-white/5 bg-gradient-to-br from-background to-secondary/10 flex flex-col h-full w-full relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all">
      <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors" />

      <div className="flex justify-between items-center mb-4 sm:mb-6 relative z-10 px-1 sm:px-2 mt-1 sm:mt-2">
         <h3 className="text-base sm:text-xl font-bold text-foreground">Practica Oral ({language})</h3>
         <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary/10 text-primary font-bold text-[10px] sm:text-xs rounded-full">{flag} {langCode}</span>
      </div>
      
      <div className="flex flex-row gap-2.5 sm:gap-4 flex-1 w-full relative z-10">
        
        {/* Mini Tarjeta 1: Escucha */}
        <div className="flex-1 glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex flex-col items-center justify-center border-white/5 hover:border-primary/30 transition-all gap-2 sm:gap-4 bg-background/40">
          <p className="text-[10px] sm:text-xs text-primary font-bold uppercase tracking-widest text-center">1. Escucha</p>
          <button 
            onClick={playAudio}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-all shrink-0 ${
              isPlaying ? "bg-primary text-white scale-110 shadow-primary/40" : "bg-primary/10 text-primary hover:bg-primary hover:text-white hover:scale-105"
            }`}
          >
            <Volume2 className={`w-6 h-6 sm:w-8 sm:h-8 ${isPlaying ? "animate-pulse" : ""}`} />
          </button>
          <div className="bg-primary/5 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl mt-1 sm:mt-2 w-full text-center border border-primary/10">
             <p className="font-black text-sm sm:text-lg truncate">{targetWord}</p>
          </div>
        </div>

        {/* Mini Tarjeta 2: Hablar */}
        <div className={`flex-1 glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex flex-col items-center justify-center border-white/5 transition-all gap-2 sm:gap-4 bg-background/40 ${matchStatus === "success" ? "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : matchStatus === "fail" ? "border-red-500/30" : "hover:border-primary/30"}`}>
          <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest text-center ${matchStatus === "success" ? "text-green-500" : "text-primary"}`}>2. Repite</p>
          <div className="relative">
            <button 
              onClick={startListening}
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg transition-all z-10 relative shrink-0 ${
                isListening ? "bg-primary text-white scale-110 shadow-primary/40" : matchStatus === "success" ? "bg-green-500/20 text-green-500" : "bg-primary/10 text-primary hover:bg-primary hover:text-white hover:scale-105"
              }`}
            >
              <Mic className={`w-6 h-6 sm:w-8 sm:h-8 ${isListening ? "animate-pulse" : ""}`} />
            </button>
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center gap-0.5 sm:gap-1 -z-10 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["10%", "100%", "10%"] }}
                    transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-0.5 sm:w-1 bg-primary/40 rounded-full"
                    style={{ minHeight: "6px", maxHeight: "40px" }}
                  />
                ))}
              </div>
            )}
            {isListening && <div className="absolute top-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-full animate-ping opacity-30 -z-20" />}
          </div>
          <div className={`px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl mt-1 sm:mt-2 w-full text-center border min-h-[38px] sm:min-h-[46px] flex items-center justify-center transition-colors ${matchStatus === "success" ? "bg-green-500/10 border-green-500/20" : matchStatus === "fail" ? "bg-red-500/10 border-red-500/20" : "bg-primary/5 border-primary/10"}`}>
             <p className={`font-bold text-xs sm:text-sm italic break-words ${matchStatus === "success" ? "text-green-400" : matchStatus === "fail" ? "text-red-400" : "text-foreground opacity-80"}`}>{transcript || "Habla..."}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
