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
    <div className="glass-card p-6 rounded-[3rem] border-white/5 bg-gradient-to-br from-background to-secondary/10 flex flex-col h-full w-full relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all">
      <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-colors" />

      <div className="flex justify-between items-center mb-6 relative z-10 px-2 mt-2">
         <h3 className="text-xl font-bold text-foreground">Practica Oral ({language})</h3>
         <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full">{flag} {langCode}</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full relative z-10">
        
        {/* Mini Tarjeta 1: Escuchar */}
        <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col items-center justify-center border-white/5 hover:border-primary/30 transition-all gap-4 bg-background/40">
          <p className="text-xs text-primary font-bold uppercase tracking-widest text-center">1. Escucha</p>
          <button 
            onClick={playAudio}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
              isPlaying ? "bg-primary text-white scale-110 shadow-primary/40" : "bg-primary/10 text-primary hover:bg-primary hover:text-white hover:scale-105"
            }`}
          >
            <Volume2 className={`w-8 h-8 ${isPlaying ? "animate-pulse" : ""}`} />
          </button>
          <div className="bg-primary/5 px-4 py-2 rounded-xl mt-2 w-full text-center border border-primary/10">
             <p className="font-black text-lg">{targetWord}</p>
          </div>
        </div>

        {/* Mini Tarjeta 2: Hablar */}
        <div className={`flex-1 glass-card rounded-3xl p-6 flex flex-col items-center justify-center border-white/5 transition-all gap-4 bg-background/40 ${matchStatus === "success" ? "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]" : matchStatus === "fail" ? "border-red-500/30" : "hover:border-primary/30"}`}>
          <p className={`text-xs font-bold uppercase tracking-widest text-center ${matchStatus === "success" ? "text-green-500" : "text-primary"}`}>2. Repite</p>
          <div className="relative">
            <button 
              onClick={startListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all z-10 relative ${
                isListening ? "bg-primary text-white scale-110 shadow-primary/40" : matchStatus === "success" ? "bg-green-500/20 text-green-500" : "bg-primary/10 text-primary hover:bg-primary hover:text-white hover:scale-105"
              }`}
            >
              <Mic className={`w-8 h-8 ${isListening ? "animate-pulse" : ""}`} />
            </button>
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center gap-1 -z-10 w-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["10%", "100%", "10%"] }}
                    transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-primary/40 rounded-full"
                    style={{ minHeight: "10px", maxHeight: "80px" }}
                  />
                ))}
              </div>
            )}
            {isListening && <div className="absolute top-0 left-0 w-16 h-16 bg-primary rounded-full animate-ping opacity-30 -z-20" />}
          </div>
          <div className={`px-4 py-2 rounded-xl mt-2 w-full text-center border min-h-[46px] flex items-center justify-center transition-colors ${matchStatus === "success" ? "bg-green-500/10 border-green-500/20" : matchStatus === "fail" ? "bg-red-500/10 border-red-500/20" : "bg-primary/5 border-primary/10"}`}>
             <p className={`font-bold text-sm italic break-words ${matchStatus === "success" ? "text-green-400" : matchStatus === "fail" ? "text-red-400" : "text-foreground opacity-80"}`}>{transcript || "Toca el micro y habla..."}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
