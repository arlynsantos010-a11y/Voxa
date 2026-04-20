"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Star, Languages, Globe, CreditCard, Sparkles, Activity, PlaySquare, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ListeningSpeakingCard } from "./listening-speaking-card";
import { WritingPracticeCard } from "./writing-practice-card";

const skillData = [
  { subject: 'Habla', A: 120, fullMark: 150 },
  { subject: 'Escucha', A: 98, fullMark: 150 },
  { subject: 'Lectura', A: 86, fullMark: 150 },
  { subject: 'Escritura', A: 99, fullMark: 150 },
  { subject: 'Gramática', A: 85, fullMark: 150 },
  { subject: 'Vocabulario', A: 65, fullMark: 150 },
];

const languageLessons: Record<string, any> = {
  "Francés": { theme: "Saludos", word: "Bonjour", sentenceES: "Hola, ¿cómo estás?", sentenceTarget: "Bonjour, comment ça va?", code: "fr-FR", flag: "🇫🇷" },
  "Inglés": { theme: "Saludos", word: "Hello", sentenceES: "Hola, ¿cómo estás?", sentenceTarget: "Hello, how are you?", code: "en-US", flag: "🇺🇸" },
  "Alemán": { theme: "Saludos", word: "Hallo", sentenceES: "Hola, ¿cómo estás?", sentenceTarget: "Hallo, wie geht es dir?", code: "de-DE", flag: "🇩🇪" },
  "Italiano": { theme: "Saludos", word: "Ciao", sentenceES: "Hola, ¿cómo estás?", sentenceTarget: "Ciao, come stai?", code: "it-IT", flag: "🇮🇹" }
};

