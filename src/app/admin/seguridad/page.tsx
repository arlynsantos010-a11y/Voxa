"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldCheck, Activity, Key, Lock, Eye, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const securityLogs = [
  { id: 1, event: "Inicio de sesión exitoso", user: "AdminMaster", time: "Hace 2 mins", status: "success" },
  { id: 2, event: "Intento fallido de login", user: "Desconocido", time: "Hace 15 mins", status: "warning" },
  { id: 3, event: "Cambio de contraseña", user: "Ana Torres", time: "Hace 1 hora", status: "info" },
  { id: 4, event: "Acceso denegado a BD", user: "profe2", time: "Hace 3 horas", status: "error" },
];

export default function SeguridadAdminPage() {
  const { userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userRole !== 'admin') router.push('/');
  }, [userRole, router]);

  if (userRole !== 'admin') return null;

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full" asChild>
            <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold text-primary">Seguridad y Auditoría</h1>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <Card className="glass-card border-white/10 rounded-[2rem] p-6 group">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Firewall Activo</h3>
            <p className="text-sm text-muted-foreground">Protección de red de Capa 7 configurada y filtrando peticiones.</p>
          </Card>
          
          <Card className="glass-card border-white/10 rounded-[2rem] p-6 group">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-4 group-hover:scale-110 transition-transform">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">2FA Global</h3>
            <p className="text-sm text-muted-foreground">Autenticación de dos factores requerida para roles administrativos.</p>
          </Card>

          <Card className="glass-card border-white/10 rounded-[2rem] p-6 group">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Monitoreo en Vivo</h3>
            <p className="text-sm text-muted-foreground">Sistema de detección de intrusiones analizando tráfico actual.</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-card border-white/10 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8">
              <Activity className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-headline font-bold">Logs de Actividad</h2>
            </div>
            <div className="space-y-4">
              {securityLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-white/5 hover:border-primary/30 transition-all">
                  <div className="flex gap-4 items-center">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'error' ? 'bg-red-500' : 
                      log.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-bold text-sm">{log.event}</p>
                      <p className="text-xs text-muted-foreground">Por: {log.user}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-card border-white/10 rounded-[2.5rem] p-8">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-headline font-bold">Acciones de Seguridad</h2>
            </div>
            <div className="grid gap-4">
              <Button variant="outline" className="w-full justify-between h-14 px-6 rounded-2xl border-white/10 hover:border-red-500/50 group">
                <span className="font-bold">Invalidar todas las sesiones</span>
                <AlertTriangle className="w-5 h-5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-14 px-6 rounded-2xl border-white/10 hover:border-primary/50 group">
                <span className="font-bold">Actualizar claves de cifrado</span>
                <Key className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-14 px-6 rounded-2xl border-white/10 hover:border-accent/50 group">
                <span className="font-bold">Generar reporte de cumplimiento</span>
                <Activity className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
