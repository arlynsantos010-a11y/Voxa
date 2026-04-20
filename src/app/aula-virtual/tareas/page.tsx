
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, FileUp, X, Upload, CheckCircle, Clock, User, Users, Globe } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';
import { format, parseISO, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { studentUsers } from '@/components/auth/login-screen';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Tarea {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted';
  assignedTo: string[];
  language: string; // Nuevo: Idioma al que pertenece la tarea
}

const initialTareas: Tarea[] = [
    { id: 1, title: "Investigación sobre IA", description: "Realizar un ensayo sobre el impacto de la IA.", dueDate: "2024-08-15", status: 'pending', assignedTo: ["Ana Torres"], language: "Francés" },
    { id: 2, title: "Proyecto Final: Aplicación Web", description: "Desarrollar una app web.", dueDate: "2024-08-30", status: 'pending', assignedTo: ["Todos"], language: "Inglés" },
    { id: 3, title: "Resumen Capítulo 5", description: "Resumir el capítulo 5.", dueDate: "2024-07-30", status: 'submitted', assignedTo: ["Carlos Gomez"], language: "Alemán" },
];

export default function TareasPage() {
  const { toast } = useToast();
  const { userRole, username, selectedLanguage } = useAuth();
  const [tareas, setTareas] = useState<Tarea[]>(initialTareas);
  
  const [isProfessorModalOpen, setProfessorModalOpen] = useState(false);
  const [isStudentModalOpen, setStudentModalOpen] = useState(false);
  const [activeTarea, setActiveTarea] = useState<Tarea | null>(null);

  // Form State
  const [newTareaTitle, setNewTareaTitle] = useState("");
  const [newTareaDesc, setNewTareaDesc] = useState("");
  const [newTareaDueDate, setNewTareaDueDate] = useState("");
  const [newTareaLanguage, setNewTareaLanguage] = useState(selectedLanguage || "Inglés");
  const [assignedStudents, setAssignedStudents] = useState<string[]>(["Todos"]);

  const handleCreateTarea = () => {
    if (!newTareaTitle || !newTareaDesc || !newTareaDueDate) {
      toast({ variant: "destructive", title: "Campos incompletos" });
      return;
    }
    const newTarea: Tarea = {
      id: tareas.length + 1,
      title: newTareaTitle,
      description: newTareaDesc,
      dueDate: newTareaDueDate,
      status: 'pending',
      assignedTo: assignedStudents,
      language: newTareaLanguage
    };
    setTareas(prev => [...prev, newTarea].sort((a,b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime()));
    toast({ title: "Tarea Creada" });
    setProfessorModalOpen(false);
  };

  const visibleTareas = useMemo(() => {
    if (userRole === 'professor') return tareas;
    if (userRole === 'student' && username && selectedLanguage) {
      return tareas.filter(t => t.language === selectedLanguage && (t.assignedTo.includes("Todos") || t.assignedTo.includes(username)));
    }
    return [];
  }, [tareas, userRole, username, selectedLanguage]);

  return (
    <div className="min-h-screen relative">
      <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center px-4">
          <Button variant="outline" size="icon" asChild className="mr-4">
            <Link href="/aula-virtual"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="flex flex-1 items-center gap-2">
            <h1 className="font-headline text-2xl font-bold text-primary">Tareas</h1>
            {selectedLanguage && (
              <Badge variant="outline" className="ml-4 bg-primary/10 text-primary border-primary/20">{selectedLanguage}</Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container py-12 px-4">
        <Card className="max-w-4xl mx-auto glass-card border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Tareas de {selectedLanguage || 'Curso'}</CardTitle>
            <CardDescription>
              {userRole === 'professor' ? "Gestiona las tareas por idioma." : `Tareas pendientes para tu curso de ${selectedLanguage}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {visibleTareas.length > 0 ? (
              visibleTareas.map((tarea) => (
                <Card key={tarea.id} className="bg-secondary/10 border-white/5 hover:border-primary/30 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => userRole === 'student' && tarea.status === 'pending' && (setActiveTarea(tarea), setStudentModalOpen(true))}>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold">{tarea.title}</p>
                        <Badge variant="outline" className="text-[10px] uppercase">{tarea.language}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Vence: {tarea.dueDate}
                      </p>
                    </div>
                    {tarea.status === 'submitted' ? (
                      <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="w-3 h-3 mr-1" /> Entregada</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/20">Pendiente</Badge>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>No hay tareas disponibles en este idioma.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {userRole === 'professor' && (
        <Button size="lg" className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-xl" onClick={() => setProfessorModalOpen(true)}>
          <Plus className="h-8 w-8" />
        </Button>
      )}

      {/* Professor Modal con selector de idioma */}
      <Dialog open={isProfessorModalOpen} onOpenChange={setProfessorModalOpen}>
        <DialogContent className="glass-card sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Nueva Tarea</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Select value={newTareaLanguage} onValueChange={setNewTareaLanguage}>
              <SelectTrigger className="bg-secondary/20 h-12 rounded-xl">
                <SelectValue placeholder="Seleccionar idioma" />
              </SelectTrigger>
              <SelectContent>
                {["Inglés", "Francés", "Alemán", "Italiano", "Portugués", "Español"].map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Título" value={newTareaTitle} onChange={e => setNewTareaTitle(e.target.value)} className="bg-secondary/20 h-12" />
            <Textarea placeholder="Descripción" value={newTareaDesc} onChange={e => setNewTareaDesc(e.target.value)} className="bg-secondary/20" />
            <Input type="date" value={newTareaDueDate} onChange={e => setNewTareaDueDate(e.target.value)} className="bg-secondary/20 h-12" />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateTarea} className="w-full h-12 rounded-xl">Crear Tarea para {newTareaLanguage}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
