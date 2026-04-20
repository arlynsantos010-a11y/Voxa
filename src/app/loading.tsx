import { SatelliteDish } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-transparent">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
        <SatelliteDish className="w-16 h-16 text-primary animate-bounce relative z-10" />
      </div>
      <h2 className="mt-8 text-2xl font-headline font-bold text-foreground animate-pulse">
        Cargando CampusConnect...
      </h2>
      <p className="mt-2 text-muted-foreground text-sm font-medium">
        Preparando tu entorno de aprendizaje
      </p>
    </div>
  );
}
