"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, BarChart3, GraduationCap, Languages, Sparkles, ChevronRight } from "lucide-react";
import Link from 'next/link';
import { motion } from 'framer-motion';

const panelItems = [
    {
      title: "Aula Virtual",
      icon: GraduationCap,
      href: "/aula-virtual",
      description: "Accede a tus clases, materiales y gestión de alumnos.",
      color: "bg-chart-1/20 text-chart-1"
    },
    {
      title: "Planificación Lingüística",
      icon: Languages,
      href: "/admin/idiomas",
      description: "Crea contenido educativo y gestiona niveles de idiomas.",
      color: "bg-chart-2/20 text-chart-2"
    },
    {
      title: "Análisis de Progreso",
      icon: BarChart3,
      href: "/admin/estadisticas",
      description: "Visualiza el desempeño detallado de tus alumnos y grupos.",
      color: "bg-chart-4/20 text-chart-4"
    }
]

export default function ProfessorPanel() {
  return (
    <section className="py-10">
       <div className="text-center mb-16">
        <h2 className="font-headline text-4xl font-extrabold tracking-tight">Panel de Control Académico</h2>
        <p className="text-muted-foreground mt-4 text-lg">Administra tu oferta educativa y haz seguimiento a tus clases virtuales.</p>
      </div>
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {panelItems.map((item, idx) => {
          const Icon = item.icon;
          return (
             <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300 }}
             >
              <Link href={item.href}>
                  <Card className="glass-card border-white/10 hover:border-primary/40 transition-all duration-500 h-full cursor-pointer group rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="flex flex-col items-start gap-6 p-10">
                       <div className={`p-5 rounded-2xl ${item.color.split(' ')[0]} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <Icon className={`w-8 h-8 ${item.color.split(' ')[1]}`} />
                      </div>
                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-2xl font-bold">{item.title}</CardTitle>
                          <ChevronRight className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{item.description}</p>
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
