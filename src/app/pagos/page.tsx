"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, ShieldCheck, Zap, Receipt, Download, Calendar, Wallet } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

const history = [
  { id: 1, date: "15 Jun, 2024", plan: "Plan Premium Anual", amount: "$199.00", status: "Pagado" },
  { id: 2, date: "15 Jun, 2023", plan: "Plan Premium Anual", amount: "$199.00", status: "Pagado" },
];

export default function PagosEstudiantePage() {
  const { userRole, username } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userRole !== 'student') router.push('/');
  }, [userRole, router]);

  if (userRole !== 'student') return null;

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/60 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4">
          <Button variant="ghost" size="icon" className="mr-4 rounded-full" asChild>
            <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold text-primary">Pagos y Membresía</h1>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Plan Actual */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass-card border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <Badge className="bg-primary/20 text-primary border-none mb-4 px-4 py-1 rounded-full font-bold tracking-widest text-[10px] uppercase">Plan Activo</Badge>
                      <h2 className="text-4xl font-headline font-black">Membresía <span className="text-primary">Premium</span></h2>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black">$199</p>
                      <p className="text-xs text-muted-foreground font-bold">Facturado anualmente</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-10">
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-secondary/20 border border-white/5">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Próxima renovación</p>
                        <p className="font-bold">15 de Junio, 2025</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-3xl bg-secondary/20 border border-white/5">
                      <CreditCard className="w-5 h-5 text-accent" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Método de pago</p>
                        <p className="font-bold">Visa **** 4421</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button size="lg" className="rounded-2xl font-bold h-14 px-8 shadow-xl shadow-primary/20">
                      Gestionar Suscripción
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-2xl font-bold h-14 px-8 border-white/10">
                      Cambiar Plan
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Historial */}
              <Card className="glass-card border-white/10 rounded-[2.5rem] p-8">
                <h3 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
                  <Receipt className="w-6 h-6 text-primary" /> Historial de Facturación
                </h3>
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-5 rounded-3xl bg-secondary/10 border border-white/5 hover:border-primary/40 transition-all group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold">{item.plan}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="font-black text-lg">{item.amount}</p>
                          <Badge className="bg-green-500/10 text-green-500 border-none px-2 text-[10px]">{item.status}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/20">
                          <Download className="w-5 h-5 text-primary" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Columna Lateral: Beneficios */}
            <div className="space-y-6">
              <Card className="glass-card border-white/10 rounded-[2.5rem] p-8 bg-gradient-to-br from-primary/10 to-transparent">
                <Zap className="w-10 h-10 text-primary mb-6" />
                <h4 className="text-xl font-bold mb-4">Ventajas Premium</h4>
                <ul className="space-y-4">
                  {[
                    "Acceso ilimitado a todos los cursos",
                    "Certificados de finalización oficiales",
                    "Descargas de materiales en alta calidad",
                    "Soporte prioritario 24/7",
                    "Clases en vivo exclusivas"
                  ].map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 text-sm">
                      <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="glass-card border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                  <Wallet className="w-8 h-8 text-accent" />
                </div>
                <h4 className="font-bold mb-2">Ayuda con Pagos</h4>
                <p className="text-xs text-muted-foreground mb-6">¿Tienes dudas sobre tu factura o quieres cambiar tu método de pago?</p>
                <Button variant="link" className="text-accent font-bold">Contactar Soporte</Button>
              </Card>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}