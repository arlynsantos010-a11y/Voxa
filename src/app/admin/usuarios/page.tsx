"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus, Search, MoreVertical, Shield, User, GraduationCap, Trash2, Key, UserCircle, Globe2 } from "lucide-react";
import Link from "next/link";
import { users as initialUsers, UserData } from "@/components/auth/login-screen";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/app/page";

export default function GestionUsuariosPage() {
  const { userRole } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("student");
  const [newLanguage, setNewLanguage] = useState<string>("Inglés");
  const [newLevel, setNewLevel] = useState<string>("A1");

  useEffect(() => {
    if (userRole !== 'admin') router.push('/');
  }, [userRole, router]);

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.languages && user.languages.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername || !newPassword) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor, completa todos los campos para crear el usuario.",
      });
      return;
    }

    if (users.find(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
      toast({
        variant: "destructive",
        title: "Usuario ya existe",
        description: "El nombre de usuario ya está en uso.",
      });
      return;
    }

    const newUser: UserData = {
      username: newUsername,
      password: newPassword,
      role: newRole,
      languages: newRole === 'student' ? [newLanguage] : undefined,
      level: newRole === 'student' ? newLevel : undefined
    };

    setUsers([newUser, ...users]);
    setIsModalOpen(false);
    
    // Reset fields
    setNewUsername("");
    setNewPassword("");
    setNewRole("student");
    setNewLanguage("Inglés");
    setNewLevel("A1");

    toast({
      title: "Usuario Creado",
      description: `El usuario ${newUsername} ha sido añadido correctamente.`,
    });
  };

  const deleteUser = (username: string) => {
    setUsers(users.filter(u => u.username !== username));
    toast({
      title: "Usuario Eliminado",
      description: `Se ha eliminado a ${username} del sistema.`,
    });
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Shield className="w-4 h-4 text-red-500" />;
      case 'professor': return <GraduationCap className="w-4 h-4 text-primary" />;
      default: return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (userRole !== 'admin') return null;

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full" asChild>
            <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold text-primary">Gestión de Usuarios</h1>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nombre, rol o idioma..." 
              className="pl-10 glass-card border-white/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl font-bold shadow-lg shadow-primary/20 h-12">
                <UserPlus className="mr-2 h-5 w-5" /> Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
                  <UserPlus className="w-6 h-6" /> Crear Usuario
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Añade un nuevo miembro. Define sus credenciales, permisos e idioma de estudio.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest opacity-70">Nombre de Usuario</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                      <Input 
                        id="username" 
                        placeholder="Ej: jsmith" 
                        className="pl-10 bg-secondary/20 border-white/5 h-12 rounded-xl"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest opacity-70">Contraseña Temporal</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
                      <Input 
                        id="password" 
                        type="password"
                        placeholder="••••••••" 
                        className="pl-10 bg-secondary/20 border-white/5 h-12 rounded-xl"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs font-bold uppercase tracking-widest opacity-70">Rol del Sistema</Label>
                    <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                      <SelectTrigger className="bg-secondary/20 border-white/5 h-12 rounded-xl">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/10">
                        <SelectItem value="student" className="focus:bg-primary/20">Estudiante</SelectItem>
                        <SelectItem value="professor" className="focus:bg-primary/20">Profesor</SelectItem>
                        <SelectItem value="admin" className="focus:bg-primary/20">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newRole === 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language" className="text-xs font-bold uppercase tracking-widest opacity-70">Idioma</Label>
                        <Select value={newLanguage} onValueChange={setNewLanguage}>
                          <SelectTrigger className="bg-secondary/20 border-white/5 h-12 rounded-xl">
                            <SelectValue placeholder="Seleccionar idioma" />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="Inglés" className="focus:bg-primary/20">Inglés</SelectItem>
                            <SelectItem value="Francés" className="focus:bg-primary/20">Francés</SelectItem>
                            <SelectItem value="Alemán" className="focus:bg-primary/20">Alemán</SelectItem>
                            <SelectItem value="Italiano" className="focus:bg-primary/20">Italiano</SelectItem>
                            <SelectItem value="Portugués" className="focus:bg-primary/20">Portugués</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level" className="text-xs font-bold uppercase tracking-widest opacity-70">Nivel</Label>
                        <Select value={newLevel} onValueChange={setNewLevel}>
                          <SelectTrigger className="bg-secondary/20 border-white/5 h-12 rounded-xl">
                            <SelectValue placeholder="Seleccionar nivel" />
                          </SelectTrigger>
                          <SelectContent className="glass-card border-white/10">
                            <SelectItem value="A1" className="focus:bg-primary/20">A1 (Básico)</SelectItem>
                            <SelectItem value="A2" className="focus:bg-primary/20">A2 (Básico Alto)</SelectItem>
                            <SelectItem value="B1" className="focus:bg-primary/20">B1 (Intermedio)</SelectItem>
                            <SelectItem value="B2" className="focus:bg-primary/20">B2 (Interm. Alto)</SelectItem>
                            <SelectItem value="C1" className="focus:bg-primary/20">C1 (Avanzado)</SelectItem>
                            <SelectItem value="C2" className="focus:bg-primary/20">C2 (Nativo)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="pt-4">
                  <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">
                    Cancelar
                  </Button>
                  <Button type="submit" className="rounded-xl font-bold shadow-lg shadow-primary/20 px-8">
                    Crear Usuario
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-card border-white/10 rounded-[2rem] overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/20 border-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="font-bold">Usuario</TableHead>
                  <TableHead className="font-bold">Rol</TableHead>
                  <TableHead className="font-bold">Idioma de Estudio</TableHead>
                  <TableHead className="font-bold">Estado</TableHead>
                  <TableHead className="text-right font-bold">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.username} className="hover:bg-primary/5 border-white/5 transition-colors">
                    <TableCell className="font-medium py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                          {user.username.substring(0, 2).toUpperCase()}
                        </div>
                        {user.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="capitalize text-sm">{user.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.role === 'student' ? (
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-accent" />
                          <span className="text-sm font-semibold">{user.languages?.[0] || 'No asignado'}</span>
                          {user.level && (
                            <Badge variant="outline" className="text-[10px] ml-1 bg-white/5 border-white/10 text-white">
                              {user.level}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-500 border-none px-3">Activo</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10">
                          <DropdownMenuItem className="cursor-pointer">Editar</DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => deleteUser(user.username)}>
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
