'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Video, Calendar as CalendarIcon, Link as LinkIcon, Trash2, Clock, XCircle, Info, CalendarDays, CheckCircle2, History, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from "@/components/ui/calendar"
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { format, isSameDay, startOfToday, getDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ref, get, push, set, remove } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { Checkbox } from "@/components/ui/checkbox";

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
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
];

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

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
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>([]);
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
    if (selectedWeekDays.length === 0) {
        toast({
            variant: "destructive",
            title: "Selecciona al menos un día",
            description: "Elige uno o varios días de la semana para asignarles este horario.",
        });
        return;
    }
    
    const dayMap: Record<string, number> = {
        "Domingo": 0, "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, "Viernes": 5, "Sábado": 6
    };
    
    setSelectedPairs(prev => {
        let next = [...prev];
        selectedWeekDays.forEach(dayName => {
            const targetDay = dayMap[dayName];
            const today = startOfToday();
            const currentDay = getDay(today);
            let diff = targetDay - currentDay;
            if (diff < 0) diff += 7;
            const date = addDays(today, diff);

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

  const toggleWeekDay = (day: string) => {
    setSelectedWeekDays(prev => 
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
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
        <DialogContent className="sm:max-w-[1000px] bg-white border-slate-200 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl text-slate-900 ring-1 ring-slate-100">
          <div className="bg-white p-10 border-b border-slate-100 flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                  <CalendarDays className="w-9 h-9" />
                </div>
                <div>
                    <DialogTitle className="text-slate-900 font-headline text-3xl font-black tracking-tight leading-none mb-2">Seleccionar días y hora</DialogTitle>
                    <DialogDescription className="text-slate-500 text-base font-medium">Elige los días de la semana y los horarios que más te convengan.</DialogDescription>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setCreateModalOpen(false)} className="rounded-full h-12 w-12 hover:bg-slate-100 text-slate-400">
                <XCircle className="w-8 h-8" />
            </Button>
          </div>
          
          <div className="p-12 grid lg:grid-cols-[1.1fr_1fr] gap-12 bg-slate-50/30">
            {/* Left Column: Day Selection & Info */}
            <div className="space-y-8 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Selecciona los días</h3>
                  <p className="text-sm text-slate-500 font-medium">Puedes seleccionar uno o más días.</p>
                </div>

                <div className="space-y-3">
                  {WEEK_DAYS.map(day => {
                    const isSelected = selectedWeekDays.includes(day);
                    return (
                      <div 
                        key={day}
                        onClick={() => toggleWeekDay(day)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${isSelected ? "bg-indigo-50/50 border-indigo-200 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"}`}
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox 
                            checked={isSelected}
                            onCheckedChange={() => toggleWeekDay(day)}
                            className="w-6 h-6 rounded-lg border-2 border-slate-200 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                          />
                          <span className={`text-base font-bold ${isSelected ? "text-slate-900" : "text-slate-600"}`}>{day}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-indigo-600" : "text-slate-400"}`}>
                          {isSelected ? "Seleccionado" : "No seleccionado"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl space-y-4 border border-slate-200/50">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Título de la Sesión</Label>
                        <Input 
                            placeholder="Ej: Masterclass de Vocabulario"
                            value={newClaseTitle}
                            onChange={(e) => setNewClaseTitle(e.target.value)}
                            className="bg-white border-slate-200 h-14 rounded-xl focus:ring-indigo-500/20 text-slate-900 font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Link de Reunión</Label>
                        <Input 
                            placeholder="https://meet.google.com/..."
                            value={newClaseLink}
                            onChange={(e) => setNewClaseLink(e.target.value)}
                            className="bg-white border-slate-200 h-14 rounded-xl focus:ring-indigo-500/20 text-slate-900 font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Right Column: Time Slots */}
            <div className="space-y-8 lg:pl-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-indigo-600">
                      <Clock className="w-6 h-6" />
                      <h3 className="text-xl font-black tracking-tight">Selecciona una hora disponible</h3>
                  </div>
                  <p className="text-sm text-slate-500 font-medium pl-9">Elige el horario que prefieras.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {TIME_SLOTS.map(time => {
                        const isSelected = selectedPairs.length > 0 && selectedWeekDays.length > 0 && selectedWeekDays.every(day => {
                            const dayMap: Record<string, number> = { "Domingo": 0, "Lunes": 1, "Martes": 2, "Miércoles": 3, "Jueves": 4, "Viernes": 5, "Sábado": 6 };
                            const targetDay = dayMap[day];
                            const today = startOfToday();
                            const currentDay = getDay(today);
                            let diff = targetDay - currentDay;
                            if (diff < 0) diff += 7;
                            const date = addDays(today, diff);
                            return selectedPairs.some(p => isSameDay(p.date, date) && p.time === time);
                        });

                        return (
                            <Button
                                key={time}
                                variant={isSelected ? "default" : "outline"}
                                className={`h-20 rounded-2xl text-lg font-bold transition-all duration-300 border-slate-100 ${isSelected ? "bg-indigo-600 text-white shadow-xl scale-105 shadow-indigo-200" : "bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-600 shadow-sm"}`}
                                onClick={() => toggleTimeSlot(time)}
                            >
                                <span className="flex-1 text-center">{time}</span>
                                {isSelected && <Check className="w-5 h-5 ml-2" />}
                            </Button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-3 mt-8">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-500 font-bold">Horario disponible</span>
                </div>

                <div className="pt-8 border-t border-slate-100 space-y-4">
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-4 h-4" /> Resumen de Selección
                    </h4>
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl max-h-[160px] overflow-y-auto custom-scrollbar shadow-sm">
                        {selectedPairs.length > 0 ? (
                            <div className="space-y-2">
                                {selectedPairs.sort((a,b) => a.date.getTime() - b.date.getTime()).map((p, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-slate-50 last:border-0">
                                        <span className="font-bold text-slate-700">{format(p.date, "EEEE d 'de' MMMM", { locale: es })}</span>
                                        <span className="text-indigo-600 font-black">{p.time}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 italic text-center py-4">No hay sesiones seleccionadas</p>
                        )}
                    </div>
                </div>
            </div>
          </div>

          <div className="p-10 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-end px-12">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} className="rounded-2xl h-16 px-12 font-bold text-slate-600 border-slate-200 hover:bg-slate-50 min-w-[180px]">
                Cancelar
            </Button>
            <Button 
                onClick={handleCreate} 
                disabled={!newClaseTitle || !newClaseLink || selectedPairs.length === 0} 
                className="rounded-2xl h-16 px-16 font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 min-w-[300px] flex items-center justify-between"
            >
                Confirmar selección
                <ArrowRight className="w-5 h-5 ml-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
