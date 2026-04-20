"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, RotateCcw, CheckCircle, XCircle } from "lucide-react";

export interface Flashcard {
  id: string;
  wordInfo: string;
  word: string;
  translation: string;
  example: string;
  language: string;
  code: string; // for speech synthesis, e.g., 'fr-FR', 'en-US'
}

const mockCards: Flashcard[] = [
  { id: "1", wordInfo: "Sustantivo", word: "Aujourd'hui", translation: "Hoy", example: "Aujourd'hui, il fait très beau.", language: "Francés", code: "fr-FR" },
  { id: "2", wordInfo: "Verbo", word: "To achieve", translation: "Lograr / Alcanzar", example: "She worked hard to achieve her goals.", language: "Inglés", code: "en-US" },
  { id: "3", wordInfo: "Expresión", word: "Genau", translation: "Exactamente", example: "Das ist genau das, was ich meine.", language: "Alemán", code: "de-DE" },
  { id: "4", wordInfo: "Sustantivo", word: "Knowledge", translation: "Conocimiento", example: "Knowledge is power.", language: "Inglés", code: "en-US" },
  { id: "5", wordInfo: "Verbo", word: "Manger", translation: "Comer", example: "Je veux manger.", language: "Francés", code: "fr-FR" },
  { id: "6", wordInfo: "Sustantivo", word: "Wort", translation: "Palabra", example: "Das ist ein schönes Wort.", language: "Alemán", code: "de-DE" },
  { id: "7", wordInfo: "Sustantivo", word: "Salute", translation: "Salud", example: "Salute! Come stai?", language: "Italiano", code: "it-IT" },
  { id: "8", wordInfo: "Verbo", word: "Ascoltare", translation: "Escuchar", example: "Devi ascoltare attentamente.", language: "Italiano", code: "it-IT" },
];

export function FlashcardWidget({ language }: { language: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const languageCards = mockCards.filter((c) => c.language === language);
  const cardsToUse = languageCards.length > 0 ? languageCards : mockCards;
  
  const card = cardsToUse[currentIndex];

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar voltear la tarjeta
    if (!window.speechSynthesis) return;

    // Detener cualquier audio anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = card.code;
    utterance.rate = 0.9; // Hablar ligeramente más lento para mejor comprensión

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mockCards.length);
    }, 150);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-sm mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          Repaso de {language} <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs shrink-0">{cardsToUse.length} Palabras</span>
        </h3>
        <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {cardsToUse.length}
        </div>
      </div>

      <div 
        className="w-full relative h-[250px] cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full absolute inset-0"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Cara Delantera (Frente) */}
          <div 
            className="absolute inset-0 backface-hidden glass-card rounded-[2rem] p-6 flex flex-col items-center justify-center border-2 border-transparent hover:border-primary/20 transition-colors shadow-lg"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="absolute top-6 left-6 text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
              {card.wordInfo}
            </span>
            
            <h4 className="text-4xl font-headline font-black text-center mt-6 mb-8 text-foreground break-words w-full px-4">
              {card.word}
            </h4>
            
            <button 
              onClick={playAudio}
              className={`absolute bottom-6 w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all ${
                isPlaying 
                ? "bg-primary text-primary-foreground scale-110 shadow-primary/40 animate-pulse" 
                : "bg-secondary text-foreground hover:bg-primary/20 hover:text-primary"
              }`}
            >
              <Volume2 className="w-6 h-6" />
              {isPlaying && (
                <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50" />
              )}
            </button>
          </div>

          {/* Cara Trasera (Traducción) */}
          <div 
            className="absolute inset-0 backface-hidden glass-card rounded-[2rem] p-8 flex flex-col items-center justify-center border-t border-white/10 shadow-xl bg-primary/5 dark:bg-primary/10"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <h4 className="text-2xl font-bold mb-2 text-primary text-center">
              {card.translation}
            </h4>
            
            <div className="w-full h-px bg-primary/20 my-4" />
            
            <p className="text-sm font-medium text-center text-muted-foreground italic mb-6">
              "{card.example}"
            </p>

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={(e) => { e.stopPropagation(); nextCard(); }}
                className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all hover:scale-110"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextCard(); }}
                className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all hover:scale-110"
              >
                <CheckCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      
      <p className="text-center text-xs mt-6 text-muted-foreground font-medium animate-pulse">
        Toca la tarjeta para voltearla
      </p>
    </div>
  );
}
