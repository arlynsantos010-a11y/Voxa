'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Video, Calendar as CalendarIcon, Link as LinkIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar"
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Clase {
  id: number;
  title: string;
  date: Date;
  link: string;
}

const initialClases: Clase[] = [
    { id: 1, title: "Clase de Repaso: Q&A", date: new Date(2025, 2, 15), link: "https://meet.google.com/xyz-abc-def" },
    { id: 2, title: "Presentación Proyecto Final", date: new Date(2025, 2, 22), link: "https://meet.google.com/ghi-jkl-mno" },
]

export default function ClasesEnVivoPage() {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const [clases, setClases] = useState<Clase[]>(initialClases);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [newClaseTitle, setNewClaseTitle] = useState("");
  const [newClaseLink, setNewClaseLink] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCreate = () => {
    if (!newClaseTitle || !newClaseLink || !selectedDate) {
      toast({
          variant: "destructive",
          title: "Campos incompletos",
          description: "Por favor, completa todos los campos para agendar la clase.",
      });
      return;
    }
    
    const newClase: Clase = {
      id: clases.length + 1,
      title: newClaseTitle,
      date: selectedDate,
      link: newClaseLink,
    };
    setClases(prevClases => [...prevClases, newClase].sort((a,b) => a.date.getTime() - b.date.getTime()));
    toast({
        title: "Clase Agendada",
        description: `La clase "${newClaseTitle}" ha sido creada.`,
    });
    setNewClaseTitle("");
    setNewClaseLink("");
    setSelectedDate(new Date());
    setCreateModalOpen(false);
  }

  const handleDelete = (claseId: number) => {
    setClases(prevClases => prevClases.filter(c => c.id !== claseId));
    toast({
        title: "Clase Eliminada",
        description: `La clase ha sido eliminada correctamente.`,
    });
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground relative">
        <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-background/80 backdrop-blur-sm">
          <div className="container flex h-16 items-center space-x-4 px-4">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/aula-virtual">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold text-primary">
              Clases en Vivo
            </h1>
          </div>
        </header>

        <main className="container mx-auto py-8 sm:py-12 px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-card border-white/10 rounded-[2.5rem] overflow-hidden">
                      <CardHeader className="bg-primary/5 border-b border-white/5">
                          <CardTitle className="text-2xl font-headline font-bold">Próximas Sesiones</CardTitle>
                          <CardDescription>
                              {userRole === 'professor' 
                                  ? "Administra el calendario de sesiones virtuales."
                                  : "Únete a las clases programadas con un solo clic."
                              }
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                      <AnimatePresence>
                        {clases.length > 0 ? (
                            clases.map((clase) => (
                            <motion.div 
                              key={clase.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              whileHover={{ x: 10, backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
                              className="flex items-center justify-between p-5 bg-secondary/10 border border-white/5 rounded-3xl group transition-all"
                            >
                                <div className="flex items-center gap-4 truncate">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                      <Video className="w-6 h-6" />
                                    </div>
                                    <div className="truncate">
                                    <p className="text-lg font-bold truncate">{clase.title}</p>
                                    <p className="text-xs text-muted-foreground font-medium">
                                      {mounted ? `Fecha: ${format(clase.date, "PPP")}` : "Cargando fecha..."}
                                    </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="rounded-xl border-primary/20 hover:bg-primary/10" asChild>
                                        <a href={clase.link} target="_blank" rel="noopener noreferrer">
                                            <LinkIcon className="w-4 h-4 mr-2" /> Unirse
                                        </a>
                                    </Button>
                                    {userRole === 'professor' && (
                                        <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(clase.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-20 text-muted-foreground">
                              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                              <p className="font-bold">No hay clases agendadas.</p>
                            </div>
                        )}
                      </AnimatePresence>
                      </CardContent>
                  </Card>
                </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block"
            >
                <Card className="glass-card border-white/10 rounded-[2.5rem] p-6">
                   <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-xl font-headline font-bold flex items-center gap-2 text-primary">
                          <CalendarIcon className="w-5 h-5" /> Calendario de Eventos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-2xl border border-white/5 p-4"
                            classNames={{
                                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-xl",
                                day_today: "bg-accent/20 text-accent font-bold",
                                day: "rounded-xl transition-colors hover:bg-secondary/20"
                            }}
                         />
                    </CardContent>
                </Card>
            </motion.div>
          </div>
        </main>
        
        {userRole === 'professor' && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-8 right-8 z-50"
            >
                <Button size="lg" className="rounded-full shadow-2xl shadow-primary/40 h-16 w-16" onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-8 w-8" />
                </Button>
            </motion.div>
        )}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[480px] glass-card border-white/10 rounded-[2.5rem]">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline text-3xl font-bold">Agendar Clase</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define los detalles de la próxima sesión virtual.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre de la Clase</label>
              <Input 
                placeholder="Ej: Clase de Repaso Semanal"
                value={newClaseTitle}
                onChange={(e) => setNewClaseTitle(e.target.value)}
                className="bg-secondary/20 border-white/5 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Enlace de la Reunión</label>
              <Input 
                placeholder="https://meet.google.com/..."
                value={newClaseLink}
                onChange={(e) => setNewClaseLink(e.target.value)}
                className="bg-secondary/20 border-white/5 h-12 rounded-xl"
              />
            </div>
            <div className="p-2 bg-secondary/20 border border-white/5 rounded-3xl flex justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
            <Button onClick={handleCreate} disabled={!newClaseTitle || !newClaseLink || !selectedDate} className="rounded-xl font-bold shadow-lg shadow-primary/20 px-8">
                Confirmar Clase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
