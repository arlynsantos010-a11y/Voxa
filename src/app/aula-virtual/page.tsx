"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, Book, MessageSquare, ClipboardCheck, LayoutGrid, ChevronRight, Globe, Languages, Sparkles, PlaySquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { StreakCounter } from '@/components/dashboard/streak-counter';

export default function AulaVirtualPage() {
  const { userRole, enrolledLanguages, selectedLanguage, setSelectedLanguage } = useAuth();
  const router = useRouter();

  const handleMaterialesClick = () => {
    if (userRole === 'professor') {
      router.push('/aula-virtual/material');
    } else {
      router.push('/aula-virtual/material-estudiante');
    }
  };

  const sections = [
    {
      title: 'Tutor IA Premium',
      desc: 'Practica conversación y recibe correcciones en tiempo real.',
      icon: Sparkles,
      href: '/aula-virtual/ai-tutor',
      color: 'bg-primary/20 text-primary border-primary/30',
      badge: 'NUEVO'
    },
    {
      title: 'Reels Educativos',
      desc: 'Explora videos cortos rápidos, tips y novedades del curso.',
      icon: PlaySquare,
      href: '/aula-virtual/reels',
      color: 'bg-pink-500/20 text-pink-500 border-pink-500/30',
      badge: 'POPULAR'
    },
    {
      title: 'Clases en Vivo',
      desc: 'Accede a tus sesiones programadas y grabaciones anteriores.',
      icon: Video,
      href: '/aula-virtual/clases-en-vivo',
      color: 'bg-blue-500/20 text-blue-500',
    },
    {
      title: 'Materiales',
      desc: 'Consulta guías, PDFs y recursos multimedia del curso.',
      icon: Book,
      onClick: handleMaterialesClick,
      color: 'bg-purple-500/20 text-purple-500',
    },
    {
      title: 'Tareas',
      desc: 'Entrega tus trabajos y revisa tus calificaciones actuales.',
      icon: ClipboardCheck,
      href: '/aula-virtual/tareas',
      color: 'bg-orange-500/20 text-orange-500',
    },
  ];

  if (userRole === 'student' && enrolledLanguages.length > 1 && !selectedLanguage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Languages className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-headline font-bold mb-4">Selecciona tu <span className="text-primary">Curso</span></h2>
          <p className="text-muted-foreground">Estás inscrito en varios idiomas. ¿En cuál deseas trabajar hoy?</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {enrolledLanguages.map((lang) => (
            <Card 
              key={lang} 
              className="glass-card p-8 cursor-pointer hover:border-primary transition-all group"
              onClick={() => setSelectedLanguage(lang)}
            >
              <div className="flex flex-col items-center gap-4">
                <Globe className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-black">{lang}</span>
                <Button className="mt-4 rounded-xl">Entrar al Aula</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground relative">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex flex-1 items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary">Aula Virtual</h1>
            {selectedLanguage && (
              <div className="ml-4 flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Globe className="w-3 h-3 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-tighter">{selectedLanguage}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <StreakCounter />
            {enrolledLanguages.length > 1 && (
              <Button variant="ghost" size="sm" className="rounded-full text-xs" onClick={() => setSelectedLanguage(null)}>
                Cambiar Idioma
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto mb-16 text-center lg:text-left">
          <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            Espacio de <span className="text-primary">Aprendizaje {selectedLanguage || ''}</span>
          </motion.h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {selectedLanguage 
              ? `Gestiona tus recursos y practica con IA específica para el curso de ${selectedLanguage}.`
              : 'Selecciona una herramienta para continuar con tu formación académica.'
            }
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            const content = (
              <div className="glass-card group relative p-8 rounded-3xl h-full border-white/5 hover:border-primary/40 transition-all duration-300 cursor-pointer overflow-hidden">
                <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${section.color.split(' ')[0]}`} />
                {section.badge && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                    {section.badge}
                  </div>
                )}
                <div className="flex flex-col h-full">
                  <div className={`w-14 h-14 rounded-2xl ${section.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{section.title}</h3>
                  <p className="text-muted-foreground/80 leading-relaxed mb-8 flex-grow">{section.desc}</p>
                  <div className="flex items-center text-primary font-bold group-hover:gap-2 transition-all">
                    <span>Abrir Sección</span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
              </div>
            );

            return (
              <motion.div key={section.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -10, scale: 1.02 }} className="h-full">
                {section.href ? (
                  <Link href={section.href} className="block h-full">{content}</Link>
                ) : section.onClick ? (
                  <div onClick={section.onClick} className="h-full">{content}</div>
                ) : (
                  content
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
