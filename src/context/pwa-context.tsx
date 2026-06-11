"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Detectar si ya está instalada o ejecutándose en modo standalone
    const isStandalone = 
      typeof window !== "undefined" && (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://")
      );

    setIsInstalled(isStandalone);

    // 2. Escuchar el evento de instalación antes del prompt por defecto
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevenir el prompt automático
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 3. Escuchar el evento de app instalada con éxito
    const handleAppInstalled = () => {
      console.log("Voxa App instalada con éxito! 🎉");
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.warn("No hay un prompt de instalación disponible en este momento.");
      return false;
    }

    deferredPrompt.prompt(); // Mostrar el prompt nativo
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
      console.log("El usuario aceptó la instalación.");
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
      return true;
    } else {
      console.log("El usuario rechazó la instalación.");
      return false;
    }
  };

  return (
    <PWAContext.Provider value={{ isInstallable, isInstalled, promptInstall }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