export default function StudentProgress({ progress }: { progress: any }) {
  const { enrolledLanguages, setSelectedLanguage } = useAuth();
  const [lessonsDb, setLessonsDb] = useState<Record<string, any[]>>({});
  const [cardIndices, setCardIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    const lessonsRef = ref(rtdb, 'lessons');
    const unsubscribe = onValue(lessonsRef, (snapshot) => {
      if (snapshot.exists()) {
        setLessonsDb(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  const mainActions = [
    { title: 'Tutor de IA', icon: Sparkles, color: 'from-blue-500 to-cyan-400', href: '/aula-virtual/ai-tutor', desc: 'Practica conversación' },
    { title: 'Reels Educativos', icon: PlaySquare, color: 'from-pink-500 to-rose-400', href: '/aula-virtual/reels', desc: 'Aprendizaje rápido' },
    { title: 'Explorar Idiomas', icon: Languages, color: 'from-orange-500 to-amber-400', href: '/idiomas', desc: 'Nuevas metas' },
    { title: 'Mi Suscripción', icon: CreditCard, color: 'from-emerald-500 to-teal-400', href: '/pagos', desc: 'Estado Premium' },
  ];

  return (
    <section className="py-10">
      <div className="flex items-center gap-4 mb-10">
        <Trophy className="w-8 h-8 text-primary" />
        <h2 className="font-headline text-3xl font-bold">Ruta de Aprendizaje</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tarjetas de Idiomas Inscritos */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          {enrolledLanguages.map((lang, idx) => (
            <motion.div 
              key={lang}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 300 }}
              className="h-full"
            >
              <Link 
                href="/aula-virtual" 
                onClick={() => setSelectedLanguage(lang)}
                className="block h-full"
              >
                <div className="glass-card p-8 rounded-[2.5rem] hover:border-primary/50 transition-all group h-full flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <Globe className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-3xl font-black mb-2">Curso de {lang}</h3>
                    <p className="text-muted-foreground font-medium mb-8">Nivel: B1 Intermedio Pro</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-primary">
                      <span>Progreso del Módulo</span>
                      <span>{65 + idx * 5}%</span>
                    </div>
                    <Progress value={65 + idx * 5} className="h-2.5 bg-secondary/30" indicatorClassName="bg-primary" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Acciones Rápidas */}
          {mainActions.map((action, idx) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: 10, scale: 1.02 }}
              transition={{ delay: 0.3 + idx * 0.1, type: "spring", stiffness: 300 }}
            >
              <Link href={action.href}>
                <div className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-white/20 h-full flex items-center gap-6 group cursor-pointer transition-all">
                  <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                    <action.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{action.desc}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Gráfico de Habilidades (Radar) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.01 }}
          className="glass-card p-10 rounded-[3rem] flex flex-col items-center justify-center overflow-hidden h-full border-white/10"
        >
          <div className="flex items-center gap-3 mb-10 self-start">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent" />
            </div>
            <h4 className="text-sm font-bold uppercase tracking-widest opacity-80">Perfil de Habilidades</h4>
          </div>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="hsl(var(--primary)/0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 'bold', opacity: 0.7 }} />
                <Radar
                  name="Habilidades"
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                  strokeWidth={3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 p-4 rounded-2xl bg-primary/5 text-center">
            <p className="text-xs text-muted-foreground font-medium">Tus habilidades de <span className="text-primary font-black">Escritura</span> y <span className="text-primary font-black">Habla</span> han mejorado un 15% este mes.</p>
          </div>
        </motion.div>
      </div>

      {/* Secciones Dinámicas por Idioma desde Firebase */}
      {enrolledLanguages.map((lang: string, index: number) => {
        const dbEntry = lessonsDb[lang];
        const lessonsArray = Array.isArray(dbEntry) ? dbEntry : (dbEntry ? [dbEntry] : [{ theme: "Cargando desde Firebase...", word: "...", sentenceES: "...", sentenceTarget: "...", code: "en-US", flag: "🌍" }]);
        
        const currentIndex = cardIndices[lang] || 0;
        const lesson = lessonsArray[currentIndex] || lessonsArray[0];
        const total = lessonsArray.length;

        const nextCard = () => setCardIndices(prev => ({ ...prev, [lang]: (currentIndex + 1) % total }));
        const prevCard = () => setCardIndices(prev => ({ ...prev, [lang]: (currentIndex - 1 + total) % total }));
        
        return (
        <div key={lang} className="mt-10 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                 <span className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-lg shadow-xl shadow-primary/20">
                   {index + 1}
                 </span>
                 Sección Interactiva: {lang}
              </h2>
              <p className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-sm border border-primary/20">
                 Tema Activo: {lesson.theme}
              </p>
            </div>

            {total > 1 && (
              <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-2xl border border-white/5">
                <span className="font-bold text-muted-foreground text-xs uppercase tracking-widest pl-2">
                  Tarjeta {currentIndex + 1} de {total}
                </span>
                <div className="flex gap-2">
                  <button onClick={prevCard} className="px-4 py-2 bg-background shadow-sm rounded-xl hover:bg-primary/20 hover:text-primary transition-all font-bold text-sm">
                    Atrás
                  </button>
                  <button onClick={nextCard} className="px-4 py-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20 rounded-xl hover:scale-105 active:scale-95 transition-all font-bold text-sm flex items-center gap-2">
                    Siguiente 👉
                  </button>
                </div>
              </div>
            )}
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            <ListeningSpeakingCard language={lang} lesson={lesson} />
            <WritingPracticeCard language={lang} lesson={lesson} />
          </motion.div>
        </div>
      )})}

      {/* Racha y Nivel */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="glass-card mt-10 p-10 rounded-[3rem] flex flex-col lg:flex-row items-center justify-between bg-primary/5 border-dashed border-primary/30 gap-8 transition-all"
      >
        <div className="flex items-center gap-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center relative shadow-2xl shadow-primary/20"
          >
            <Star className="w-12 h-12 text-primary" />
            <div className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-background shadow-lg">
              5
            </div>
          </motion.div>
          <div>
            <h4 className="text-4xl font-black mb-2 flex items-center gap-3">
              Racha de 5 días 🔥
            </h4>
            <p className="text-lg text-muted-foreground font-medium">
              ¡Casi llegas al nivel 6! Solo te faltan <span className="text-primary font-black">100 XP</span>.
            </p>
            <div className="mt-4 w-full max-w-sm">
              <Progress value={80} className="h-2 bg-primary/10" indicatorClassName="bg-primary" />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          {[1,2,3,4,5].map(i => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-xl shadow-primary/20 cursor-pointer"
            >
              {i}
            </motion.div>
          ))}
          <div className="w-14 h-14 rounded-2xl bg-secondary/40 flex items-center justify-center text-muted-foreground font-black text-xl opacity-40">
            6
          </div>
        </div>
      </motion.div>
    </section>
  );
}
