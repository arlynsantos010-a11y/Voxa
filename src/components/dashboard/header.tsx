"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, SatelliteDish, Sun, Moon, Bell } from "lucide-react";
import type { UserRole } from "@/app/page";
import { useAuth } from "@/context/auth-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DashboardHeaderProps = {
  userRole: UserRole;
  onLogout: () => void;
};

export default function DashboardHeader({
  userRole,
  onLogout,
}: DashboardHeaderProps) {
  const { theme, toggleTheme } = useAuth();

  const getRoleBadgeLabel = () => {
    switch(userRole) {
      case 'admin': return 'MODO ADMINISTRADOR';
      case 'professor': return 'MODO PROFESOR';
      default: return 'MODO ESTUDIANTE';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-auto flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <SatelliteDish className="w-6 h-6 text-primary" />
            <span className="font-headline font-bold text-2xl text-primary">
              Voxa
            </span>
          </Link>
          <span className={`hidden sm:inline-block rounded-full px-3 py-1 text-xs font-bold ${userRole === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
            {getRoleBadgeLabel()}
          </span>
        </div>
        <nav className="flex items-center justify-end space-x-2 sm:space-x-4">
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-background" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="glass-card w-80 p-4 border-white/10 rounded-2xl">
              <h4 className="font-bold mb-4 flex items-center justify-between">
                Notificaciones
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">3 NUEVAS</span>
              </h4>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-secondary/20 border border-white/5">
                  <p className="text-xs font-bold">¡Nueva tarea!</p>
                  <p className="text-[10px] text-muted-foreground">Tu profesor de Francés subió un nuevo ejercicio.</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/20 border border-white/5">
                  <p className="text-xs font-bold">Clase programada</p>
                  <p className="text-[10px] text-muted-foreground">Mañana a las 10:00 AM: Conversación B1.</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-xs font-bold text-primary">Tip de IA ✨</p>
                  <p className="text-[10px] text-muted-foreground">Prueba el nuevo Tutor IA para mejorar tu habla.</p>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="rounded-full text-primary hover:bg-primary/10"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="rounded-full border-primary/20 hover:bg-primary/10"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
