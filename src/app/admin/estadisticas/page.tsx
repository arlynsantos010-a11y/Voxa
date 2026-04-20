"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, TrendingUp, Users, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const usageData = [
  { name: 'Lun', usuarios: 400, sesiones: 2400 },
  { name: 'Mar', usuarios: 300, sesiones: 1398 },
  { name: 'Mie', usuarios: 200, sesiones: 9800 },
  { name: 'Jue', usuarios: 278, sesiones: 3908 },
  { name: 'Vie', usuarios: 189, sesiones: 4800 },
  { name: 'Sab', usuarios: 239, sesiones: 3800 },
  { name: 'Dom', usuarios: 349, sesiones: 4300 },
];

export default function EstadisticasAdminPage() {
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
          <h1 className="font-headline text-2xl font-bold text-primary">Estadísticas Globales</h1>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="glass-card border-white/10 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <Users className="w-5 h-5 text-primary" />
              <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">+12%</Badge>
            </div>
            <p className="text-3xl font-black">1,284</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Usuarios Totales</p>
          </Card>

          <Card className="glass-card border-white/10 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <BookOpen className="w-5 h-5 text-accent" />
              <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">+5%</Badge>
            </div>
            <p className="text-3xl font-black">42</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Cursos Activos</p>
          </Card>

          <Card className="glass-card border-white/10 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <TrendingUp className="w-5 h-5 text-yellow-500" />
              <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10">-2%</Badge>
            </div>
            <p className="text-3xl font-black">8.4k</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Visitas Mensuales</p>
          </Card>

          <Card className="glass-card border-white/10 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <Clock className="w-5 h-5 text-emerald-500" />
              <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">+22%</Badge>
            </div>
            <p className="text-3xl font-black">45m</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Tiempo Promedio</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass-card border-white/10 rounded-[2.5rem] p-8">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-2xl font-headline font-bold">Tráfico de Usuarios</CardTitle>
            </CardHeader>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary)/0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.5}} />
                  <YAxis hide />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: 'white' }}
                  />
                  <Area type="monotone" dataKey="usuarios" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorUv)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="glass-card border-white/10 rounded-[2.5rem] p-8">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-2xl font-headline font-bold">Actividad de Sesiones</CardTitle>
            </CardHeader>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--accent)/0.1)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.5}} />
                  <YAxis hide />
                  <RechartsTooltip 
                    cursor={{fill: 'hsl(var(--primary)/0.05)'}}
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: 'white' }}
                  />
                  <Bar dataKey="sesiones" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
