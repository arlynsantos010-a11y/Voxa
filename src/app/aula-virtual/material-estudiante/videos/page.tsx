'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Video, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ref, get } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface MaterialFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
}

const initialFiles: MaterialFile[] = [
    { id: "1", name: "Clase_Introductoria.mp4", size: "150.7 MB", uploadDate: "2024-05-19" },
    { id: "2", name: "Tutorial_React_Hooks.mp4", size: "250.2 MB", uploadDate: "2024-05-17" },
]

export default function VideosEstudiantePage() {
  const { username } = useAuth();
  const [files, setFiles] = useState<MaterialFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const studentKey = username ? username.replace(/[.#$\[\]]/g, "_") : "";
        
        // 1. Fetch Global Videos
        const globalRef = ref(rtdb, 'materials/videos');
        const globalSnapshot = await get(globalRef);
        const globalVideos: MaterialFile[] = [];
        if (globalSnapshot.exists()) {
          const data = globalSnapshot.val();
          Object.keys(data).forEach(k => {
            globalVideos.push({
              id: k,
              name: data[k].name || data[k].title,
              size: data[k].size || "N/A",
              uploadDate: data[k].uploadDate || data[k].dateAdded || ""
            });
          });
        }

        // 2. Fetch Personal Videos
        const personalVideos: MaterialFile[] = [];
        if (studentKey) {
          const personalRef = ref(rtdb, `users/${studentKey}/personalMaterials`);
          const personalSnapshot = await get(personalRef);
          if (personalSnapshot.exists()) {
            const data = personalSnapshot.val();
            Object.keys(data).forEach(k => {
              if (data[k].type === "video") {
                personalVideos.push({
                  id: k,
                  name: data[k].title || data[k].name,
                  size: data[k].size || "N/A",
                  uploadDate: data[k].dateAdded || data[k].uploadDate || ""
                });
              }
            });
          }
        }

        // Merge initial mock files + global + personal videos
        const allVideos = [
          ...initialFiles,
          ...globalVideos,
          ...personalVideos
        ];

        // Remove duplicates by name
        const uniqueVideos = allVideos.filter((v, index, self) =>
          self.findIndex(t => t.name === v.name) === index
        );

        setFiles(uniqueVideos);
      } catch (err) {
        console.error("Error fetching student videos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [username]);

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-sm">
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
        <Card className="max-w-4xl mx-auto bg-secondary/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Videoteca del Curso</CardTitle>
            <CardDescription>
                Reproduce las clases y tutoriales grabados.
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
