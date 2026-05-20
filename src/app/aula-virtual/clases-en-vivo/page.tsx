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
        <DialogContent className="sm:max-w-[1000px] glass-card border-white/10 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
          <div className="bg-primary/5 p-8 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <CalendarDays className="w-7 h-7" />
                </div>
                <div>
                    <DialogTitle className="text-primary font-headline text-2xl font-bold tracking-tight">Seleccionar fecha y horario</DialogTitle>
                    <DialogDescription className="text-muted-foreground">Elige el día y la hora que mejor te convenga.</DialogDescription>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCreateModalOpen(false)} className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors">
                <XCircle className="w-8 h-8" />
            </Button>
          </div>
          
          <div className="p-10 grid lg:grid-cols-[1.2fr_1fr] gap-12 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Left Column: Calendar & Inputs */}
            <div className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 ml-1">Destinatario</Label>
                        <Select value={targetStudent} onValueChange={setTargetStudent}>
                          <SelectTrigger className="bg-secondary/10 border-white/5 h-14 rounded-2xl focus:ring-primary/40 text-sm font-medium">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10 rounded-2xl bg-slate-900/95 backdrop-blur-xl">
                            <SelectItem value="all">Todos los Alumnos</SelectItem>
                            {students.map(s => (
                              <SelectItem key={s.username} value={s.username}>
                                {s.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 ml-1">Título de la Sesión</Label>
                      <Input 
                          placeholder="Ej: Masterclass de Vocabulario"
                          value={newClaseTitle}
                          onChange={(e) => setNewClaseTitle(e.target.value)}
                          className="bg-secondary/10 border-white/5 h-14 rounded-2xl focus:ring-primary/40 text-sm"
                      />
                  </div>

                  <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 ml-1">Link de Reunión</Label>
                      <Input 
                          placeholder="https://meet.google.com/..."
                          value={newClaseLink}
                          onChange={(e) => setNewClaseLink(e.target.value)}
                          className="bg-secondary/10 border-white/5 h-14 rounded-2xl focus:ring-primary/40 text-sm"
                      />
                  </div>
                </div>

                <div className="p-8 bg-secondary/5 border border-white/5 rounded-[3rem] shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-primary/10" />
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
                            month: "w-full space-y-6",
                            caption: "flex justify-center pt-2 relative items-center mb-8",
                            caption_label: "text-xl font-black text-foreground tracking-tight",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-10 w-10 bg-secondary/20 p-0 opacity-70 hover:opacity-100 rounded-xl transition-all hover:bg-primary/20 hover:text-primary",
                            nav_button_previous: "absolute left-2",
                            nav_button_next: "absolute right-2",
                            table: "w-full border-collapse",
                            head_row: "flex w-full mb-6 justify-between px-2",
                            head_cell: "text-muted-foreground/60 w-12 font-black text-[10px] uppercase tracking-[0.2em] text-center",
                            row: "flex w-full mt-3 justify-between px-1",
                            cell: "relative p-0 text-center text-sm w-12 h-12 flex items-center justify-center",
                            day: "h-11 w-11 p-0 font-bold hover:bg-primary/10 rounded-2xl transition-all flex items-center justify-center m-auto text-base",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black shadow-lg shadow-primary/40 scale-110 relative after:content-[''] after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-white after:rounded-full",
                            day_today: "bg-secondary text-primary font-black ring-1 ring-primary/20",
                            day_outside: "text-muted-foreground opacity-10 blur-[1px]",
                        }}
                    />
                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" /> Día seleccionado
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary/20 ring-1 ring-primary/30" /> Día con sesión
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Time Slots & Summary */}
            <div className="space-y-8 lg:border-l lg:border-white/5 lg:pl-12">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                      <Clock className="w-5 h-5" />
                      <Label className="text-lg font-black tracking-tight uppercase">Horario</Label>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                      Sesiones para: <span className="text-primary font-bold">{currentSelectedDates && currentSelectedDates.length > 0 ? (currentSelectedDates.length === 1 ? format(currentSelectedDates[0], "d 'de' MMMM", { locale: es }) : `${currentSelectedDates.length} días seleccionados`) : "Ningún día seleccionado"}</span>
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
                                className={`h-14 rounded-2xl text-sm font-black transition-all duration-300 border-white/5 ${isSelectedInAll ? "shadow-[0_8px_20px_-6px_rgba(var(--primary),0.5)] scale-105" : "bg-white/5 hover:bg-primary/10 hover:border-primary/30 active:scale-95"}`}
                                onClick={() => toggleTimeSlot(time)}
                            >
                                {time}
                                {isSelectedInAll && <CheckCircle2 className="w-4 h-4 ml-2 animate-in zoom-in duration-300" />}
                            </Button>
                        );
                    })}
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-black tracking-tight flex items-center gap-2 uppercase">
                            <History className="w-5 h-5 text-primary" /> Resumen
                        </Label>
                        {selectedPairs.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => setSelectedPairs([])} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors">
                                Limpiar todo
                            </Button>
                        )}
                    </div>

                    <div className="bg-primary/5 rounded-[2.5rem] border border-white/5 p-8 space-y-4 min-h-[160px] max-h-[300px] overflow-y-auto custom-scrollbar shadow-inner">
                        {selectedPairs.length > 0 ? (
                            <div className="grid gap-3">
                                {selectedPairs.sort((a, b) => a.date.getTime() - b.date.getTime()).map((pair, idx) => (
                                    <motion.div 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      key={`${pair.date.toISOString()}-${pair.time}`} 
                                      className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all hover:translate-x-1"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                              <CalendarDays className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-foreground/90 capitalize">
                                                  {format(pair.date, "EEEE d 'de' MMMM", { locale: es })}
                                                </p>
                                                <p className="text-[11px] text-primary font-black tracking-wider">{pair.time} HRS</p>
                                            </div>
                                        </div>
                                        <button 
                                          onClick={() => removePair(idx)} 
                                          className="opacity-0 group-hover:opacity-100 transition-all p-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full opacity-20 py-8">
                                <Info className="w-12 h-12 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center leading-relaxed">Selecciona fechas y horas <br/> para ver el resumen</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>

          <div className="p-10 bg-secondary/5 border-t border-white/5 flex flex-col sm:flex-row gap-6 items-center justify-end px-12">
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)} className="rounded-2xl h-16 px-10 font-bold text-muted-foreground hover:text-foreground transition-all hover:bg-white/5">
                Cancelar
            </Button>
            <Button 
                onClick={handleCreate} 
                disabled={!newClaseTitle || !newClaseLink || selectedPairs.length === 0} 
                className="rounded-2xl h-16 px-14 font-black shadow-[0_20px_40px_-12px_rgba(var(--primary),0.4)] min-w-[280px] uppercase tracking-[0.2em] text-xs group active:scale-95 transition-all"
            >
                Confirmar Cita {selectedPairs.length > 0 && <span className="ml-3 bg-white/20 px-3 py-1 rounded-lg tabular-nums animate-in zoom-in duration-500">{selectedPairs.length}</span>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
