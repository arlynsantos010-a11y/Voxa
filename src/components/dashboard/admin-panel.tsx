"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Settings, BarChart3, ShieldAlert, Database, Globe, Wallet, Languages, ChevronRight, PlaySquare } from "lucide-react";
import Link from 'next/link';
import { motion } from "framer-motion";

const adminItems = [
    {
      title: "Gestión de Usuarios",
      icon: Users,
      href: "/admin/usuarios",
      description: "Administra cuentas de estudiantes y profesores.",
      color: "from-blue-500 to-indigo-500",
      size: "lg:col-span-2"
    },
    {
      title: "Catálogo de Idiomas",
      icon: Languages,
      href: "/admin/idiomas",
      description: "Configura la oferta global de idiomas y niveles.",
      color: "from-orange-500 to-amber-500",
      size: "lg:col-span-1"
    },
    {
      title: "Finanzas y Pagos",
      icon: Wallet,
      href: "/admin/pagos",
      description: "Control de ingresos, facturación y suscripciones.",
      color: "from-emerald-500 to-green-400",
      size: "lg:col-span-1"
    },
    {
      title: "Seguridad",
      icon: ShieldAlert,
      href: "/admin/seguridad",
      description: "Logs de acceso y permisos del sistema.",
      color: "from-red-500 to-orange-500",
      size: "lg:col-span-1"
    },
    {
      title: "Estadísticas Globales",
      icon: BarChart3,
      href: "/admin/estadisticas",
      description: "Métricas de uso y rendimiento de la plataforma.",
      color: "from-cyan-500 to-blue-500",
      size: "lg:col-span-1"
    },
    {
      title: "Base de Datos",
      icon: Database,
      href: "/admin/database",
      description: "Mantenimiento y respaldos del sistema.",
      color: "from-purple-500 to-pink-500",
      size: "lg:col-span-1"
    },
    {
      title: "Gestión de Reels",
      icon: PlaySquare,
      href: "/admin/reels-manager",
      description: "Sube, elimina y organiza contenido de video corto.",
      color: "from-pink-500 to-rose-400",
      size: "lg:col-span-1"
    },
    {
      title: "Configuración Global",
      icon: Settings,
      href: "/admin/configuracion",
      description: "Ajustes generales de la infraestructura.",
      color: "from-amber-500 to-orange-400",
      size: "lg:col-span-1"
    }
]

export default function AdminPanel() {
  return (
    <section className="py-10">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
           <Globe className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <h2 className="font-headline text-4xl font-extrabold tracking-tight">Panel de Administración Central</h2>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
          Control total sobre la infraestructura, oferta educativa y seguridad de CampusConnect.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ delay: idx * 0.05, type: "spring", stiffness: 300 }}
              className={item.size}
            >
              <Link href={item.href}>
                <Card className="glass-card h-full group hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden border-white/10 rounded-[2.5rem]">
                  <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${item.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <CardHeader className="flex flex-row items-center gap-6 p-8 relative">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                        <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  );
}
