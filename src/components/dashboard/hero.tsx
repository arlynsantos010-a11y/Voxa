"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import type { UserRole } from "@/app/page";
import Link from "next/link";

type DashboardHeroProps = {
  userRole: UserRole;
  username: string | null;
};

export default function DashboardHero({ userRole, username }: DashboardHeroProps) {
  const isProfessor = userRole === "professor";
  const isAdmin = userRole === "admin";

  const getHeroDescription = () => {
    if (isAdmin) return "Acceso total a la configuración del sistema. Monitoriza el rendimiento global y gestiona la seguridad de la red.";
    if (isProfessor) return "Tu panel de control está actualizado. Revisa las entregas de hoy y prepara tus próximas sesiones virtuales.";
    return "Tienes 3 tareas pendientes para esta semana. Sigue con tu progreso y alcanza tus metas académicas.";
  };

  return (
    <section className="container mx-auto py-12 px-4">
      <div className="glass-card relative overflow-hidden rounded-[2.5rem] p-8 lg:p-16 border border-white/10">
        {/* Luces decorativas de fondo */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 ${isAdmin ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}
            >
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{isAdmin ? 'System Administrator' : 'Campus Virtual 2025'}</span>
            </motion.div>
            
            <motion.h1
              className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              ¡Hola de nuevo, <br />
              <span className={isAdmin ? "text-red-500" : "text-primary"}>{username || "Usuario"}</span>!
            </motion.h1>
            
            <motion.p
              className="mt-8 text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {getHeroDescription()}
            </motion.p>
            
            <motion.div
              className="mt-12 flex flex-wrap gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {!isAdmin && (
                <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl group shadow-2xl shadow-primary/20" asChild>
                  <Link href="/aula-virtual">
                    Entrar al Aula
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
              {isAdmin && (
                <Button size="lg" variant="destructive" className="h-16 px-10 text-lg font-bold rounded-2xl group shadow-2xl shadow-red-500/20">
                  Gestión del Sistema
                  <ShieldCheck className="ml-2 w-5 h-5" />
                </Button>
              )}
              <Button variant="outline" size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all" asChild>
                  <Link href="/perfil">Mi Perfil</Link>
              </Button>
            </motion.div>
          </div>
          
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, scale: 1, rotate: -5 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <div className="glass-card w-80 h-80 rounded-[4rem] flex items-center justify-center border-white/20 shadow-2xl relative">
               {isAdmin ? <ShieldCheck className="w-48 h-48 text-red-500 animate-float" /> : <GraduationCap className="w-48 h-48 text-primary animate-float" />}
               <div className="absolute -bottom-6 -right-6 glass-card p-4 rounded-2xl border-primary/20 animate-bounce">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isAdmin ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className="text-xs font-bold">{isAdmin ? 'ADMIN ACTIVE' : 'EN VIVO'}</span>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
