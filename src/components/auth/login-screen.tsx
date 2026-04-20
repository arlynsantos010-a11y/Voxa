
"use client";

import { useState } from "react";
import type { UserRole } from "@/app/page";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, SatelliteDish } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export interface UserData {
  username: string;
  password: string;
  role: UserRole;
  languages?: string[];
  level?: string;
}

export const users: UserData[] = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "profesor", password: "12345", role: "professor" },
  { username: "estudiante", password: "12345", role: "student", languages: ["Inglés", "Francés"], level: "B2" },
  { username: "AdminMaster", password: "AdminPassword123", role: "admin" },
  { username: "profe2", password: "abc", role: "professor" },
  { username: "Ana Torres", password: "password", role: "student", languages: ["Francés"], level: "A1" },
  { username: "Carlos Gomez", password: "password", role: "student", languages: ["Alemán", "Italiano"], level: "B1" },
];

export const studentUsers = users.filter(u => u.role === 'student');

export default function LoginScreen() {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { onLogin } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Buscamos el usuario ignorando mayúsculas y espacios innecesarios
    const foundUser = users.find(
      (u) => 
        u.username.toLowerCase().trim() === usernameInput.toLowerCase().trim() && 
        u.password === passwordInput.trim()
    );

    if (foundUser) {
      onLogin(foundUser.role, foundUser.username, foundUser.languages);
      toast({
        title: "¡Bienvenido!",
        description: `Has iniciado sesión como ${foundUser.username}.`,
      });
    } else {
      setError("Usuario o contraseña incorrectos.");
      toast({
        variant: "destructive",
        title: "Error de acceso",
        description: "Las credenciales no coinciden con nuestros registros.",
      });
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="w-full shadow-2xl glass-card border-primary/20 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center pt-10 pb-6">
            <CardTitle className="text-4xl font-headline font-bold text-primary flex items-center justify-center gap-3">
              <SatelliteDish className="w-10 h-10 animate-pulse text-primary" />
              Voxa
            </CardTitle>
            <CardDescription className="pt-2 text-foreground/80 font-medium">
              Ingresa tus credenciales para acceder a la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-12">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Usuario"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="bg-secondary/20 border-primary/10 h-14 rounded-2xl px-6 focus:ring-primary/50"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Contraseña"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="bg-secondary/20 border-primary/10 h-14 rounded-2xl px-6 focus:ring-primary/50"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl animate-shake">
                  <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-16 text-lg rounded-2xl font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <LogIn className="mr-2 h-6 w-6" />
                Iniciar Sesión
              </Button>
            </form>
            
            <p className="mt-8 text-center text-xs text-muted-foreground opacity-60 font-medium">
              Protección de datos garantizada por Voxa Seguridad.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
