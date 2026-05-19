'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Video, FileText, GraduationCap, Globe, Clock, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { ref, get } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalMaterial {
  id: string;
  title: string;
  url: string;
  type: string;
  dateAdded: string;
}

export default function MaterialEstudiantePage() {
  const { userRole, username } = useAuth();
  const router = useRouter();
  const [personalMaterials, setPersonalMaterials] = useState<PersonalMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userRole !== 'student') {
        router.push('/aula-virtual');
        return;
    }

    if (username) {
      const fetchMaterials = async () => {
        try {
          const studentKey = username.replace(/[.#$\[\]]/g, "_");
          const snapshot = await get(ref(rtdb, `users/${studentKey}/personalMaterials`));
          if (snapshot.exists()) {
            const data = snapshot.val();
            const loaded = Object.keys(data).map(k => ({
                ...data[k],
                id: data[k].id || k
            }));
            setPersonalMaterials(loaded);
          }
        } catch (err) {
          console.error("Error fetching materials:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchMaterials();
    }
  }, [userRole, username, router]);

  // Redirect if not a student
  if (userRole !== 'student') {
    return null; // Render nothing while redirecting
  }

  const viewOptions = [
    {
      title: 'Ver Materiales',
      icon: Download,
      href: '/aula-virtual/material-estudiante/materiales',
    },
    {
      title: 'Ver Videos',
      icon: Video,
      href: '/aula-virtual/material-estudiante/videos',
    },
    {
      title: 'Ver PDF',
      icon: FileText,
      href: '/aula-virtual/material-estudiante/pdfs',
    },
    {
      title: 'Ver Lección',
      icon: GraduationCap,
      href: '/aula-virtual/material-estudiante/lecciones',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/aula-virtual">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold text-primary">
            Material de Estudio
          </h1>
        </div>
      </header>
      <main className="container py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-12">
            {/* Global Categories */}
            <Card className="bg-secondary/20 border-primary/10 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-white/5">
                    <CardTitle className="text-2xl font-headline font-bold">Contenido del Curso</CardTitle>
                    <CardDescription>
                        Selecciona el tipo de material que deseas visualizar.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {viewOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <Link href={option.href} key={option.title}>
                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <Card className="bg-secondary/30 hover:bg-secondary/60 hover:border-primary/50 transition-all cursor-pointer h-full border-white/5 rounded-2xl">
                                            <CardContent className="p-6 flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                                    <Icon className="w-6 h-6 text-primary" />
                                                </div>
                                                <span className="text-lg font-semibold">{option.title}</span>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Personal Materials Section */}
            <AnimatePresence>
                {personalMaterials.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/20 rounded-lg">
                                <FileText className="w-6 h-6 text-accent" />
                            </div>
                            <h2 className="text-2xl font-headline font-bold">Material Personalizado</h2>
                        </div>
                        <div className="grid gap-4">
                            {personalMaterials.map((mat) => (
                                <motion.div 
                                    key={mat.id}
                                    whileHover={{ x: 10 }}
                                    className="p-5 bg-secondary/10 border border-white/5 rounded-3xl group flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4 truncate">
                                        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent group-hover:rotate-6 transition-all">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="truncate">
                                            <div className="flex items-center gap-2">
                                                <p className="text-lg font-bold truncate">{mat.title}</p>
                                                <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{mat.type}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                <Clock className="w-3 h-3" />
                                                <span>Asignado el {new Date(mat.dateAdded).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="rounded-xl border-accent/20 hover:bg-accent/10 hover:text-accent font-bold" asChild>
                                        <a href={mat.url} target="_blank" rel="noopener noreferrer">
                                            <Download className="w-4 h-4 mr-2" /> Descargar
                                        </a>
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
