"use client";

import { useEffect, useRef, useState } from "react";
import { VideoPost } from "./video-post";
import { YouTubeVideoData, MOCK_VIDEOS } from "@/lib/youtube";
import { onValue, ref } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [videos, setVideos] = useState<YouTubeVideoData[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Sincronización en TIEMPO REAL con Firebase
    const reelsRef = ref(rtdb, 'reels');
    
    const unsubscribe = onValue(reelsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const loadedReels = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
        })).sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));
        
        setVideos(loadedReels);
        if (loadedReels.length > 0 && !activeVideoId) {
          setActiveVideoId(loadedReels[0].id);
        }
      } else {
        setVideos(MOCK_VIDEOS);
        if (MOCK_VIDEOS.length > 0 && !activeVideoId) {
          setActiveVideoId(MOCK_VIDEOS[0].id);
        }
      }
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [activeVideoId]);

  // Intersection Observer para Auto-Play y control del video activo
  useEffect(() => {
    if (!initialized || videos.length === 0) return;

    const observerOptions = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.6, // Gatilla play cuando el 60% del div es visible
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveVideoId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const elements = document.querySelectorAll(".reel-video-post");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [videos, initialized]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full sm:w-[400px] md:w-[450px] mx-auto bg-black rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] snap-y snap-mandatory overflow-y-scroll hide-scrollbar relative border-[4px] border-neutral-800 overflow-hidden"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />

      {!initialized ? (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 p-8">
          <Skeleton className="w-full h-[60%] rounded-2xl bg-neutral-800" />
          <div className="w-full space-y-3">
            <Skeleton className="h-8 w-3/4 rounded-lg bg-neutral-800" />
            <Skeleton className="h-4 w-1/2 rounded-lg bg-neutral-800" />
          </div>
          <div className="absolute right-4 bottom-24 space-y-6">
            <Skeleton className="w-12 h-12 rounded-full bg-neutral-800" />
            <Skeleton className="w-12 h-12 rounded-full bg-neutral-800" />
            <Skeleton className="w-12 h-12 rounded-full bg-neutral-800" />
          </div>
        </div>
      ) : (
        <>
          {videos === MOCK_VIDEOS && (
            <div className="absolute top-2 left-2 right-2 z-50 bg-red-500/90 text-white text-xs p-2 rounded-lg backdrop-blur-md text-center shadow-lg font-bold pointer-events-none">
              Videos de demostración. Pide a tu Profesor que suba Reels.
            </div>
          )}

          {videos.map((video) => (
            <div key={video.id} id={video.id} className="reel-video-post w-full h-full snap-start relative">
              <VideoPost
                url={video.videoUrl || video.id}
                isActive={video.id === activeVideoId}
                author={video.channelTitle ? video.channelTitle.replace(/ /g, "_").toLowerCase() : "profesor"}
                description={video.description || video.title}
                song={`Recomendado para: ${video.level || "Todos"}`}
                likes={Math.floor(Math.random() * 1000) + 100} // Cosmético por ahora
                comments={Math.floor(Math.random() * 50) + 5} // Cosmético por ahora
                shares={Math.floor(Math.random() * 20)} // Cosmético por ahora
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
