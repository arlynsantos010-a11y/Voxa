"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ref, get, set as setFirebase } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Settings, Globe, Bell, Shield, Palette, Zap, Mail, Smartphone, Video } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function ConfiguracionAdminPage() {
  const { userRole } = useAuth();
  const router = useRouter();
  const [playlistId, setPlaylistId] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    if (userRole !== 'admin') router.push('/');
    const saved = localStorage.getItem("campus_reels_playlist_id");
    if (saved) setPlaylistId(saved);

    // Cargar Whatsapp desde Firebase (si existe)
    get(ref(rtdb, 'settings/whatsapp')).then((snapshot) => {
      if (snapshot.exists()) setWhatsapp(snapshot.val());
    }).catch(console.error);

  }, [userRole, router]);

  const handleSave = async () => {
    localStorage.setItem("campus_reels_playlist_id", playlistId);
    try {
      await setFirebase(ref(rtdb, 'settings/whatsapp'), whatsapp);
      alert("¡Configuración guardada exitosamente en el servidor!");
    } catch (error) {
      console.error(error);
      alert("Error guardando el número de WhatsApp. Modifica las reglas de seguridad de Firebase.");
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
          <h1 className="font-headline text-2xl font-bold text-primary">Configuración Global</h1>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="glass-card border-white/10 rounded-[2.5rem] p-10">
            <h2 className="text-3xl font-headline font-bold mb-10 flex items-center gap-4">
              <Globe className="w-8 h-8 text-primary" /> Ajustes del Sistema
            </h2>
            
            <div className="space-y-10">
              {/* Sección de Apariencia Global */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-bold">Interfaz y Temas</h3>
                </div>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/10 border border-white/5 hover:border-primary/30 transition-colors">
                    <div>
                      <p className="font-bold">Tema Memphis Dinámico</p>
                      <p className="text-xs text-muted-foreground">Activar animaciones de fondo para todos los usuarios.</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/10 border border-white/5 hover:border-primary/30 transition-colors">
                    <div>
                      <p className="font-bold">Logo del Campus Personalizado</p>
                      <p className="text-xs text-muted-foreground">Permitir a los profesores subir sus propios logos.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Sección Multimedia / Reels */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-5 h-5 text-pink-500" />
                  <h3 className="text-lg font-bold">Contenido Multimedia (Reels)</h3>
                </div>
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4 p-6 rounded-3xl bg-secondary/10 border border-white/5 hover:border-primary/30 transition-colors">
                    <div>
                      <p className="font-bold">YouTube Playlist ID para el Feed</p>
                      <p className="text-xs text-muted-foreground">Pega el ID de la lista de reproducción pública de YouTube. Si queda vacío y validado, intentará usar la variable de entorno si hay una.</p>
                    </div>
                    <Input 
                      value={playlistId}
                      onChange={(e) => setPlaylistId(e.target.value)}
                      placeholder="Identificador de la Playlist de YouTube" 
                      className="bg-background/50 border-white/10 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Sección de Comunicación */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-lg font-bold">Comunicaciones y Notificaciones</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-4 p-6 rounded-3xl bg-secondary/10 border border-white/5 hover:border-primary/30 transition-colors col-span-full">
                    <div>
                      <p className="font-bold">Número de WhatsApp Principal (Soporte)</p>
                      <p className="text-xs text-muted-foreground">Escribe el número completo con el código de país (Ej: 521XXXXXXXXXX). Este número sustituirá al predeterminado en la ventana de Iniciar Sesión para que los alumnos te contacten.</p>
                    </div>
                    <Input 
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="Ej. 123456789" 
                      className="bg-background/50 border-white/10 rounded-xl max-w-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/10 border border-white/5">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <span className="font-bold">Emails de Bienvenida</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary/10 border border-white/5">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <span className="font-bold">Notificaciones Push</span>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator className="bg-white/5" />

              {/* Sección Avanzada */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-lg font-bold">Rendimiento y API</h3>
                </div>
                <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-red-500" />
                      <span className="font-bold text-red-500">Modo de Mantenimiento</span>
                    </div>
                    <Switch />
                  </div>
                  <p className="text-xs text-red-500/70">Al activar esto, solo los administradores podrán acceder a la plataforma. Todos los demás usuarios verán una pantalla de mantenimiento.</p>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={handleSave} size="lg" className="h-14 px-12 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                  Guardar Todos los Cambios
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
