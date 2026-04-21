
"use client";

import { useState, useEffect } from "react";
import type { UserRole } from "@/app/page";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, SatelliteDish } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { ref, get } from "firebase/database";
import { rtdb } from "@/lib/firebase";

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
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const { toast } = useToast();
  const { onLogin } = useAuth();

  useEffect(() => {
    // Intentar leer el Whatsapp personalizado desde Firebase
    try {
      get(ref(rtdb, 'settings/whatsapp')).then((snapshot) => {
        if (snapshot.exists()) {
          setWhatsappNumber(snapshot.val());
        }
      }).catch((e) => {
        console.warn("No se pudo obtener el whatsapp dinámico, usando por defecto.", e);
      });
    } catch (e) {
      console.warn("Lectura fallida", e);
    }
  }, []);

  const handleWhatsApp = () => {
    const wa = whatsappNumber || "1234567890"; // Reemplaza "1234567890" por tu número principal seguro en caso de fallas.
    window.open(`https://wa.me/${wa}`, "_blank");
  };

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

              <div className="space-y-4">
                <Button type="submit" className="w-full h-16 text-lg rounded-2xl font-black shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <LogIn className="mr-2 h-6 w-6" />
                  Iniciar Sesión
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background/80 px-2 text-muted-foreground font-bold tracking-widest backdrop-blur-sm">O</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleWhatsApp}
                  className="w-full h-16 text-lg rounded-2xl font-black bg-[#25D366]/10 text-[#25D366] border-[#25D366]/20 transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-[#25D366]/20 hover:text-[#25D366]"
                >
                  <svg className="mr-2 w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Opción de WhatsApp
                </Button>
              </div>
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
