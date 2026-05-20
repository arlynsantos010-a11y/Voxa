'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Video, Calendar as CalendarIcon, Link as LinkIcon, Trash2, Clock, XCircle, Info, CalendarDays, CheckCircle2, History } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar"
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { format, isSameDay, startOfToday } from 'date-fns';
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

interface SelectedPair {
    date: Date;
    time: string;
}

const TIME_SLOTS = [
    "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30",
    "20:00"
];

export default function ClasesEnVivoPage() {
  const { toast } = useToast();
  const { userRole, username } = useAuth();
  const [globalClases, setGlobalClases] = useState<Clase[]>([]);
  const [personalClases, setPersonalClases] = useState<Clase[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // New States for UI Overhaul
  const [newClaseTitle, setNewClaseTitle] = useState("");
  const [newClaseLink, setNewClaseLink] = useState("");
  const [currentSelectedDates, setCurrentSelectedDates] = useState<Date[] | undefined>([]);
  const [selectedPairs, setSelectedPairs] = useState<SelectedPair[]>([]);
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

  const toggleTimeSlot = (time: string) => {
    if (!currentSelectedDates || currentSelectedDates.length === 0) {
        toast({
            variant: "destructive",
            title: "Selecciona al menos un día",
            description: "Elige uno o varios días en el calendario para asignarles este horario.",
        });
        return;
    }
    
    setSelectedPairs(prev => {
        let next = [...prev];
        currentSelectedDates.forEach(date => {
            const exists = next.find(p => isSameDay(p.date, date) && p.time === time);
            if (exists) {
                next = next.filter(p => !(isSameDay(p.date, date) && p.time === time));
            } else {
                next.push({ date: new Date(date), time });
            }
        });
        return next;
    });
  };

  const removePair = (index: number) => {
    setSelectedPairs(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!newClaseTitle || !newClaseLink || selectedPairs.length === 0) {
      toast({
          variant: "destructive",
          title: "Campos incompletos",
          description: "Por favor, completa el título y link, y selecciona al menos una fecha y hora.",
      });
      return;
    }
    
    try {
        const creationPromises = selectedPairs.map(async (pair) => {
            const [hours, minutes] = pair.time.split(':').map(Number);
            const finalDate = new Date(pair.date);
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
        
        const globals = results.filter(r => r.isGlobal).map(({isGlobal, ...rest}) => rest as Clase);
        const personals = results.filter(r => !r.isGlobal);
        
        if (globals.length > 0) setGlobalClases(prev => [...prev, ...globals]);
        if (personals.length > 0) setStudentAssignments(prev => [...prev, ...personals]);

        toast({
            title: "Clases Agendadas",
            description: `Se han creado ${selectedPairs.length} sesiones correctamente.`,
        });
        
        setNewClaseTitle("");
        setNewClaseLink("");
        setSelectedPairs([]);
        setTargetStudent("all");
        setCreateModalOpen(false);
    } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron crear las sesiones." });
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
                      <CardHeader className="bg-primary/5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 text-center md:text-left">
                          <div className="space-y-1">
                              <CardTitle className="text-3xl font-headline font-bold text-foreground">
                                {filterDate ? (
                                    <span className="flex items-center gap-3 justify-center md:justify-start">
                                        <CalendarDays className="w-8 h-8 text-primary" />
                                        {format(filterDate, "d 'de' MMMM", { locale: es })}
                                    </span>
                                ) : "Próximas Sesiones"}
                              </CardTitle>
                              <CardDescription className="text-base">
                                  {userRole === 'professor' 
                                      ? "Administra el calendario académico de tus alumnos."
                                      : "Tus próximas citas académicas en un solo lugar."
                                  }
                              </CardDescription>
                          </div>
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
                              whileHover={{ scale: 1.01 }}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-secondary/5 border border-white/5 rounded-[2rem] group transition-all gap-6"
                            >
                                <div className="flex items-center gap-6 truncate w-full">
                                    <div className="w-16 h-16 flex-shrink-0 rounded-[1.25rem] bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary shadow-inner">
                                      <Video className="w-8 h-8" />
                                    </div>
                                    <div className="truncate flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                          <p className="text-xl font-bold truncate text-foreground/90">{clase.title}</p>
                                          {clase.target && (
                                              <span className="text-[10px] bg-primary/20 text-primary px-3 py-1 rounded-full font-black uppercase tracking-wider">
                                                {clase.target}
                                              </span>
                                          )}
                                      </div>
                                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-medium font-headline">
                                          <CalendarIcon className="w-4 h-4 text-primary/60" />
                                          {mounted ? format(clase.date, "EEEE d 'de' MMMM", { locale: es }) : "..."}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                                          <Clock className="w-4 h-4" />
                                          {mounted ? format(clase.date, "HH:mm") : "..."}
                                        </div>
                                      </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                    <Button variant="default" className="rounded-2xl h-12 px-8 font-bold shadow-xl shadow-primary/20 flex-1 sm:flex-none uppercase tracking-widest text-xs" asChild>
                                        <a href={clase.link} target="_blank" rel="noopener noreferrer">
                                            Unirse
                                        </a>
                                    </Button>
                                    {userRole === 'professor' && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="rounded-2xl h-12 w-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                                            onClick={() => handleDelete(clase)}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-24 text-muted-foreground bg-secondary/5 rounded-[2rem] border border-dashed border-white/10">
                              <CalendarIcon className="w-16 h-16 mx-auto mb-6 opacity-10" />
                              <p className="text-xl font-bold mb-2">No hay sesiones programadas</p>
                              {filterDate && (
                                <Button variant="link" onClick={() => setFilterDate(undefined)} className="mt-4 text-primary font-bold">
                                  Ver todo el calendario
                                </Button>
                              )}
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
              className="hidden lg:block space-y-6"
            >
                <Card className="glass-card border-white/10 rounded-[2.5rem] p-8 sticky top-24 shadow-2xl shadow-primary/5">
                   <CardHeader className="p-0 mb-8">
                        <CardTitle className="text-2xl font-headline font-bold text-primary flex items-center gap-3">
                            <CalendarDays className="w-6 h-6" /> Calendario
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Días con clases programadas.
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
                                    hasClass: "text-primary font-black underline decoration-primary/50 decoration-4 underline-offset-4 bg-primary/5 rounded-xl"
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
                    </CardContent>
                </Card>
            </motion.div>
          </div>
        </main>
        
        {(userRole === 'professor' || userRole === 'admin') && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
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
        <DialogContent className="sm:max-w-[1100px] bg-slate-950/40 backdrop-blur-[50px] border-white/5 rounded-[4rem] p-0 overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
          <div className="bg-gradient-to-b from-primary/10 to-transparent p-10 border-b border-white/5 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl -z-10" />
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20 border border-primary/20 transform hover:scale-110 transition-transform">
                  <CalendarDays className="w-9 h-9" />
                </div>
                <div>
                    <DialogTitle className="text-foreground font-headline text-3xl font-black tracking-tight leading-none mb-2">Programar Sesión</DialogTitle>
                    <DialogDescription className="text-muted-foreground/60 text-base font-medium">Define los horarios y destinatarios para tus próximas clases.</DialogDescription>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCreateModalOpen(false)} className="rounded-full h-12 w-12 hover:bg-destructive/10 hover:text-destructive transition-all active:scale-90">
                <XCircle className="w-8 h-8" />
            </Button>
          </div>
          
          <div className="p-12 grid lg:grid-cols-[1.2fr_1fr] gap-16 max-h-[80vh] overflow-y-auto custom-scrollbar bg-slate-900/10">
            {/* Left Column: Calendar & Inputs */}
            <div className="space-y-10">
                <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 ml-2">Destinatario</Label>
                        <Select value={targetStudent} onValueChange={setTargetStudent}>
                          <SelectTrigger className="bg-white/5 border-white/5 h-16 rounded-[1.5rem] focus:ring-primary/40 text-sm font-bold shadow-inner hover:bg-white/10 transition-all border-l-4 border-l-primary/30">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900/95 backdrop-blur-[100px] border-white/10 rounded-[1.5rem] p-2 shadow-2xl">
                            <SelectItem value="all" className="rounded-xl py-3 hover:bg-primary/20">Todos los Alumnos</SelectItem>
                            {students.map(s => (
                              <SelectItem key={s.username} value={s.username} className="rounded-xl py-3">
                                {s.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 ml-2">Título de la Sesión</Label>
                      <Input 
                          placeholder="Ej: Masterclass de Vocabulario"
                          value={newClaseTitle}
                          onChange={(e) => setNewClaseTitle(e.target.value)}
                          className="bg-white/5 border-white/5 h-16 rounded-[1.5rem] focus:ring-primary/40 text-sm font-bold shadow-inner placeholder:text-muted-foreground/30 px-6 border-l-4 border-l-primary/30"
                      />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/80 ml-2">Link de Reunión</Label>
                    <Input 
                        placeholder="https://meet.google.com/..."
                        value={newClaseLink}
                        onChange={(e) => setNewClaseLink(e.target.value)}
                        className="bg-white/5 border-white/5 h-16 rounded-[1.5rem] focus:ring-primary/40 text-sm font-bold shadow-inner px-6 border-l-4 border-l-primary/30"
                    />
                </div>

                <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] shadow-[inset_0_0_40px_rgba(255,255,255,0.02)] relative overflow-hidden group/cal">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 opacity-20 group-hover/cal:opacity-40 transition-opacity" />
                    <Calendar
                        mode="multiple"
                        selected={currentSelectedDates}
                        onSelect={setCurrentSelectedDates}
                        locale={es}
                        initialFocus
                        className="w-full flex justify-center"
                        formatters={{
                          formatWeekdayName: (date) => format(date, "EEE", { locale: es }).replace('.', '').toUpperCase(),
                        }}
                        classNames={{
                            months: "w-full",
                            month: "w-full space-y-10",
                            caption: "flex justify-center pt-2 relative items-center mb-10",
                            caption_label: "text-2xl font-black text-foreground tracking-tighter uppercase",
                            nav: "space-x-2 flex items-center",
                            nav_button: "h-12 w-12 bg-white/5 p-0 opacity-70 hover:opacity-100 rounded-2xl transition-all hover:bg-primary/20 hover:text-primary border border-white/5 hover:border-primary/20 shadow-xl active:scale-90",
                            nav_button_previous: "absolute left-4",
                            nav_button_next: "absolute right-4",
                            table: "w-full border-collapse",
                            head_row: "flex w-full mb-8 justify-between px-4",
                            head_cell: "text-muted-foreground/40 w-14 font-black text-[11px] uppercase tracking-[0.4em] text-center",
                            row: "flex w-full mt-4 justify-between px-2",
                            cell: "relative p-0 text-center text-sm w-14 h-14 flex items-center justify-center transition-all",
                            day: "h-12 w-12 p-0 font-bold hover:bg-white/10 rounded-[1.25rem] transition-all flex items-center justify-center m-auto text-lg hover:scale-110 active:scale-95",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-[1.25rem] font-black shadow-[0_12px_24px_-8px_rgba(var(--primary),0.8)] scale-110 relative border border-white/20 after:content-[''] after:absolute after:-bottom-1.5 after:w-1.5 after:h-1.5 after:bg-white/50 after:rounded-full after:animate-pulse",
                            day_today: "bg-white/10 text-primary font-black ring-2 ring-primary/40",
                            day_outside: "text-muted-foreground/10 blur-[2px] pointer-events-none",
                            day_disabled: "opacity-20 pointer-events-none",
                        }}
                    />
                    <div className="flex flex-wrap justify-center gap-8 mt-12 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_rgba(var(--primary),0.8)] animate-pulse" /> Seleccionado
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-primary/20 ring-1 ring-primary/40" /> Con Clase
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Time Slots & Summary */}
            <div className="space-y-10 lg:border-l lg:border-white/5 lg:pl-16">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-primary">
                      <Clock className="w-6 h-6" />
                      <Label className="text-xl font-black tracking-[0.1em] uppercase">Horarios</Label>
                  </div>
                  <p className="text-[12px] text-muted-foreground/60 font-bold uppercase tracking-widest pl-9">
                      Para <span className="text-primary font-black">{currentSelectedDates && currentSelectedDates.length > 0 ? (currentSelectedDates.length === 1 ? format(currentSelectedDates[0], "d 'de' MMMM", { locale: es }) : `${currentSelectedDates.length} Días ELEGIDOS`) : "SELECCIONA FECHA"}</span>
                  </p>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    {TIME_SLOTS.map(time => {
                        const isSelectedInAny = currentSelectedDates?.some(date => 
                          selectedPairs.some(p => isSameDay(p.date, date) && p.time === time)
                        );
                        
                        const isSelectedInAll = currentSelectedDates?.length ? currentSelectedDates.every(date => 
                          selectedPairs.some(p => isSameDay(p.date, date) && p.time === time)
                        ) : false;

                        return (
                            <Button
                                key={time}
                                variant={isSelectedInAll ? "default" : isSelectedInAny ? "secondary" : "outline"}
                                className={`h-16 rounded-[1.25rem] text-sm font-black transition-all duration-300 border-white/5 shadow-lg ${isSelectedInAll ? "shadow-[0_12px_25px_-10px_rgba(var(--primary),0.6)] scale-105 ring-2 ring-primary/20" : "bg-white/5 hover:bg-primary/10 hover:border-primary/40 hover:scale-105 active:scale-95"}`}
                                onClick={() => toggleTimeSlot(time)}
                            >
                                {time}
                                {isSelectedInAll && <CheckCircle2 className="w-4 h-4 ml-2 animate-in zoom-in duration-500" />}
                            </Button>
                        );
                    })}
                </div>

                <div className="pt-10 border-t border-white/5 space-y-8">
                    <div className="flex items-center justify-between pr-4">
                        <Label className="text-lg font-black tracking-[0.2em] flex items-center gap-3 uppercase text-primary/90">
                            <History className="w-6 h-6" /> Itinerario
                        </Label>
                        {selectedPairs.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => setSelectedPairs([])} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive transition-all hover:bg-destructive/5 px-4 rounded-xl">
                                Limpiar todo
                            </Button>
                        )}
                    </div>

                    <div className="bg-black/20 rounded-[3rem] border border-white/5 p-10 space-y-4 min-h-[200px] max-h-[350px] overflow-y-auto custom-scrollbar shadow-[inset_0_4px_20px_rgba(0,0,0,0.4)] relative">
                        {selectedPairs.length > 0 ? (
                            <div className="grid gap-4">
                                {selectedPairs.sort((a, b) => a.date.getTime() - b.date.getTime()).map((pair, idx) => (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 15 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      key={`${pair.date.toISOString()}-${pair.time}`} 
                                      className="flex items-center justify-between bg-white/[0.03] p-5 rounded-[1.5rem] border border-white/[0.05] group hover:bg-white/[0.07] transition-all hover:scale-[1.02] shadow-xl"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all border border-primary/10">
                                              <CalendarDays className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground capitalize tracking-tight">
                                                  {format(pair.date, "EEEE d", { locale: es })}
                                                  <span className="text-muted-foreground/40 ml-2 font-medium">{format(pair.date, "MMMM", { locale: es })}</span>
                                                </p>
                                                <p className="text-[12px] text-primary font-black tracking-[0.2em] mt-1">{pair.time} HRS</p>
                                            </div>
                                        </div>
                                        <button 
                                          onClick={() => removePair(idx)} 
                                          className="opacity-0 group-hover:opacity-100 transition-all p-3 bg-destructive/10 text-destructive rounded-2xl hover:bg-destructive hover:text-white shadow-lg active:scale-95"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-10 py-12">
                                <Video className="w-20 h-20 mb-6" />
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-center leading-loose">Configura el horario <br/> para visualizar el itinerario</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>

          <div className="p-12 bg-gradient-to-t from-black/40 to-transparent border-t border-white/5 flex flex-col sm:flex-row gap-8 items-center justify-end px-16 relative">
            <div className="absolute left-16 hidden lg:flex items-center gap-4 text-muted-foreground/30 text-xs font-black uppercase tracking-[0.3em]">
                <Info className="w-5 h-5" />
                Los cambios se guardarán permanentemente
            </div>
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)} className="rounded-[1.5rem] h-16 px-12 font-bold text-muted-foreground hover:text-foreground transition-all hover:bg-white/5 active:scale-95 border border-transparent hover:border-white/5">
                Descartar
            </Button>
            <Button 
                onClick={handleCreate} 
                disabled={!newClaseTitle || !newClaseLink || selectedPairs.length === 0} 
                className="rounded-[1.75rem] h-20 px-16 font-black shadow-[0_25px_60px_-12px_rgba(var(--primary),0.5)] min-w-[320px] uppercase tracking-[0.3em] text-sm group active:scale-[0.98] transition-all relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                <span className="relative z-10">Confirmar Reserva </span>
                {selectedPairs.length > 0 && <span className="relative z-10 ml-4 bg-black/30 px-4 py-2 rounded-xl tabular-nums animate-in slide-in-from-bottom-2 duration-500">{selectedPairs.length}</span>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
