"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Languages, Plus, Search, Trash2, Edit, Globe, Star, Users } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const initialLanguages = [
  { id: 1, name: 'Inglés', students: 842, courses: 24, status: 'activo', icon: '🇬🇧' },
  { id: 2, name: 'Francés', students: 156, courses: 12, status: 'activo', icon: '🇫🇷' },
  { id: 3, name: 'Alemán', students: 98, courses: 8, status: 'activo', icon: '🇩🇪' },
  { id: 4, name: 'Italiano', students: 45, courses: 6, status: 'activo', icon: '🇮🇹' },
];

export default function AdminIdiomasPage() {
  const { userRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

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
          <div className="flex items-center gap-2">
            <Languages className="w-6 h-6 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary">Configuración de Catálogo</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="glass-card border-white/10 p-6 rounded-3xl">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/20 text-primary">
                    <Globe className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-black">6</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase">Idiomas Activos</p>
                </div>
            </div>
          </Card>
          <Card className="glass-card border-white/10 p-6 rounded-3xl">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-accent/20 text-accent">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-black">1.1k</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase">Total Alumnos</p>
                </div>
            </div>
          </Card>
          <Card className="glass-card border-white/10 p-6 rounded-3xl">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-yellow-500/20 text-yellow-500">
                    <Star className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-2xl font-black">48</p>
                    <p className="text-xs text-muted-foreground font-bold uppercase">Módulos Creados</p>
                </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar idiomas..." 
                    className="pl-10 rounded-xl bg-secondary/20 border-white/5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button className="rounded-2xl font-bold h-12 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-5 w-5" /> Nuevo Idioma
            </Button>
        </div>

        <Card className="glass-card border-white/10 rounded-[2.5rem] overflow-hidden">
            <Table>
                <TableHeader className="bg-secondary/20 border-white/5">
                    <TableRow className="hover:bg-transparent border-white/5">
                        <TableHead className="font-bold">Idioma</TableHead>
                        <TableHead className="font-bold">Estudiantes</TableHead>
                        <TableHead className="font-bold">Cursos</TableHead>
                        <TableHead className="font-bold">Estado</TableHead>
                        <TableHead className="text-right font-bold">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {initialLanguages.map((lang) => (
                        <TableRow key={lang.id} className="hover:bg-primary/5 border-white/5 transition-colors">
                            <TableCell className="py-5">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{lang.icon}</span>
                                    <span className="font-bold text-lg">{lang.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">{lang.students}</TableCell>
                            <TableCell className="font-medium">{lang.courses}</TableCell>
                            <TableCell>
                                <Badge className="bg-green-500/10 text-green-500 border-none px-3 font-bold">
                                    {lang.status.toUpperCase()}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/20"><Edit className="w-4 h-4 text-primary" /></Button>
                                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/20"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
      </main>
    </div>
  );
}
