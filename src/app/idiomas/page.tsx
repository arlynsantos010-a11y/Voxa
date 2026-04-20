"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Check, Globe, Sparkles, Languages } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const availableLanguages = [
  { id: 'en', name: 'Inglés', flag: '🇬🇧', level: 'Todos los niveles', popularity: 'Alta', color: 'bg-blue-500/20 text-blue-500' },
  { id: 'fr', name: 'Francés', flag: '🇫🇷', level: 'A1 - C1', popularity: 'Media', color: 'bg-indigo-500/20 text-indigo-500' },
  { id: 'de', name: 'Alemán', flag: '🇩🇪', level: 'A1 - B2', popularity: 'Alta', color: 'bg-yellow-500/20 text-yellow-500' },
  { id: 'it', name: 'Italiano', flag: '🇮🇹', level: 'A1 - B1', popularity: 'Media', color: 'bg-green-500/20 text-green-500' },
  { id: 'pt', name: 'Portugués', flag: '🇧🇷', level: 'A1 - C2', popularity: 'Creciente', color: 'bg-emerald-500/20 text-emerald-500' },
  { id: 'jp', name: 'Japonés', flag: '🇯🇵', level: 'N5 - N1', popularity: 'Alta', color: 'bg-red-500/20 text-red-500' },
];

export default function ExplorarIdiomasPage() {
  const { toast } = useToast();
  const [enrolled, setEnrolled] = useState<string[]>(['en']);

  const handleEnroll = (langName: string, langId: string) => {
    if (enrolled.includes(langId)) return;
    setEnrolled([...enrolled, langId]);
    toast({
      title: "¡Idioma Añadido!",
      description: `Has empezado tu viaje de aprendizaje en ${langName}.`,
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full" asChild>
            <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <Languages className="w-6 h-6 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary">Catálogo de Idiomas</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-5xl font-black mb-6"
          >
            Expande tus <span className="text-primary text-glow">Horizontes</span>
          </motion.h2>
          <p className="text-lg text-muted-foreground">Selecciona el idioma que deseas dominar y empieza a aprender hoy mismo con los mejores recursos.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {availableLanguages.map((lang, idx) => (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="glass-card border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-primary/50 transition-all duration-500 h-full flex flex-col">
                <div className={`h-2 w-full ${lang.color.split(' ')[0]}`} />
                <CardContent className="p-8 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-6xl">{lang.flag}</span>
                    <Badge variant="outline" className={`${lang.color} border-none font-bold uppercase tracking-widest text-[10px]`}>
                      {lang.popularity}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-2">{lang.name}</h3>
                  <p className="text-sm text-muted-foreground mb-8">{lang.level}</p>
                  
                  <div className="mt-auto">
                    <Button 
                      className={`w-full h-14 rounded-2xl font-bold transition-all ${
                        enrolled.includes(lang.id) 
                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                        : 'bg-primary text-primary-foreground shadow-xl shadow-primary/20'
                      }`}
                      onClick={() => handleEnroll(lang.name, lang.id)}
                    >
                      {enrolled.includes(lang.id) ? (
                        <>
                          <Check className="mr-2 h-5 w-5" /> En curso
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-5 w-5" /> Añadir Idioma
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
