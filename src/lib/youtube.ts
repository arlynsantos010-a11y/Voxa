export interface YouTubeVideoData {
  id: string; // The video ID
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  videoUrl?: string;
  type?: 'video' | 'image';
  resource_type?: string;
  level?: string;
  addedAt?: number;
}

// Fallback Mock Data for testing if Admin hasn't added anything yet
export const MOCK_VIDEOS: YouTubeVideoData[] = [
  {
    id: "jNQXAC9IVRw", 
    title: "¿Cómo funciona el Aula?",
    description: "Este es un video demostrativo. ¡Ve al Panel de Administración > Gestión de Reels para subir (vincular) tus propios videos de YouTube!",
    channelTitle: "CampusAdmin",
    thumbnailUrl: "",
    level: "Todos"
  },
  {
    id: "aqz-KE-bpKQ", 
    title: "Video Educativo Ficticio",
    description: "Añade videos desde el panel de administrador empleando URLs estándar de YouTube.",
    channelTitle: "Sistema",
    thumbnailUrl: "",
    level: "B1"
  }
];

import { ref, get, set, remove, push, update } from "firebase/database";
import { rtdb } from "./firebase";

// Lee de Firebase (Sincronizado con el estado real)
export async function getFirebaseReels(): Promise<YouTubeVideoData[]> {
  try {
    const reelsRef = ref(rtdb, 'reels');
    const snapshot = await get(reelsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({
        ...data[key],
        id: key, // Usamos la key de Firebase como ID si no existe
      })).sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));
    }
  } catch (error) {
    console.error("Error fetching reels from Firebase:", error);
  }
  return MOCK_VIDEOS;
}

export async function saveFirebaseReel(video: YouTubeVideoData) {
  try {
    const reelsRef = ref(rtdb, `reels/${video.id}`);
    const videoToSave = { 
      ...video, 
      addedAt: Date.now() 
    };
    await set(reelsRef, videoToSave);
  } catch (error) {
    console.error("Error saving reel to Firebase:", error);
    throw error;
  }
}

export async function deleteFirebaseReel(id: string) {
  try {
    const reelRef = ref(rtdb, `reels/${id}`);
    await remove(reelRef);
  } catch (error) {
    console.error("Error deleting reel from Firebase:", error);
    throw error;
  }
}

export async function fetchVideoDetails(videoId: string): Promise<YouTubeVideoData | null> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!apiKey) {
    // Si no hay API KEY, devolvemos un cascarón genérico confiando en el Administrador
    return {
      id: videoId,
      title: "Video Extraído",
      description: "Edite esta descripción genérica antes de guardar, ya que falta API Key.",
      channelTitle: "Externo",
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
