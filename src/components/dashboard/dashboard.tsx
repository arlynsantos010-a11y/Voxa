"use client";

import type { UserRole } from "@/app/page";
import DashboardHeader from "./header";
import DashboardHero from "./hero";
import StudentProgress from "./student-progress";
import ProfessorPanel from "./professor-panel";
import AdminPanel from "./admin-panel";
import DashboardFooter from "./footer";
import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { MOCK_VIDEOS, YouTubeVideoData } from "@/lib/youtube";
import { VideoPost } from "@/components/reels/video-post";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DashboardProps = {
  progress: {
    virtual: number;
    course1: number;
    course2: number;
  };
  userRole: UserRole | null;
  username: string | null;
};

const WhatsAppIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="h-7 w-7 fill-current"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function Dashboard({
  progress,
  userRole,
  username
}: DashboardProps) {
  const { onLogout } = useAuth();
  const router = useRouter();

  // Reels list and active index tracking
  const [reelsList, setReelsList] = useState<YouTubeVideoData[]>([]);
  const [activeReelIndex, setActiveReelIndex] = useState<number>(0);

  // Swipe/drag detection state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [mouseDownStart, setMouseDownStart] = useState<{ x: number; y: number } | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    if (userRole !== "student") return;

    const reelsRef = ref(rtdb, 'reels');
    const unsubscribe = onValue(reelsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedReels = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
        })).sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));
        
        if (loadedReels.length > 0) {
          setReelsList(loadedReels);
        } else {
          setReelsList(MOCK_VIDEOS);
        }
      } else {
        setReelsList(MOCK_VIDEOS);
      }
      setActiveReelIndex(0);
    });

    return () => unsubscribe();
  }, [userRole]);

  // Touch handlers for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
    setIsSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const diffY = touchStart.y - e.touches[0].clientY;
    const diffX = touchStart.x - e.touches[0].clientX;
    if (Math.abs(diffY) > 10 || Math.abs(diffX) > 10) {
      setIsSwiping(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || reelsList.length === 0) return;
    
    const diffY = touchStart.y - e.changedTouches[0].clientY;
    const minSwipeDistance = 50;

    if (Math.abs(diffY) > minSwipeDistance) {
      if (diffY > 0) {
        // Swipe Up -> Siguiente
        if (activeReelIndex < reelsList.length - 1) {
          setActiveReelIndex(prev => prev + 1);
        } else {
          setActiveReelIndex(0); // Bucle
        }
      } else {
        // Swipe Down -> Anterior
        if (activeReelIndex > 0) {
          setActiveReelIndex(prev => prev - 1);
        } else {
          setActiveReelIndex(reelsList.length - 1); // Bucle inverso
        }
      }
    }
    setTouchStart(null);
  };

  // Mouse drag handlers for desktop swipe emulation
  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownStart({
      x: e.clientX,
      y: e.clientY
    });
    setIsSwiping(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!mouseDownStart) return;
    const diffY = mouseDownStart.y - e.clientY;
    const diffX = mouseDownStart.x - e.clientX;
    if (Math.abs(diffY) > 10 || Math.abs(diffX) > 10) {
      setIsSwiping(true);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!mouseDownStart || reelsList.length === 0) return;
    
    const diffY = mouseDownStart.y - e.clientY;
    const minSwipeDistance = 50;

    if (Math.abs(diffY) > minSwipeDistance) {
      if (diffY > 0) {
        // Drag Up -> Siguiente
        if (activeReelIndex < reelsList.length - 1) {
          setActiveReelIndex(prev => prev + 1);
        } else {
          setActiveReelIndex(0);
        }
      } else {
        // Drag Down -> Anterior
        if (activeReelIndex > 0) {
          setActiveReelIndex(prev => prev - 1);
        } else {
          setActiveReelIndex(reelsList.length - 1);
        }
      }
    }
    setMouseDownStart(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSwiping) return;
    router.push('/aula-virtual/reels');
  };

  if (!userRole) return null;

  const currentReel = reelsList[activeReelIndex] || null;

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader userRole={userRole} onLogout={onLogout} />
      
      <main className="flex-grow pb-12">
        {userRole === "student" ? (
          <div className="w-full flex flex-col items-center px-4 pt-6 sm:pt-10">
            {currentReel ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full flex flex-col items-center justify-center animate-fade-in"
              >
                {/* Contenedor del reproductor de Reels */}
                <div 
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onClick={handleClick}
                  className="w-[320px] min-[400px]:w-[355px] h-[55vh] min-h-[460px] max-h-[560px] bg-black rounded-[2.5rem] overflow-hidden relative border-[6px] border-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mx-auto cursor-pointer select-none"
                >
                  <VideoPost
                    key={currentReel.id}
                    url={videoUrlResolver(currentReel)}
                    type={currentReel.type}
                    isActive={true} // Siempre en reproducción en el inicio
                    author={currentReel.channelTitle ? currentReel.channelTitle.replace(/ /g, "_").toLowerCase() : "profesor"}
                    description={currentReel.description || currentReel.title}
                    song={`Recomendado para: ${currentReel.level || "Todos"}`}
                    likes={585}
                    comments={9}
                    shares={2}
                    defaultMuted={false} // Volumen activado por defecto
                    onClick={handleClick}
                  />
                </div>
                
                {/* Botones inferiores alineados */}
                <div className="mt-5 flex gap-3.5 justify-center w-full max-w-[320px] min-[400px]:max-w-[355px] mx-auto">
                  <Button className="flex-1 h-12 text-sm sm:text-base font-bold rounded-2xl bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20" asChild>
                    <Link href="/aula-virtual">
                      Entrar al Aula
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 text-sm sm:text-base font-bold rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all active:scale-95" asChild>
                    <Link href="/perfil">Mi Perfil</Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="w-[320px] min-[400px]:w-[355px] h-[55vh] min-h-[460px] max-h-[560px] flex items-center justify-center bg-neutral-900 rounded-[2.5rem] border-[6px] border-neutral-800 animate-pulse mx-auto">
                <p className="text-muted-foreground text-sm font-semibold">Cargando Reels...</p>
              </div>
            )}

            {/* Todo lo demás debajo de los botones */}
            <div className="w-full mt-6">
              <div className="container mx-auto px-4">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <StudentProgress progress={progress} />
                </motion.div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4 w-full pt-6 sm:pt-10">
            <DashboardHero userRole={userRole} username={username} />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {userRole === "professor" && <ProfessorPanel />}
              {userRole === "admin" && <AdminPanel />}
            </motion.div>
          </div>
        )}
      </main>

      <DashboardFooter />

      {/* Botón Flotante de WhatsApp exclusivo para Estudiantes */}
      {userRole === "student" && (
        <motion.a
          href="https://wa.me/5491122334455" // Aquí puedes cambiar el número
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 z-[60] flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl shadow-[#25D366]/40 hover:shadow-[#25D366]/60 transition-shadow"
        >
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
          <WhatsAppIcon />
        </motion.a>
      )}
    </div>
  );
}

// Resolver URL de video soportando campos opcionales
function videoUrlResolver(video: YouTubeVideoData): string {
  return video.videoUrl || video.id;
}