'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Video, PlayCircle, Maximize, ExternalLink, X, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ref, get } from "firebase/database";
import { rtdb } from "@/lib/firebase";

interface MaterialFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  url?: string;
}

const initialFiles: MaterialFile[] = [
    { id: "1", name: "Clase_Introductoria.mp4", size: "150.7 MB", uploadDate: "2024-05-19", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
    { id: "2", name: "Tutorial_React_Hooks.mp4", size: "250.2 MB", uploadDate: "2024-05-17", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
]

export default function VideosEstudiantePage() {
  const { username } = useAuth();
  const [files, setFiles] = useState<MaterialFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<MaterialFile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadDriveIframe, setLoadDriveIframe] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (activeVideo) {
      setIsReady(false);
      setLoadDriveIframe(false);
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 450); // wait for dialog scale/fade transition to complete
      return () => clearTimeout(timer);
    } else {
      setIsReady(false);
      setIsCssFullscreen(false);
      setLoadDriveIframe(false);
    }
  }, [activeVideo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCssFullscreen) {
        setIsCssFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCssFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (!isFull) {
        setIsCssFullscreen(false);
        if (isMobile) {
          setLoadDriveIframe(false);
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isCssFullscreen && isMobile) {
      const isNativeFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (!isNativeFull) {
        setLoadDriveIframe(false);
      }
    }
  }, [isCssFullscreen, isMobile]);

  const handleFullscreen = async () => {
    if (activeVideo && isGoogleDriveUrl(activeVideo.url || "") && isMobile) {
      setLoadDriveIframe(true);
    }
    if (videoContainerRef.current) {
      const elem = videoContainerRef.current as any;
      try {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        } else {
          setIsCssFullscreen(true);
        }
      } catch (err) {
        console.warn("Native fullscreen failed, using CSS fullscreen fallback:", err);
        setIsCssFullscreen(true);
      }
    } else {
      setIsCssFullscreen(true);
    }
  };

  const handlePlayMobileDrive = () => {
    setLoadDriveIframe(true);
    // Use a tiny timeout to ensure the state has updated before requesting fullscreen
    setTimeout(() => {
      handleFullscreen();
    }, 50);
  };

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
              uploadDate: data[k].uploadDate || data[k].dateAdded || "",
              url: data[k].url || '#'
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
                  uploadDate: data[k].dateAdded || data[k].uploadDate || "",
                  url: data[k].url || '#'
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

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      let videoId = "";
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
      } else if (url.includes('youtube.com/watch')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1].split(/[?#]/)[0];
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } catch (e) {
      return "";
    }
  };

  const isGoogleDriveUrl = (url: string) => {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    try {
      let fileId = "";
      if (url.includes('/file/d/')) {
        fileId = url.split('/file/d/')[1].split('/')[0];
      } else if (url.includes('id=')) {
        fileId = url.split('id=')[1].split('&')[0];
      }
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    } catch (e) {
      return url;
    }
  };

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
                <div key={file.id} className="flex items-center justify-between p-3 bg-secondary/50 border border-white/5 rounded-md hover:bg-secondary/70 transition-colors cursor-pointer" onClick={() => setActiveVideo(file)}>
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

      {/* Modal Reproductor de Video */}
      <Dialog open={!!activeVideo} onOpenChange={(open) => {
        if (!open) {
          setActiveVideo(null);
          setIsCssFullscreen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[640px] bg-secondary/90 backdrop-blur-md border-white/10 p-4">
          <DialogHeader>
            <DialogTitle className="text-primary font-headline text-xl truncate">{activeVideo?.name}</DialogTitle>
          </DialogHeader>
          
          <div 
            ref={videoContainerRef} 
            className={`aspect-video w-full bg-black rounded-lg overflow-hidden mt-2 relative ${
              isCssFullscreen 
                ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none mt-0 flex items-center justify-center' 
                : ''
            }`}
          >
            {activeVideo && isReady && (
              isYouTubeUrl(activeVideo.url || "") ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.url || "")}
                  className="w-full h-full border-none"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              ) : isGoogleDriveUrl(activeVideo.url || "") ? (
                (!isMobile || loadDriveIframe) ? (
                  <iframe
                    src={getGoogleDriveEmbedUrl(activeVideo.url || "")}
                    className="w-full h-full border-none"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 cursor-pointer group hover:bg-zinc-900 transition-colors"
                    onClick={handlePlayMobileDrive}
                  >
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary border border-primary/30 group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-300">
                      <PlayCircle className="w-10 h-10 fill-primary/20" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-white/95">Toca para reproducir</p>
                    <p className="mt-1.5 text-xs text-white/50 px-6 text-center max-w-[280px]">
                      El video se reproducirá automáticamente en pantalla completa para evitar errores
                    </p>
                  </div>
                )
              ) : (
                <video
                  src={(activeVideo.url && activeVideo.url !== '#') ? activeVideo.url : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )
            )}

            {!isReady && activeVideo && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-white gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Inicializando reproductor...</p>
              </div>
            )}

            {isCssFullscreen && (
              <button 
                type="button"
                className="absolute top-4 right-4 z-[10000] p-2 bg-black/60 hover:bg-black/80 rounded-full border border-white/20 text-white transition-colors"
                onClick={() => setIsCssFullscreen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Advertencia / Tip para Google Drive en móviles */}
          {activeVideo && isGoogleDriveUrl(activeVideo.url || "") && (
            <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg flex gap-2.5 items-start">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs text-white/90 leading-relaxed">
                <p className="font-semibold text-primary">💡 Tip para celulares</p>
                <p className="mt-0.5 text-white/70">
                  Si la imagen no se muestra o se pausa, presiona <strong>Pantalla Completa</strong> o usa <strong>Abrir en Drive</strong> para reproducir sin restricciones de privacidad de tu navegador.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:justify-between gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none text-white border-white/10 hover:bg-white/5" onClick={handleFullscreen}>
                <Maximize className="w-4 h-4 text-primary" />
                Pantalla Completa
              </Button>
              {activeVideo && activeVideo.url && activeVideo.url !== '#' && (
                <Button variant="outline" className="gap-2 flex-1 sm:flex-none text-white border-white/10 hover:bg-white/5" asChild>
                  <a href={activeVideo.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    Abrir en {isGoogleDriveUrl(activeVideo.url) ? 'Drive' : isYouTubeUrl(activeVideo.url) ? 'YouTube' : 'Enlace'}
                  </a>
                </Button>
              )}
            </div>
            <Button variant="ghost" className="text-white hover:bg-white/5" onClick={() => setActiveVideo(null)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
