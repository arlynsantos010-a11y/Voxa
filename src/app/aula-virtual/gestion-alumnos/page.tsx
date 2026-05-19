"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Search, Trash2, Link as LinkIcon, FileText, Plus, Users, GraduationCap, Clock } from "lucide-react";
import Link from "next/link";
import { ref, get, set, push, remove } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface PersonalLink {
  id: string;
  title: string;
  url: string;
  dateAdded: string;
}

interface PersonalMaterial {
  id: string;
  title: string;
  url: string;
  type: string;
  dateAdded: string;
}

interface StudentData {
  username: string;
  role: string;
  personalLinks?: Record<string, PersonalLink>;
  personalMaterials?: Record<string, PersonalMaterial>;
}

const sanitizeKey = (key: string) => key.replace(/[.#$\[\]]/g, "_");

export default function GestionAlumnosPage() {
  const { userRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Assignment Modal State
  const [assignmentType, setAssignmentType] = useState<"link" | "material">("link");
  const [assignTitle, setAssignTitle] = useState("");
  const [assignUrl, setAssignUrl] = useState("");
  const [materialType, setMaterialType] = useState("PDF");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (userRole !== 'professor' && userRole !== 'admin') {
      router.push('/aula-virtual');
      return;
    }

    const fetchStudents = async () => {
      try {
        const snapshot = await get(ref(rtdb, 'users'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          const studentList = Object.keys(data)
            .map(k => data[k])
            .filter(u => u.role === 'student');
          setStudents(studentList);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [userRole, router]);

  const filteredStudents = students.filter(s => 
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAssignment = async () => {
    if (!selectedStudent || !assignTitle || !assignUrl) {
      toast({
        variant: "destructive",
        title: "Campos vacíos",
        description: "Por favor completa todos los campos requeridos.",
      });
      return;
    }

    const path = assignmentType === "link" ? "personalLinks" : "personalMaterials";
    const newItem = {
      id: Date.now().toString(),
      title: assignTitle,
      url: assignUrl,
      dateAdded: new Date().toISOString(),
      ...(assignmentType === "material" && { type: materialType })
    };

    try {
      const studentKey = sanitizeKey(selectedStudent.username);
      const itemRef = push(ref(rtdb, `users/${studentKey}/${path}`));
      await set(itemRef, { ...newItem, id: itemRef.key });
      
      // Update local state
      const updatedStudents = students.map(s => {
        if (s.username === selectedStudent.username) {
            const currentItems = s[path] || {};
            return {
                ...s,
                [path]: { ...currentItems, [itemRef.key as string]: { ...newItem, id: itemRef.key as string } }
            };
        }
        return s;
      });
      setStudents(updatedStudents);
      
      // Update selected student to reflect changes in UI
      const updatedSelected = updatedStudents.find(s => s.username === selectedStudent.username);
      if (updatedSelected) setSelectedStudent(updatedSelected);

      toast({
        title: "Asignación exitosa",
        description: `${assignmentType === "link" ? "El enlace" : "El material"} ha sido asignado a ${selectedStudent.username}.`,
      });
      
      setAssignTitle("");
      setAssignUrl("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving assignment:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la asignación.",
      });
    }
  };

  const handleDeleteAssignment = async (studentName: string, type: "link" | "material", itemId: string) => {
    const path = type === "link" ? "personalLinks" : "personalMaterials";
    try {
      const studentKey = sanitizeKey(studentName);
      await remove(ref(rtdb, `users/${studentKey}/${path}/${itemId}`));
      
      // Update local state
      const updatedStudents = students.map(s => {
        if (s.username === studentName) {
            const currentItems = { ...(s[path] || {}) };
            delete currentItems[itemId];
            return { ...s, [path]: currentItems };
        }
        return s;
      });
      setStudents(updatedStudents);
      
      // Update selected student
      const updatedSelected = updatedStudents.find(s => s.username === studentName);
      if (updatedSelected) setSelectedStudent(updatedSelected);

      toast({
        title: "Eliminado",
        description: "La asignación ha sido eliminada.",
      });
    } catch (err) {
      console.error("Error deleting assignment:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-2 rounded-full" asChild>
            <Link href="/aula-virtual">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary">Gestión de Alumnos</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Student List */}
          <div className="lg:col-span-1 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar alumno..." 
                className="pl-10 glass-card border-white/10 h-12 rounded-2xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-10 opacity-50">Cargando alumnos...</div>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <motion.div
                    key={student.username}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      selectedStudent?.username === student.username 
                      ? "bg-primary/20 border-primary shadow-lg shadow-primary/10" 
                      : "bg-secondary/10 border-white/5 hover:bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        selectedStudent?.username === student.username ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                      }`}>
                        {student.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-bold truncate">{student.username}</p>
                        <p className="text-xs text-muted-foreground">Estudiante</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">No se encontraron alumnos.</div>
              )}
            </div>
          </div>

          {/* Assignments Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedStudent ? (
                <motion.div
                  key={selectedStudent.username}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <Card className="glass-card border-white/10 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-primary/5 border-b border-white/5 p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">Panel del Alumno</p>
                          <CardTitle className="text-3xl font-headline font-bold">{selectedStudent.username}</CardTitle>
                          <CardDescription>Administra los enlaces y materiales exclusivos para este estudiante.</CardDescription>
                        </div>
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-2xl font-bold shadow-lg shadow-primary/20 h-12">
                                    <Plus className="mr-2 h-5 w-5" /> Nueva Asignación
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass-card border-white/10 sm:max-w-[480px] rounded-[2.5rem]">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-headline font-bold text-primary">Asignar Contenido</DialogTitle>
                                    <DialogDescription>Añade un enlace de clase o material educativo para {selectedStudent.username}.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tipo de Asignación</Label>
                                        <Select 
                                            value={assignmentType} 
                                            onValueChange={(v: "link" | "material") => setAssignmentType(v)}
                                        >
                                            <SelectTrigger className="bg-secondary/20 border-white/5 h-12 rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="glass-card border-white/10">
                                                <SelectItem value="link">Enlace de Clase (Video)</SelectItem>
                                                <SelectItem value="material">Material Educativo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Título</Label>
                                        <Input 
                                            placeholder="Ej: Clase de Repaso Personalizada"
                                            value={assignTitle}
                                            onChange={(e) => setAssignTitle(e.target.value)}
                                            className="bg-secondary/20 border-white/5 h-12 rounded-xl"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Enlace (URL)</Label>
                                        <Input 
                                            placeholder="https://..."
                                            value={assignUrl}
                                            onChange={(e) => setAssignUrl(e.target.value)}
                                            className="bg-secondary/20 border-white/5 h-12 rounded-xl"
                                        />
                                    </div>

                                    {assignmentType === "material" && (
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tipo de Material</Label>
                                            <Select value={materialType} onValueChange={setMaterialType}>
                                                <SelectTrigger className="bg-secondary/20 border-white/5 h-12 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="glass-card border-white/10">
                                                    <SelectItem value="PDF">Documento PDF</SelectItem>
                                                    <SelectItem value="Video">Video Tutorial</SelectItem>
                                                    <SelectItem value="Web">Enlace Externo</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                                    <Button onClick={handleAddAssignment} className="rounded-xl font-bold shadow-lg shadow-primary/20 px-8">Confirmar</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      {/* Personal Links Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <LinkIcon className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-lg">Enlaces de Clases</h3>
                        </div>
                        <div className="space-y-3">
                          {selectedStudent.personalLinks && Object.keys(selectedStudent.personalLinks).length > 0 ? (
                            Object.entries(selectedStudent.personalLinks).map(([id, link]) => (
                              <div key={id} className="flex items-center justify-between p-4 bg-secondary/10 border border-white/5 rounded-2xl hover:bg-secondary/20 transition-all group">
                                <div className="flex items-center gap-4 truncate">
                                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <LinkIcon className="w-5 h-5" />
                                  </div>
                                  <div className="truncate">
                                    <p className="font-bold truncate">{link.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                                  </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => handleDeleteAssignment(selectedStudent.username, "link", id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No hay enlaces de clase asignados.</p>
                          )}
                        </div>
                      </div>

                      {/* Personal Materials Section */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-lg">Materiales Educativos</h3>
                        </div>
                        <div className="space-y-3">
                          {selectedStudent.personalMaterials && Object.keys(selectedStudent.personalMaterials).length > 0 ? (
                            Object.entries(selectedStudent.personalMaterials).map(([id, mat]) => (
                              <div key={id} className="flex items-center justify-between p-4 bg-secondary/10 border border-white/5 rounded-2xl hover:bg-secondary/20 transition-all group">
                                <div className="flex items-center gap-4 truncate">
                                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="truncate">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold truncate">{mat.title}</p>
                                        <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-black uppercase">{mat.type}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{mat.url}</p>
                                  </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                                    onClick={() => handleDeleteAssignment(selectedStudent.username, "material", id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground italic">No hay materiales educativos asignados.</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-8 bg-secondary/5 border border-white/5 border-dashed rounded-[2.5rem]">
                  <GraduationCap className="w-16 h-16 text-primary/20 mb-4" />
                  <h3 className="text-xl font-bold text-muted-foreground">Selecciona un alumno</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mt-2">
                    Selecciona un estudiante de la lista de la izquierda para gestionar su contenido personalizado.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
