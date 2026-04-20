'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, PlayCircle } from 'lucide-react';
import Link from 'next/link';

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

export default function VideosEstudiantePage() {
  const [files] = useState<MaterialFile[]>(initialFiles);
  
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/aula-virtual/material-estudiante">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold text-primary">
            Videos del Curso
          </h1>
        </div>
      </header>

      <main className="container py-8 sm:py-12">
        <Card className="max-w-4xl mx-auto bg-secondary/20 border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Videoteca del Curso</CardTitle>
            <CardDescription>
                Reproduce las clases y tutoriales grabados.
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
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <PlayCircle className="w-5 h-5" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No hay videos disponibles todavía.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
