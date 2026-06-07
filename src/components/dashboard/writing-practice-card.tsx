"use client";

import { useState } from "react";
import { PenTool, CheckCircle, XCircle } from "lucide-react";

export function WritingPracticeCard({ language, lesson }: { language: string, lesson: any }) {
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<"correct"|"incorrect"|null>(null);

  const targetSentence = lesson.sentenceES;
  const correctTranslation = lesson.sentenceTarget;

  const checkAnswer = () => {
    if (!inputValue.trim()) return;
    
    // Simplistic ignore-case validation
    if (inputValue.toLowerCase().trim() === correctTranslation.toLowerCase()) {
      setFeedback("correct");
    } else {
      setFeedback("incorrect");
    }
  };

  return (
    <div className="glass-card p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] flex flex-col justify-center border-white/5 overflow-hidden relative group hover:shadow-2xl hover:shadow-primary/10 transition-all h-full bg-gradient-to-br from-background to-primary/5">
       <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors" />
       
       <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-2 sm:mb-4 flex items-center gap-2.5 sm:gap-3 relative z-10 w-full">
         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
           <PenTool className="w-5 h-5 sm:w-6 sm:h-6" />
         </div>
         <span className="truncate">Traduce la frase</span>
       </h3>
       
       <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-sm relative z-10">
         Escribe en <span className="text-primary font-bold">{language}</span> la siguiente oración:
       </p>
       
       <div className="mb-4 sm:mb-6 p-4 sm:p-6 rounded-2xl bg-secondary/60 border border-white/10 relative z-10 text-center shadow-inner mt-2 sm:mt-4">
           <p className="text-lg sm:text-xl md:text-2xl font-black text-foreground">"{targetSentence}"</p>
       </div>

       <div className="flex gap-2.5 sm:gap-3 relative z-10 mt-auto">
         <input 
            type="text" 
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setFeedback(null);
            }}
            placeholder={`Escribe aquí...`}
            className={`flex-1 h-12 sm:h-16 w-full rounded-xl sm:rounded-2xl px-4 sm:px-6 bg-background border-2 focus:outline-none transition-all shadow-sm text-sm sm:text-base ${
              feedback === "correct" ? "border-green-500 bg-green-500/5 text-green-600 dark:text-green-400 font-bold" 
              : feedback === "incorrect" ? "border-red-500 bg-red-500/5 text-red-600 dark:text-red-400 font-bold animate-shake" 
              : "border-primary/20 focus:border-primary"
            }`}
            onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
         />
         <button 
           onClick={checkAnswer}
           className={`h-12 w-12 sm:h-16 sm:w-16 shrink-0 flex items-center justify-center rounded-xl sm:rounded-2xl text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${
               feedback === "correct" ? "bg-green-500 shadow-green-500/20"
             : feedback === "incorrect" ? "bg-red-500 shadow-red-500/20"
             : "bg-primary shadow-primary/20 hover:bg-primary/90"
           }`}
         >
            {feedback === "correct" ? <CheckCircle className="w-5 h-5 sm:w-8 sm:h-8" /> 
            : feedback === "incorrect" ? <XCircle className="w-5 h-5 sm:w-8 sm:h-8" /> 
            : <span className="font-extrabold text-sm sm:text-lg">OK</span>}
         </button>
       </div>
    </div>
  );
}
