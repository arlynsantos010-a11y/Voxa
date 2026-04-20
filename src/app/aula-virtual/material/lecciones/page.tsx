'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Upload, Plus, FileUp, X, Trash2, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Leccion {
  id: number;
  title: string;
  description: string;
  creationDate: string;
}

const initialFiles: Leccion[] = [
    { id: 1, title: "Lección 1: Fundamentos de la Programación", description: "Introducción a los conceptos básicos.", creationDate: "2024-05-22" },
    { id: 2, title: "Lección 2: Estructuras de Datos", description: "Arrays, listas enlazadas y más.", creationDate: "2024-05-20" },
]

export default function LeccionesGestionPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<Leccion[]>(initialFiles);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newLeccionTitle, setNewLeccionTitle] = useState("");
  const [newLeccionDesc, setNewLeccionDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreate = () => {
    if (!newLeccionTitle || !newLeccionDesc) {
      toast({
          variant: "destructive",
          title: "Campos incompletos",
          description: "Por favor, completa el título y la descripción.",
      });
      return;
    }
    
    setIsCreating(true);
    
    setTimeout(() => {
      const newFile: Leccion = {
        id: files.length + 1,
        title: newLeccionTitle,
        description: newLeccionDesc,
        creationDate: new Date().toISOString().split('T')[0],
      };
      setFiles(prevFiles => [newFile, ...prevFiles]);
      toast({
          title: "Creación Exitosa",
          description: `La lección "${newLeccionTitle}" ha sido creada.`,
      });
      setIsCreating(false);
      setNewLeccionTitle("");
      setNewLeccionDesc("");
      setCreateModalOpen(false);
    }, 1500);
  }

  const handleDelete = (fileId: number) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    toast({
        title: "Lección Eliminada",
        description: `La lección ha sido eliminada correctamente.`,
    });
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground relative">
        <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-background/80 backdrop-blur-sm">
          <div className="container flex h-16 items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/aula-virtual/material">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="font-headline text-2xl font-bold text-primary">
              Gestión de Lecciones
            </h1>
          </div>
        </header>

        <main className="container py-8 sm:py-12">
          <Card className="max-w-4xl mx-auto bg-secondary/20 border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Lecciones del Curso</CardTitle>
              <CardDescription>
                  Aquí puedes crear, ver y administrar las lecciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4 space-y-4">
              {files.length > 0 ? (
                files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-secondary/50 border border-primary/10 rounded-md hover:bg-secondary/70 transition-colors">
                    <div className="flex items-center gap-4 truncate">
                        <GraduationCap className="w-6 h-6 text-primary" />
                        <div className="truncate">
                          <p className="text-sm font-semibold truncate">{file.title}</p>
                          <p className="text-xs text-muted-foreground">{`Creado: ${file.creationDate}`}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(file.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay lecciones creadas todavía.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        
        <div className="fixed bottom-8 right-8 z-50">
          <Button size="lg" className="rounded-full shadow-lg shadow-primary/30 h-16 w-16" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-8 w-8" />
          </Button>
        </div>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-secondary/80 backdrop-blur-md border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline text-2xl">Crear Nueva Lección</DialogTitle>
            <DialogDescription>
              Añade un título y una descripción para tu nueva lección.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input 
              placeholder="Título de la lección"
              value={newLeccionTitle}
              onChange={(e) => setNewLeccionTitle(e.target.value)}
              className="bg-secondary/50 border-primary/20"
            />
            <Textarea
              placeholder="Descripción detallada de la lección..."
              value={newLeccionDesc}
              onChange={(e) => setNewLeccionDesc(e.target.value)}
              className="bg-secondary/50 border-primary/20"
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!newLeccionTitle || !newLeccionDesc || isCreating}>
                {isCreating ? "Creando..." : "Crear Lección"}
                {isCreating && <Upload className="ml-2 h-4 w-4 animate-pulse" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
