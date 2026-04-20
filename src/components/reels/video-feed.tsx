"use client";

import { useEffect, useRef, useState } from "react";
import { VideoPost } from "./video-post";
import { getLocalReels, YouTubeVideoData, MOCK_VIDEOS } from "@/lib/youtube";

export function VideoFeed() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [videos, setVideos] = useState<YouTubeVideoData[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Carga inicial (Sincroniza con local storage que el Admin controla)
    const reels = getLocalReels();
    setVideos(reels);
    if (reels.length > 0) setActiveVideoId(reels[0].id);
    setInitialized(true);
  }, []);

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

      {videos === MOCK_VIDEOS && (
        <div className="absolute top-2 left-2 right-2 z-50 bg-red-500/90 text-white text-xs p-2 rounded-lg backdrop-blur-md text-center shadow-lg font-bold pointer-events-none">
          Videos de demostración. Pide a tu Profesor que suba Reels.
        </div>
      )}

      {videos.map((video) => (
        <div key={video.id} id={video.id} className="reel-video-post w-full h-full snap-start relative">
          <VideoPost
            url={video.id}
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
    </div>
  );
}
