'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Upload, FileText, Plus, FileUp, X, FolderSync, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface MaterialFile {
  id: number;
  name: string;
  size: string;
  uploadDate: string;
}

const initialFiles: MaterialFile[] = [
    { id: 1, name: "Clase_Introductoria.mp4", size: "150.7 MB", uploadDate: "2024-05-19" },
    { id: 2, name: "Tutorial_React_Hooks.mp4", size: "250.2 MB", uploadDate: "2024-05-17" },
]

export default function VideosGestionPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<MaterialFile[]>(initialFiles);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleUpload = () => {
    if (!selectedFile) {
      toast({
          variant: "destructive",
          title: "Ningún archivo seleccionado",
          description: "Por favor, selecciona un video para subir.",
      });
      return;
    }
    
    setIsUploading(true);
    
    setTimeout(() => {
      const newFile: MaterialFile = {
        id: files.length + 1,
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
      };
      setFiles(prevFiles => [newFile, ...prevFiles]);
      toast({
          title: "Carga Exitosa",
          description: `El video "${selectedFile.name}" ha sido subido.`,
      });
      setIsUploading(false);
      setSelectedFile(null);
      setUploadModalOpen(false);
    }, 1500);
  }

  const handleDelete = (fileId: number) => {
    setFiles(prevFiles => prevFiles.filter(f => f.id !== fileId));
    toast({
        title: "Video Eliminado",
        description: `El video ha sido eliminado correctamente.`,
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
              Gestión de Videos
            </h1>
          </div>
        </header>

        <main className="container py-8 sm:py-12">
          <Card className="max-w-4xl mx-auto bg-secondary/20 border-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl font-headline">Videos del Curso</CardTitle>
              <CardDescription>
                  Aquí puedes ver y administrar los videos.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-4 space-y-4">
              {files.length > 0 ? (
                files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-secondary/50 border border-primary/10 rounded-md hover:bg-secondary/70 transition-colors">
                    <div className="flex items-center gap-4 truncate">
                        <Video className="w-6 h-6 text-primary" />
                        <div className="truncate">
                          <p className="text-sm font-semibold truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{`Tamaño: ${file.size} - Subido: ${file.uploadDate}`}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(file.id)}>
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
        <DialogContent className="sm:max-w-[480px] bg-secondary/80 backdrop-blur-md border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline text-2xl">Subir Video</DialogTitle>
            <DialogDescription>
              Selecciona un archivo de video para subir.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <label htmlFor="file-upload" className="relative block w-full h-48 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <FileUp className="w-10 h-10 mb-2" />
                  <p className="font-semibold">Seleccionar archivo</p>
              </div>
              <input id="file-upload" type="file" accept="video/*" className="sr-only" onChange={handleFileChange} />
            </label>
            {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-secondary/50 border border-primary/10 rounded-md">
                    <div className="flex items-center gap-3 truncate">
                        <Video className="w-5 h-5 text-primary" />
                        <span className="text-sm truncate">{selectedFile.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedFile(null)}>
                        <X className="w-4 h-4" />
                    </Button>
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
