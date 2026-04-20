"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, PlaySquare, Plus, Search, Trash2, Video, VideoOff } from "lucide-react";
import Link from "next/link";
import { extractYouTubeId, fetchVideoDetails, saveLocalReel, getLocalReels, deleteLocalReel, YouTubeVideoData } from "@/lib/youtube";

export default function ReelsManagerPage() {
  const { userRole } = useAuth();
  const router = useRouter();

  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Edit Form Fields
  const [draftVideo, setDraftVideo] = useState<YouTubeVideoData | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLevel, setEditLevel] = useState("Todos");

  // Catalog
  const [reels, setReels] = useState<YouTubeVideoData[]>([]);

  useEffect(() => {
    if (userRole !== 'admin') router.push('/');
    loadReels();
  }, [userRole, router]);

  const loadReels = () => {
    setReels(getLocalReels());
  };

  const handleFetchUrl = async () => {
    const videoId = extractYouTubeId(urlInput);
    if (!videoId) {
      alert("URL de YouTube no válida.");
      return;
    }

    setIsLoading(true);
    const details = await fetchVideoDetails(videoId);
    setIsLoading(false);

    if (details) {
      setDraftVideo(details);
      setEditTitle(details.title);
      setEditDesc(details.description);
    } else {
      alert("Fallo al obtener datos o VideoPrivado. Verifica tu YouTube Data API key.");
    }
  };

  const handleSaveDraft = () => {
    if (!draftVideo) return;
    saveLocalReel({
      ...draftVideo,
      title: editTitle,
      description: editDesc,
      level: editLevel
    });
    setDraftVideo(null);
    setUrlInput("");
    loadReels();
    alert("¡Reel subido existosamente!");
  };

  const handleDelete = (id: string) => {
    if(confirm("¿Seguro de remover este video del feed de estudiantes?")) {
      deleteLocalReel(id);
      loadReels();
    }
  };

  if (userRole !== 'admin') return null;

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full" asChild>
            <Link href="/admin"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <PlaySquare className="w-6 h-6 text-pink-500" />
            <h1 className="font-headline text-2xl font-bold text-pink-500">Gestor de Reels</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Formulario de Subida */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card border-white/10 rounded-[2rem] overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-400" />
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-500" /> Nuevo Reel
                </CardTitle>
                <CardDescription>
                  Pega el enlace público del video de YouTube que deseas incrustar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Input 
                    placeholder="https://youtu.be/..." 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="bg-secondary/20 rounded-xl"
                  />
                  <Button 
                    onClick={handleFetchUrl} 
                    disabled={!urlInput || isLoading}
                    className="w-full rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black"
                  >
                    {isLoading ? "Buscando..." : "Cargar Metadatos"}
                  </Button>
                </div>

                {draftVideo && (
                  <div className="mt-6 space-y-4 p-4 rounded-2xl bg-secondary/10 border border-white/5 animate-in fade-in slide-in-from-bottom-4">
                    <img src={draftVideo.thumbnailUrl} alt="Thumb" className="w-full h-auto rounded-xl shadow-lg mb-2" />
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Título</label>
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-background rounded-lg border-white/10 text-sm" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Descripción (Fragmento corto)</label>
                      <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="bg-background rounded-lg border-white/10 text-sm" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground">Nivel Objetivo</label>
                      <select 
                        value={editLevel} 
                        onChange={(e) => setEditLevel(e.target.value)} 
                        className="w-full h-10 px-3 rounded-lg bg-background border border-white/10 text-sm focus:ring-1 focus:ring-pink-500 outline-none"
                      >
                        <option>Todos</option>
                        <option>A1 Básico</option>
                        <option>B1 Intermedio</option>
                        <option>C1 Avanzado</option>
                      </select>
                    </div>

                    <Button onClick={handleSaveDraft} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 font-bold rounded-xl text-white">
                      <Plus className="w-4 h-4 mr-2" /> Guardar Reel y Publicar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Columna Derecha: Catálogo Actual */}
          <div className="lg:col-span-2 space-y-6">
             <Card className="glass-card border-white/10 rounded-[2rem]">
               <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                   <CardTitle className="text-xl font-bold">Videos Publicados Recientemente</CardTitle>
                   <CardDescription>Los estudiantes verán este material en su Feed de `/aula-virtual/reels`.</CardDescription>
                 </div>
               </CardHeader>
               <CardContent>
                 {reels.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-white/10 rounded-3xl">
                      <VideoOff className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-medium">No hay Reels subidos</p>
                    </div>
                 ) : (
                   <div className="space-y-4">
                     {reels.map((reel) => (
                       <div key={reel.id} className="flex gap-4 p-4 rounded-2xl bg-secondary/5 hover:bg-secondary/10 border border-white/5 transition-colors items-center group">
                         <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-black relative">
                            <img src={reel.thumbnailUrl} alt={reel.title} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute top-1 right-1 bg-black/80 px-2 py-0.5 rounded text-[10px] font-black">{reel.level || "Todos"}</div>
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-sm truncate">{reel.title}</h4>
                           <p className="text-xs text-muted-foreground truncate">{reel.description}</p>
                           <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase">ID: {reel.id}</p>
                         </div>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => handleDelete(reel.id)}
                           className="text-red-500 hover:bg-red-500/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl shrink-0"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </div>
                     ))}
                   </div>
                 )}
               </CardContent>
             </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
