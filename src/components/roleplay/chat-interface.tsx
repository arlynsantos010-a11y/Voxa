"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, ArrowLeft, Bot, User, Sparkles } from "lucide-react";
import { triggerSuccessConfetti } from "@/lib/confetti";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export function ChatInterface({ scenario, onExit }: { scenario: any, onExit: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", sender: "ai", text: scenario.greeting }
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), sender: "user", text: inputText };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setIsTyping(true);

    // Mock AI Reply Logic based on input length or context
    setTimeout(() => {
      let reply = "I'm not sure what you mean, but let's practice more!";
      if (newMsg.text.toLowerCase().includes("hello") || newMsg.text.toLowerCase().includes("hola")) {
        reply = "Hello! Please, let me see your documents.";
      } else if (newMsg.text.length > 20) {
        reply = "That sounds great! Your grammar was very good there.";
        triggerSuccessConfetti();
      } else {
        reply = scenario.mockReplies[Math.floor(Math.random() * scenario.mockReplies.length)];
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: "ai", text: reply }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Navegador no soportado para reconocimiento de voz.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; // o basado en config
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => setInputText((prev) => prev ? prev + " " + event.results[0][0].transcript : event.results[0][0].transcript);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    
    recognition.start();
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-2xl mx-auto glass-card rounded-[2.5rem] overflow-hidden border border-white/5 relative bg-background/50 backdrop-blur-3xl shadow-2xl">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/5 bg-background/80 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onExit} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-sm tracking-widest uppercase text-muted-foreground">{scenario.title}</span>
          <div className="flex items-center gap-2 text-xs text-primary font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            IA En línea
          </div>
        </div>
        <div className="w-9 h-9" /> {/* spacer for center alignment */}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar" ref={scrollRef}>
        <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; }`}} />
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex w-full ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-3 max-w-[80%] ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${m.sender === "user" ? "bg-primary text-white" : "bg-purple-500/20 text-purple-400"}`}>
                  {m.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-5 py-3 rounded-2xl ${m.sender === "user" ? "bg-primary text-white rounded-tr-none" : "bg-white/5 text-foreground rounded-tl-none border border-white/5"}`}>
                  <p className="leading-relaxed text-sm md:text-base">{m.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/5 rounded-tl-none border border-white/5 flex gap-1 items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-background/50">
        <div className="flex items-center gap-2 relative">
          <Sparkles className="absolute left-4 w-5 h-5 text-purple-500/50" />
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your response or use voice..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-12 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button 
            onClick={handleVoice}
            className={`absolute right-14 p-2 rounded-full transition-colors ${isRecording ? "bg-red-500/20 text-red-500" : "text-muted-foreground hover:text-primary"}`}
          >
            <Mic className={`w-5 h-5 ${isRecording ? "animate-pulse" : ""}`} />
            {isRecording && <span className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />}
          </button>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() && !isRecording}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
