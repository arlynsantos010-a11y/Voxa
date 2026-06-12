'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Upload, FileText, Plus, FileUp, X, FolderSync, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ref, get, set, remove, push } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface MaterialFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  target?: string;
  studentKey?: string;
  isGlobal?: boolean;
}

const initialFiles: MaterialFile[] = [
    { id: "1", name: "Clase_Introductoria.mp4", size: "150.7 MB", uploadDate: "2024-05-19" },
    { id: "2", name: "Tutorial_React_Hooks.mp4", size: "250.2 MB", uploadDate: "2024-05-17" },
]

export default function VideosGestionPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<MaterialFile[]>(initialFiles);
  const [students, setStudents] = useState<any[]>([]);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Destinatarios
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Function to load all data from database
  const loadData = async () => {
    try {
      setIsLoading(true);
      const usersRef = ref(rtdb, 'users');
      const usersSnapshot = await get(usersRef);
      const studentList: any[] = [];
      const personalVideosList: any[] = [];

      if (usersSnapshot.exists()) {
        const usersData = usersSnapshot.val();
        Object.keys(usersData).forEach(key => {
          const user = usersData[key];
          if (user.role === 'student') {
            studentList.push(user);
            if (user.personalMaterials) {
              Object.keys(user.personalMaterials).forEach(matId => {
                const mat = user.personalMaterials[matId];
                if (mat.type === 'video') {
                  personalVideosList.push({
                    id: matId,
                    name: mat.title || mat.name,
                    size: mat.size || "N/A",
                    uploadDate: mat.dateAdded || mat.uploadDate || "",
                    target: `Para: ${user.username}`,
                    studentKey: key,
                    isGlobal: false
                  });
                }
              });
            }
          }
        });
      }
      setStudents(studentList);

      const globalSnapshot = await get(ref(rtdb, 'materials/videos'));
      const globalVideosList: any[] = [];
      if (globalSnapshot.exists()) {
        const globalData = globalSnapshot.val();
        Object.keys(globalData).forEach(key => {
          globalVideosList.push({
            id: key,
            name: globalData[key].name,
            size: globalData[key].size,
            uploadDate: globalData[key].uploadDate,
            target: 'Todos',
            isGlobal: true
          });
        });
      }

      setFiles([
        ...initialFiles.map(f => ({ ...f, id: f.id.toString(), target: 'Todos (Demo)', isGlobal: true })),
        ...globalVideosList,
        ...personalVideosList
      ]);
    } catch (err) {
      console.error("Error loading videos management:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Ningún archivo seleccionado",
        description: "Por favor, selecciona un video para subir.",
      });
      return;
    }

    if (targetType === 'specific' && selectedStudents.length === 0) {
      toast({
        variant: "destructive",
        title: "Sin alumnos seleccionados",
        description: "Por favor, selecciona al menos un alumno para este video.",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileName = selectedFile.name;
      const fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
      const uploadDate = new Date().toISOString().split('T')[0];

      const newItem = {
        name: fileName,
        title: fileName,
        size: fileSize,
        uploadDate: uploadDate,
        dateAdded: uploadDate,
        type: 'video',
        url: '#'
      };

      if (targetType === 'all') {
        const newRef = push(ref(rtdb, 'materials/videos'));
        await set(newRef, { ...newItem, id: newRef.key });
      } else {
        for (const studentUsername of selectedStudents) {
          const studentKey = studentUsername.replace(/[.#$\[\]]/g, "_");
          const newRef = push(ref(rtdb, `users/${studentKey}/personalMaterials`));
          await set(newRef, { ...newItem, id: newRef.key });
        }
      }

      toast({
        title: "Carga Exitosa",
        description: `El video "${fileName}" ha sido guardado permanentemente.`,
      });

      setSelectedFile(null);
      setSelectedStudents([]);
      setUploadModalOpen(false);
      
      // Reload lists
      await loadData();
    } catch (err) {
      console.error("Error uploading file:", err);
      toast({
        variant: "destructive",
        title: "Error al subir",
        description: "Ocurrió un error al guardar el video en la base de datos.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (file: any) => {
    try {
      if (file.isGlobal) {
        if (file.id === "1" || file.id === "2") {
          // Si son mock iniciales, filtrar localmente
          setFiles(prev => prev.filter(f => f.id !== file.id));
        } else {
          await remove(ref(rtdb, `materials/videos/${file.id}`));
        }
      } else {
        await remove(ref(rtdb, `users/${file.studentKey}/personalMaterials/${file.id}`));
      }

      setFiles(prev => prev.filter(f => f.id !== file.id));

      toast({
        title: "Video Eliminado",
        description: `El video ha sido eliminado correctamente.`,
      });
    } catch (err) {
      console.error("Error deleting file:", err);
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "Ocurrió un error al intentar eliminar el video.",
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground relative">
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-sm">
          <div className="container flex h-16 items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/aula-virtual/material">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold text-primary">
              Gestión de Videos
            </h1>
          </div>
        </header>

        <main className="container py-8 sm:py-12">
          <Card className="max-w-4xl mx-auto bg-secondary/20 border-white/10">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Videos del Curso</CardTitle>
              <CardDescription>
                  Aquí puedes ver y administrar los videos.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4 space-y-4">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground animate-pulse">
                  <p>Cargando videoteca...</p>
                </div>
              ) : files.length > 0 ? (
                files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-secondary/50 border border-white/5 rounded-md hover:bg-secondary/70 transition-colors">
                    <div className="flex items-center gap-4 truncate">
                        <Video className="w-6 h-6 text-primary flex-shrink-0" />
                        <div className="truncate">
                          <p className="text-sm font-semibold truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>{`Tamaño: ${file.size} - Subido: ${file.uploadDate}`}</span>
                            {file.target && (
                              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                                {file.target}
                              </span>
                            )}
                          </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(file)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay videos subidos todavía.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
        <div className="fixed bottom-8 right-8 z-50">
          <Button size="lg" className="rounded-full shadow-lg shadow-primary/30 h-16 w-16" onClick={() => setUploadModalOpen(true)}>
            <Plus className="h-8 w-8" />
          </Button>
        </div>
      </div>

      <Dialog open={isUploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-secondary/80 backdrop-blur-md border-white/10">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline text-2xl">Subir Video</DialogTitle>
            <DialogDescription>
              Selecciona un archivo de video para subir.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <label htmlFor="file-upload" className="relative block w-full h-40 border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileUp className="w-10 h-10 mb-2" />
                  <p className="font-semibold">Seleccionar archivo</p>
              </div>
              <input id="file-upload" type="file" accept="video/*" className="sr-only" onChange={handleFileChange} />
            </label>
            {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-secondary/50 border border-white/5 rounded-md">
                    <div className="flex items-center gap-3 truncate">
                        <Video className="w-5 h-5 text-primary" />
                        <span className="text-sm truncate">{selectedFile.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedFile(null)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Selector de Destinatarios */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-muted-foreground block">¿Quién puede ver este video?</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-white">
                  <input 
                    type="radio" 
                    name="targetType" 
                    checked={targetType === 'all'} 
                    onChange={() => setTargetType('all')}
                    className="accent-primary"
                  />
                  Todos los usuarios
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none text-white">
                  <input 
                    type="radio" 
                    name="targetType" 
                    checked={targetType === 'specific'} 
                    onChange={() => setTargetType('specific')}
                    className="accent-primary"
                  />
                  Usuarios específicos
                </label>
              </div>
            </div>

            {targetType === 'specific' && (
              <div className="space-y-2 border-t border-white/10 pt-4 max-h-48 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
                <label className="text-xs font-bold text-muted-foreground block mb-2">Selecciona los alumnos:</label>
                {students.length > 0 ? (
                  students.map((student) => (
                    <label key={student.username} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer select-none transition">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.username)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(prev => [...prev, student.username]);
                          } else {
                            setSelectedStudents(prev => prev.filter(username => username !== student.username));
                          }
                        }}
                        className="rounded accent-primary w-4 h-4"
                      />
                      <span className="text-sm font-semibold text-white">{student.username}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No hay alumnos registrados.</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUploadModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? "Subiendo..." : "Subir Video"}
                {isUploading && <Upload className="ml-2 h-4 w-4 animate-pulse" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


