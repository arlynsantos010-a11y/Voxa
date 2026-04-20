export interface YouTubeVideoData {
  id: string; // The video ID
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
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

// Lee de la base de datos simulada en cliente (localStorage)
export function getLocalReels(): YouTubeVideoData[] {
  if (typeof window === "undefined") return MOCK_VIDEOS;
  
  const saved = localStorage.getItem("campus_custom_reels");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));
      }
    } catch { }
  }
  return MOCK_VIDEOS;
}

export function saveLocalReel(video: YouTubeVideoData) {
  if (typeof window === "undefined") return;
  // Obtenemos los existentes (limpiando los mocks)
  const existing = getLocalReels().filter(v => v.id !== "jNQXAC9IVRw" && v.id !== "aqz-KE-bpKQ");
  
  const videoToSave = { ...video, addedAt: Date.now() };
  const updated = [videoToSave, ...existing];
  
  // Deduplicamos por ID
  const unique = updated.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  localStorage.setItem("campus_custom_reels", JSON.stringify(unique));
}

export function deleteLocalReel(id: string) {
  if (typeof window === "undefined") return;
  const existing = getLocalReels().filter(v => v.id !== "jNQXAC9IVRw" && v.id !== "aqz-KE-bpKQ");
  const filtered = existing.filter(v => v.id !== id);
  localStorage.setItem("campus_custom_reels", JSON.stringify(filtered));
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
