"use client";

import { useAuth } from "@/context/auth-context";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Settings, 
  Trophy, 
  ShieldCheck, 
  Bell, 
  ArrowLeft, 
  Camera, 
  Mail, 
  Calendar, 
  BookOpen, 
  Star,
  Zap,
  LogOut,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function PerfilPage() {
  const { username, userRole, onLogout, toggleTheme, theme } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full hover:bg-primary/20" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold text-primary">Mi Perfil</h1>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Columna Izquierda: Perfil Principal */}
          <motion.div className="lg:col-span-4 space-y-6" variants={itemVariants}>
            <div className="glass-card rounded-[2.5rem] p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-accent to-primary" />
              
              <div className="relative inline-block mb-6">
                <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-2xl ring-4 ring-background">
                  <AvatarImage src={`https://picsum.photos/seed/${username}/200`} />
                  <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                    {username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-10 w-10 border-4 border-background shadow-lg group-hover:scale-110 transition-transform">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <h2 className="text-3xl font-headline font-bold mb-1">{username}</h2>
              <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest px-4">
                {userRole === 'professor' ? 'Catedrático' : 'Estudiante Élite'}
              </Badge>

              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/20 border border-white/5">
                  <Mail className="w-5 h-5 text-primary" />
                  <div className="text-sm">
                    <p className="text-muted-foreground font-medium">Email</p>
                    <p className="font-semibold">{username?.toLowerCase().replace(/\s/g, '')}@campus.edu</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/20 border border-white/5">
                  <Calendar className="w-5 h-5 text-accent" />
                  <div className="text-sm">
                    <p className="text-muted-foreground font-medium">Miembro desde</p>
                    <p className="font-semibold">Marzo, 2024</p>
                  </div>
                </div>
              </div>

              <Button variant="destructive" className="w-full mt-8 rounded-2xl font-bold h-12 group" onClick={onLogout}>
                <LogOut className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Cerrar Sesión
              </Button>
            </div>

            <div className="glass-card rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> 
                Insignias de Logro
              </h3>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/20 p-2 rounded-xl">
                  <Star className="w-4 h-4 mr-1 fill-current" /> Líder
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20 p-2 rounded-xl">
                  <Zap className="w-4 h-4 mr-1 fill-current" /> Veloz
                </Badge>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/20 p-2 rounded-xl">
                  <BookOpen className="w-4 h-4 mr-1 fill-current" /> Lector
                </Badge>
              </div>
            </div>
          </motion.div>

          {/* Columna Derecha: Bento Grid de Ajustes y Actividad */}
          <motion.div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6" variants={containerVariants}>
            
            {/* Bloque de Ajustes (Doble Ancho en Desktop) */}
            <motion.div className="md:col-span-2 glass-card rounded-[2.5rem] p-8" variants={itemVariants}>
              <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Preferencias de Usuario
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-3xl bg-secondary/10 border border-white/5 group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Zap className="w-5 h-5" />
                      </div>
                      <span className="font-bold">Modo Oscuro</span>
                    </div>
                    <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-3xl bg-secondary/10 border border-white/5 group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <Bell className="w-5 h-5" />
                      </div>
                      <span className="font-bold">Notificaciones Push</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-6">
                   <Button variant="outline" className="w-full justify-between h-14 px-6 rounded-3xl border-white/10 hover:border-primary/50 group">
                    <span className="font-bold">Cambiar Contraseña</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" className="w-full justify-between h-14 px-6 rounded-3xl border-white/10 hover:border-primary/50 group">
                    <span className="font-bold">Privacidad y Seguridad</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Bloque de Estadísticas Académicas */}
            <motion.div className="glass-card rounded-[2.5rem] p-8 group hover:border-accent/40 transition-all" variants={itemVariants}>
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Desempeño</h4>
              <p className="text-muted-foreground text-sm mb-6">Tu actividad académica ha subido un 12% esta semana.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-3xl bg-secondary/20">
                  <p className="text-2xl font-black text-primary">92%</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Promedio</p>
                </div>
                <div className="text-center p-4 rounded-3xl bg-secondary/20">
                  <p className="text-2xl font-black text-accent">15</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Cursos</p>
                </div>
              </div>
            </motion.div>

            {/* Bloque de Actividad Reciente */}
            <motion.div className="glass-card rounded-[2.5rem] p-8 group hover:border-primary/40 transition-all" variants={itemVariants}>
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Actividad</h4>
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <p className="text-sm">Entregaste la tarea <span className="text-primary font-bold">Proyecto IA</span></p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5" />
                  <p className="text-sm">Iniciaste sesión desde un <span className="font-bold">nuevo dispositivo</span></p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <p className="text-sm">Completaste la lección <span className="font-bold text-green-500">Gramática B1</span></p>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
