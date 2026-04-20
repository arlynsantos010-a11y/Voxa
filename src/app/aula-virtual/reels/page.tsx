import { VideoFeed } from "@/components/reels/video-feed";
import { Metadata } from "next";
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlaySquare } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Reels | CampusConnect',
  description: 'Explora videos cortos y contenido educativo en formato Reels.',
};

export default function ReelsPage() {
  return (
    <div className="min-h-screen pb-10 bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full" asChild>
            <Link href="/aula-virtual"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center gap-2">
            <PlaySquare className="w-6 h-6 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary">Reels Educativos</h1>
          </div>
        </div>
      </header>

      {/* Main container to fit between the header and bottom of screen */}
      <main className="container mx-auto py-6 px-4 flex justify-center overflow-hidden h-[calc(100vh-7rem)]">
        <VideoFeed />
      </main>
    </div>
  );
}
