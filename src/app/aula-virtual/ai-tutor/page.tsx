"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, MessageSquare, Coffee, Briefcase, Plane } from "lucide-react";
import Link from "next/link";
import { ChatInterface } from "@/components/roleplay/chat-interface";
import { Button } from "@/components/ui/button";

const SCENARIOS = [
  {
    id: "cafe",
    title: "At the Coffee Shop",
    icon: <Coffee className="w-8 h-8 text-amber-500" />,
    color: "bg-amber-500/10 border-amber-500/30",
    desc: "Practice ordering coffee and pastries.",
    greeting: "Hi there! Welcome to Starbrew. What can I get for you today?",
    mockReplies: ["Sure, what size would you like for that?", "For here or to go?", "That will be $4.50. You can pay with card whenever you're ready."]
  },
  {
    id: "job",
    title: "Job Interview",
    icon: <Briefcase className="w-8 h-8 text-blue-500" />,
    color: "bg-blue-500/10 border-blue-500/30",
    desc: "Answer common interview questions.",
    greeting: "Hello, nice to meet you. Thanks for coming in. Can you start by telling me a bit about yourself?",
    mockReplies: ["That's interesting. What would you say is your biggest weakness?", "Where do you see yourself in 5 years?", "Do you have any questions for me about the role?"]
  },
  {
    id: "airport",
    title: "Airport Customs",
    icon: <Plane className="w-8 h-8 text-emerald-500" />,
    color: "bg-emerald-500/10 border-emerald-500/30",
    desc: "Pass through passport control.",
    greeting: "Next in line, please! Passports and arrival cards.",
    mockReplies: ["What is the purpose of your visit?", "How long do you plan to stay?", "Are you carrying any food or more than $10,000 in cash?"]
  }
];

export default function AiTutorPage() {
  const [activeScenario, setActiveScenario] = useState<any>(null);

  return (
    <div className="min-h-screen relative p-4 md:p-8 flex flex-col pt-20">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-40 bg-background/60 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full" asChild>
            <Link href="/aula-virtual">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <span className="font-bold">Tutor IA Premium</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!activeScenario ? (
            <motion.div 
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full"
            >
              <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-6xl font-black mb-4">
                  Elige tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Aventura</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Selecciona un escenario de la vida real. Nuestro agente impulsado por IA evaluará tus habilidades de conversación al vuelo.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {SCENARIOS.map((s, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    key={s.id}
                    onClick={() => setActiveScenario(s)}
                    className={`glass-card p-8 rounded-3xl cursor-pointer border ${s.color} hover:shadow-2xl transition-all group relative overflow-hidden`}
                  >
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{s.title}</h3>
                    <p className="text-muted-foreground">{s.desc}</p>
                    
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full"
            >
              <ChatInterface scenario={activeScenario} onExit={() => setActiveScenario(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
