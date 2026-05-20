'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Video, Calendar as CalendarIcon, Link as LinkIcon, Trash2, Clock, XCircle, Info, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar"
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get, push, set, remove } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface Clase {
  id: string | number;
  title: string;
  date: Date;
  link: string;
  target?: string;
}

export default function ClasesEnVivoPage() {
  const { toast } = useToast();
  const { userRole, username } = useAuth();
  const [globalClases, setGlobalClases] = useState<Clase[]>([]);
  const [personalClases, setPersonalClases] = useState<Clase[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [newClaseTitle, setNewClaseTitle] = useState("");
  const [newClaseLink, setNewClaseLink] = useState("");
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([new Date()]);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [targetStudent, setTargetStudent] = useState<string>("all");
  
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
    
    const fetchData = async () => {
        const globalRef = ref(rtdb, 'classes/global');
        const globalSnapshot = await get(globalRef);
        if (globalSnapshot.exists()) {
          const data = globalSnapshot.val();
          const loaded: Clase[] = Object.keys(data).map(k => ({
            ...data[k],
            id: k,
            date: new Date(data[k].date)
          }));
          setGlobalClases(loaded);
        }

        if (userRole === 'student' && username) {
            const studentKey = username.replace(/[.#$\[\]]/g, "_");
            const personalSnapshot = await get(ref(rtdb, `users/${studentKey}/personalLinks`));
            if (personalSnapshot.exists()) {
              const data = personalSnapshot.val();
              const loaded: Clase[] = Object.keys(data).map(k => ({
                id: k,
                title: data[k].title,
                date: new Date(data[k].dateAdded),
                link: data[k].url
              }));
              setPersonalClases(loaded);
            }
        }

        if (userRole === 'professor' || userRole === 'admin') {
            const usersSnapshot = await get(ref(rtdb, 'users'));
            if (usersSnapshot.exists()) {
                const data = usersSnapshot.val();
                setStudents(Object.values(data).filter((u: any) => u.role === 'student'));
                
                const assignments: any[] = [];
                Object.values(data).forEach((u: any) => {
                    if (u.personalLinks) {
                        Object.entries(u.personalLinks).forEach(([id, link]: [string, any]) => {
                            assignments.push({
                                ...link,
                                id,
                                date: new Date(link.dateAdded),
                                target: u.username,
                                link: link.url
                            });
                        });
                    }
                });
                setStudentAssignments(assignments);
            }
        }
    };

    fetchData();
  }, [userRole, username]);

  const allDisplayedClases = useMemo(() => {
    const combined = userRole === 'student' 
      ? [...globalClases, ...personalClases]
      : [...globalClases, ...studentAssignments];
    return combined.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [globalClases, personalClases, studentAssignments, userRole]);

  const filteredClases = useMemo(() => {
    if (!filterDate) return allDisplayedClases;
    return allDisplayedClases.filter(clase => isSameDay(clase.date, filterDate));
  }, [allDisplayedClases, filterDate]);

  const classDates = useMemo(() => {
    return allDisplayedClases.map(c => c.date);
  }, [allDisplayedClases]);

  const handleCreate = async () => {
    if (!newClaseTitle || !newClaseLink || !selectedDates || selectedDates.length === 0 || !selectedTime) {
      toast({
          variant: "destructive",
          title: "Campos incompletos",
          description: "Por favor, completa todos los campos y selecciona al menos una fecha.",
      });
      return;
    }
    
    try {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const creationPromises = selectedDates.map(async (date) => {
            const finalDate = new Date(date);
            finalDate.setHours(hours, minutes, 0, 0);

            if (targetStudent === "all") {
                const newGlobalRef = push(ref(rtdb, 'classes/global'));
                const newClaseData = {
                    title: newClaseTitle,
                    date: finalDate.toISOString(),
                    link: newClaseLink
                };
                await set(newGlobalRef, newClaseData);
                return { ...newClaseData, id: newGlobalRef.key as string, date: finalDate, isGlobal: true };
            } else {
                const studentKey = targetStudent.replace(/[.#$\[\]]/g, "_");
                const personalRef = push(ref(rtdb, `users/${studentKey}/personalLinks`));
                const newClaseData = {
                    title: newClaseTitle,
                    url: newClaseLink,
                    dateAdded: finalDate.toISOString()
                };
                await set(personalRef, newClaseData);
                return { 
                    ...newClaseData, 
                    id: personalRef.key as string, 
                    date: finalDate, 
                    target: targetStudent, 
                    link: newClaseLink,
                    isGlobal: false
                };
            }
        });

        const results = await Promise.all(creationPromises);
        
        // Update local state
        const globals = results.filter(r => r.isGlobal).map(({isGlobal, ...rest}) => rest as Clase);
        const personals = results.filter(r => !r.isGlobal);
        
        if (globals.length > 0) setGlobalClases(prev => [...prev, ...globals]);
        if (personals.length > 0) setStudentAssignments(prev => [...prev, ...personals]);

        toast({
            title: "Clases Agendadas",
            description: `Se han creado ${selectedDates.length} sesiones para las ${selectedTime}.`,
        });
        
        setNewClaseTitle("");
        setNewClaseLink("");
        setSelectedDates([new Date()]);
        setSelectedTime("10:00");
        setTargetStudent("all");
        setCreateModalOpen(false);
    } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron crear las clases." });
    }
  }

  const handleDelete = async (clase: any) => {
    try {
        if (clase.target) {
            const studentKey = clase.target.replace(/[.#$\[\]]/g, "_");
            await remove(ref(rtdb, `users/${studentKey}/personalLinks/${clase.id}`));
            setStudentAssignments(prev => prev.filter(c => c.id !== clase.id));
        } else {
            await remove(ref(rtdb, `classes/global/${clase.id}`));
            setGlobalClases(prev => prev.filter(c => c.id !== clase.id));
        }
        toast({ title: "Clase Eliminada" });
    } catch (err) {
        toast({ variant: "destructive", title: "Error" });
    }
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground relative pb-20">
        <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-background/80 backdrop-blur-sm">
          <div className="container flex h-16 items-center space-x-4 px-4">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/aula-virtual">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold text-primary flex items-center gap-2">
              <Video className="w-6 h-6" /> Clases en Vivo
            </h1>
          </div>
        </header>

        <main className="container mx-auto py-8 lg:py-12 px-4 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="glass-card border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/5">
                      <CardHeader className="bg-primary/5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 p-8">
                          <div className="space-y-1">
                              <CardTitle className="text-3xl font-headline font-bold text-foreground">
                                {filterDate ? (
                                    <span className="flex items-center gap-3">
                                        <CalendarDays className="w-8 h-8 text-primary" />
                                        {format(filterDate, "d 'de' MMMM", { locale: es })}
                                    </span>
                                ) : "Próximas Sesiones"}
                              </CardTitle>
                              <CardDescription className="text-base">
                                  {userRole === 'professor' 
                                      ? "Panel de administración de sesiones virtuales."
                                      : "Tus próximas citas académicas en un solo lugar."
                                  }
                              </CardDescription>
                          </div>
                          {filterDate && (
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="rounded-full font-bold px-6 py-5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all"
                                onClick={() => setFilterDate(undefined)}
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Mostrar Todo
                              </Button>
                          )}
                      </CardHeader>
                      <CardContent className="p-8 space-y-6">
                      <AnimatePresence mode="popLayout">
                        {filteredClases.length > 0 ? (
                            filteredClases.map((clase) => (
                            <motion.div 
                              key={clase.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              whileHover={{ scale: 1.01, backgroundColor: "rgba(var(--primary-rgb), 0.03)" }}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-secondary/5 border border-white/5 rounded-[2rem] group transition-all gap-6"
                            >
                                <div className="flex items-center gap-6 truncate w-full">
                                    <div className="w-16 h-16 flex-shrink-0 rounded-[1.25rem] bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary shadow-inner">
                                      <Video className="w-8 h-8 group-hover:animate-pulse" />
                                    </div>
                                    <div className="truncate flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                          <p className="text-xl font-bold truncate text-foreground/90">{clase.title}</p>
                                          {clase.target && (
                                              <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-black uppercase tracking-wider backdrop-blur-md">
                                                {clase.target}
                                              </span>
                                          )}
                                      </div>
                                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-medium">
                                          <CalendarIcon className="w-4 h-4 text-primary/60" />
                                          {mounted ? format(clase.date, "EEEE d 'de' MMMM", { locale: es }) : "..."}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-primary font-bold">
                                          <Clock className="w-4 h-4" />
                                          {mounted ? format(clase.date, "HH:mm") : "..."}
                                        </div>
                                      </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-6 sm:pt-0">
                                    <Button variant="default" className="rounded-2xl h-12 px-8 font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex-1 sm:flex-none uppercase tracking-widest text-xs" asChild>
                                        <a href={clase.link} target="_blank" rel="noopener noreferrer">
                                            Unirse Ahora
                                        </a>
                                    </Button>
                                    {userRole === 'professor' && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-2xl h-12 w-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
                                            onClick={() => handleDelete(clase)}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                            ))
                        ) : (
                            <motion.div 
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }}
                              className="text-center py-24 text-muted-foreground bg-secondary/5 rounded-[2rem] border border-dashed border-white/10"
                            >
                              <div className="bg-primary/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CalendarIcon className="w-10 h-10 text-primary/20" />
                              </div>
                              <p className="text-xl font-bold mb-2">No hay clases programadas</p>
                              <p className="max-w-xs mx-auto text-sm opacity-60">
                                {filterDate ? "No se encontraron sesiones para la fecha seleccionada." : "Mantente al tanto de las actualizaciones de tus profesores."}
                              </p>
                              {filterDate && (
                                <Button variant="link" onClick={() => setFilterDate(undefined)} className="mt-6 text-primary font-bold hover:no-underline">
                                  Ver calendario completo
                                </Button>
                              )}
                            </motion.div>
                        )}
                      </AnimatePresence>
                      </CardContent>
                  </Card>
                </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block space-y-6"
            >
                <Card className="glass-card border-white/10 rounded-[2.5rem] p-8 sticky top-24 shadow-2xl shadow-primary/5">
                   <CardHeader className="p-0 mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
                                <CalendarDays className="w-6 h-6" /> Calendario
                            </CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                          Días destacados indican sesiones programadas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="bg-secondary/5 rounded-3xl p-4 border border-white/5">
                            <Calendar
                                mode="single"
                                selected={filterDate}
                                onSelect={(day) => setFilterDate(day === filterDate ? undefined : day)}
                                locale={es}
                                className="w-full flex justify-center"
                                modifiers={{ hasClass: classDates }}
                                modifiersClassNames={{
                                    hasClass: "text-primary font-black underline decoration-primary/50 decoration-4 underline-offset-4 bg-primary/5"
                                }}
                                classNames={{
                                    months: "w-full",
                                    month: "w-full space-y-6",
                                    caption: "flex justify-center pt-1 relative items-center mb-4",
                                    caption_label: "text-lg font-bold text-foreground/80",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex w-full mb-2 justify-between",
                                    head_cell: "text-muted-foreground rounded-md w-10 font-bold text-xs uppercase tracking-tighter",
                                    row: "flex w-full mt-2 justify-between",
                                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-10 h-10",
                                    day: "h-10 w-10 p-0 font-medium aria-selected:opacity-100 hover:bg-primary/10 rounded-xl transition-all flex items-center justify-center m-auto",
                                    day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/30",
                                    day_today: "bg-secondary text-foreground font-black ring-2 ring-primary/20",
                                    day_outside: "text-muted-foreground opacity-30",
                                    day_disabled: "text-muted-foreground opacity-30",
                                    day_hidden: "invisible",
                                }}
                            />
                        </div>
                         
                         <div className="mt-8 p-6 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Info className="w-16 h-16 text-primary" />
                            </div>
                            <div className="relative z-10">
                                <p className="font-bold text-primary mb-2 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Guía Rápida
                                </p>
                                <p className="text-sm text-muted-foreground/90 leading-relaxed">
                                    Haz clic en un día **subrayado** para filtrar las clases de esa fecha. Los días con fondo azul son hoy.
                                </p>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </motion.div>
          </div>
        </main>
        
        {(userRole === 'professor' || userRole === 'admin') && (
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="fixed bottom-10 right-10 z-50"
            >
                <Button 
                    size="lg" 
                    className="rounded-[2rem] shadow-2xl shadow-primary/60 h-20 w-20 bg-primary hover:bg-primary/90 transition-all border-4 border-background" 
                    onClick={() => setCreateModalOpen(true)}
                >
                    <Plus className="h-10 w-10 text-primary-foreground" />
                </Button>
            </motion.div>
        )}
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[650px] glass-card border-white/10 rounded-[3rem] p-0 overflow-hidden shadow-[0_0_100px_-20px_rgba(var(--primary-rgb),0.2)]">
          <div className="bg-primary/5 p-10 border-b border-white/5">
            <DialogHeader className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-2">
                <CalendarDays className="w-10 h-10" />
              </div>
              <DialogTitle className="text-primary font-headline text-4xl font-bold tracking-tight">Agendar Clases</DialogTitle>
              <DialogDescription className="text-muted-foreground text-lg">
                Programa una o varias sesiones a la vez para tus alumnos.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Destinatario</Label>
                <Select value={targetStudent} onValueChange={setTargetStudent}>
                  <SelectTrigger className="bg-secondary/10 border-white/10 h-14 rounded-2xl px-6 text-base focus:ring-primary/30">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10 rounded-2xl">
                    <SelectItem value="all" className="py-3 rounded-xl">Todos los Alumnos (Global)</SelectItem>
                    {students.map(s => (
                      <SelectItem key={s.username} value={s.username} className="py-3 rounded-xl">
                        {s.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Hora de las Sesiones</Label>
                <div className="relative">
                  <Input 
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="bg-secondary/10 border-white/10 h-14 rounded-2xl px-6 text-xl font-bold appearance-none focus:ring-primary/30"
                  />
                  <Clock className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary/40 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Título / Nombre de la Clase</Label>
              <Input 
                placeholder="Ej: Masterclass de Vocabulario Avanzado"
                value={newClaseTitle}
                onChange={(e) => setNewClaseTitle(e.target.value)}
                className="bg-secondary/10 border-white/10 h-14 rounded-2xl px-6 text-base focus:ring-primary/30"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Link de la Reunión (Meet/Zoom)</Label>
              <Input 
                placeholder="https://meet.google.com/..."
                value={newClaseLink}
                onChange={(e) => setNewClaseLink(e.target.value)}
                className="bg-secondary/10 border-white/10 h-14 rounded-2xl px-6 text-base focus:ring-primary/30"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between ml-1">
                    <Label className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">Selecciona las Fechas</Label>
                    <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                        {selectedDates?.length || 0} fechas seleccionadas
                    </span>
                </div>
                <div className="p-8 bg-secondary/5 border border-white/10 rounded-[2.5rem] flex justify-center">
                    <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={setSelectedDates}
                        locale={es}
                        initialFocus
                        className="w-full"
                        classNames={{
                            months: "w-full",
                            month: "w-full space-y-6",
                            caption: "flex justify-center pt-1 relative items-center mb-6",
                            caption_label: "text-xl font-bold text-foreground",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-10 w-10 bg-transparent p-0 opacity-50 hover:opacity-100 transition-all hover:bg-primary/10 rounded-xl",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse",
                            head_row: "flex w-full mb-3 justify-between",
                            head_cell: "text-muted-foreground w-11 font-bold text-sm uppercase tracking-wider",
                            row: "flex w-full mt-3 justify-between",
                            cell: "relative p-0 text-center text-base focus-within:relative focus-within:z-20 w-11 h-11",
                            day: "h-11 w-11 p-0 font-medium aria-selected:opacity-100 hover:bg-primary/20 rounded-2xl transition-all flex items-center justify-center m-auto text-foreground/70",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90 rounded-2xl font-black scale-110 shadow-xl shadow-primary/40",
                            day_today: "bg-secondary text-foreground font-black ring-2 ring-primary/20",
                            day_outside: "text-muted-foreground opacity-20",
                            day_disabled: "text-muted-foreground opacity-20",
                        }}
                    />
                </div>
            </div>
          </div>

          <div className="p-10 bg-secondary/5 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)} className="rounded-2xl h-14 px-8 font-bold text-muted-foreground hover:text-foreground w-full sm:w-auto">
                Cancelar
            </Button>
            <Button 
                onClick={handleCreate} 
                disabled={!newClaseTitle || !newClaseLink || !selectedDates || selectedDates.length === 0} 
                className="rounded-2xl h-14 px-12 font-black shadow-2xl shadow-primary/30 flex-1 w-full sm:w-auto uppercase tracking-widest text-sm"
            >
                Confirmar y Crear {selectedDates?.length || 0} Sesiones
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
