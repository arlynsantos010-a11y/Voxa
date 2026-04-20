"use client";

import { useEffect, useState, useRef } from "react";
import { VideoActions } from "./video-actions";
import { Play, Pause, Volume2, VolumeX, Music } from "lucide-react";
import YouTube, { YouTubeProps } from "react-youtube";

interface VideoPostProps {
  url: string; // The YouTube Video ID
  isActive: boolean;
  author: string;
  description: string;
  song: string;
  likes: number;
  comments: number;
  shares: number;
}

export function VideoPost({ url, isActive, author, description, song, likes, comments, shares }: VideoPostProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Mutado por defecto por browsers policy
  const [showPlayIcon, setShowPlayIcon] = useState<boolean>(false);
  const playerRef = useRef<any>(null);

  // Escucha cambios en isActive desde el IntersectionObserver 
  // para pausar o reproducir agresivamente según el scroll de usuario
  useEffect(() => {
    if (!playerRef.current) return;
    
    if (isActive) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    } else {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Manejador de canal de Sonido
  useEffect(() => {
    if (playerRef.current) {
        if(isMuted) playerRef.current.mute();
        else playerRef.current.unMute();
    }
  }, [isMuted]);

  // Acción al presionar la pantalla
  const togglePlay = () => {
    if (!playerRef.current) return;
    
    // Animación feedback visual
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 800);

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  // Callback Nativo de React-YouTube
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    // Si el video está activo apenas renderiza, force play.
    if (isMuted) event.target.mute();
    if (isActive) {
       event.target.playVideo();
       setIsPlaying(true);
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: isActive ? 1 : 0,
      controls: 0,       // Quitar UI de youtube
      rel: 0,            // No sugeridos ajenos
      modestbranding: 1, // Logo minimalista de YT
      loop: 1,           // Repetir ciclo (requisito reel)
      playlist: url,     // Necesario setear en Loop API
      fs: 0,             // No full script (lo estamos controlando internamente)
      playsinline: 1,    // Obligatorio en iOS webkit
      disablekb: 1,
      iv_load_policy: 3, // Ocultar anotaciones
    },
  };

  return (
    <div className="relative w-full h-full bg-black snap-start shrink-0 overflow-hidden group">
      {/* 
        El contendor del YouTube se escala > 100% para "esconder" los bordes negros o 
        títulos del iframe y proveer una experiencia nativa de Video Reels inmersiva.
      */}
      <div className="absolute inset-0 pointer-events-none w-full h-[120%] -top-[10%] sm:scale-150">
        <YouTube 
          videoId={url} 
          opts={opts} 
          onReady={onPlayerReady} 
          className="w-full h-full pointer-events-none"
          iframeClassName="w-full h-full pointer-events-none" 
        />
      </div>

      {/* Capa que intercepta clicks sobre el reproductor */}
      <div className="absolute inset-0 z-0 cursor-pointer" onClick={togglePlay} />

      {/* Overlay Animado para Play/Pause */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-10 ${showPlayIcon ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
      >
        <div className="p-4 bg-black/40 rounded-full backdrop-blur-sm">
          {!isPlaying ? <Pause className="w-16 h-16 text-white/90" /> : <Play className="w-16 h-16 text-white/90" />}
        </div>
      </div>

      {/* Header - Control de Silencio */}
      <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
        <h2 className="text-white font-extrabold text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">Reels</h2>
        <button 
          onClick={toggleMute}
          className="p-2.5 bg-black/40 rounded-full text-white backdrop-blur-md hover:bg-black/60 transition active:scale-95 pointer-events-auto shadow-lg"
          title={isMuted ? "Activar sonido" : "Silenciar"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Bottom Footer Details */}
      <div className="absolute bottom-0 left-0 right-16 p-4 pb-6 pt-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none text-white z-20 flex flex-col justify-end">
        <h3 className="font-bold text-lg pointer-events-auto hover:underline cursor-pointer tracking-tight drop-shadow-md">@{author}</h3>
        <p className="text-sm mt-1.5 pointer-events-auto max-h-24 overflow-y-auto pr-2 opacity-90 line-clamp-3 drop-shadow" style={{ scrollbarWidth: 'none' }}>
          {description}
        </p>
        <div className="flex items-center gap-2 mt-3 pointer-events-auto w-max bg-white/10 rounded-xl px-3 py-1.5 backdrop-blur-md border border-white/10 shadow-lg">
           <Music className="w-3.5 h-3.5 opacity-80" />
           <p className="text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] marquee opacity-90">{song}</p>
        </div>
      </div>

      {/* Sidebar - Acciones Visuales */}
      <VideoActions likes={likes} comments={comments} shares={shares} />
    </div>
  );
}
