"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Database, HardDrive, Save, RefreshCw, Trash2, CheckCircle2, Cloud } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

export default function DatabaseAdminPage() {
  const { userRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbHealth, setDbHealth] = useState(98);

  useEffect(() => {
    if (userRole !== 'admin') router.push('/');
  }, [userRole, router]);

  const handleBackup = () => {
    toast({ title: "Backup Iniciado", description: "Se está generando un punto de restauración del sistema." });
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: "Sincronización Exitosa", description: "Todos los nodos están actualizados." });
    }, 2000);
  };

  if (userRole !== 'admin') return null;

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full" asChild>
            <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold text-primary">Mantenimiento de Datos</h1>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="glass-card border-white/10 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-headline font-bold">Estado de Firestore</h2>
                  <p className="text-sm text-muted-foreground">Instancia principal de CampusConnect-DB</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Salud del Nodo</span>
                  <span className="text-2xl font-black text-primary">{dbHealth}%</span>
                </div>
                <Progress value={dbHealth} className="h-3 bg-secondary/20" indicatorClassName="bg-primary" />
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-secondary/10 border border-white/5">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Total Lecturas</p>
                    <p className="text-xl font-bold">1.2M</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/10 border border-white/5">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Total Escrituras</p>
                    <p className="text-xl font-bold">450k</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="glass-card border-white/10 rounded-[2rem] p-6 hover:border-primary/40 transition-all group">
                <Cloud className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Google Cloud Sync</h3>
                <p className="text-sm text-muted-foreground mb-6">Sincroniza los metadatos globales con el almacenamiento central.</p>
                <Button onClick={handleSync} disabled={isSyncing} className="w-full rounded-xl font-bold">
                  {isSyncing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Sincronizar Ahora
                </Button>
              </Card>

              <Card className="glass-card border-white/10 rounded-[2rem] p-6 hover:border-accent/40 transition-all group">
                <Save className="w-10 h-10 text-accent mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Backups Diarios</h3>
                <p className="text-sm text-muted-foreground mb-6">Genera un respaldo instantáneo de toda la base de datos.</p>
                <Button variant="outline" onClick={handleBackup} className="w-full rounded-xl font-bold border-white/10 hover:bg-accent/10">
                  <Save className="mr-2 h-4 w-4" /> Ejecutar Backup
                </Button>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="glass-card border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-primary" /> Almacenamiento
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold">Media Files (Bucket)</span>
                    <span>15.4 GB / 50 GB</span>
                  </div>
                  <Progress value={30} className="h-2 bg-secondary/20" indicatorClassName="bg-primary" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold">Database Logs</span>
                    <span>1.2 GB / 5 GB</span>
                  </div>
                  <Progress value={24} className="h-2 bg-secondary/20" indicatorClassName="bg-accent" />
                </div>
              </div>
            </Card>

            <Card className="glass-card border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xl font-bold mb-6">Acciones Críticas</h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 rounded-xl font-bold">
                  <Trash2 className="mr-2 h-4 w-4" /> Purgar Caché Global
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 rounded-xl font-bold">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> Optimizar Índices
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
