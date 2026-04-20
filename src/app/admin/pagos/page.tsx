"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Wallet, TrendingUp, Users, Receipt, Download, Filter, Search, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const revenueData = [
  { month: 'Ene', income: 4500 },
  { month: 'Feb', income: 5200 },
  { month: 'Mar', income: 4800 },
  { month: 'Abr', income: 6100 },
  { month: 'May', income: 5900 },
  { month: 'Jun', income: 7200 },
];

const transactions = [
  { id: "#TRX-9021", user: "Ana Torres", plan: "Premium Anual", amount: "$199.00", date: "22/06/2024", status: "completado" },
  { id: "#TRX-9022", user: "Carlos Gomez", plan: "Mensual", amount: "$19.00", date: "21/06/2024", status: "completado" },
  { id: "#TRX-9023", user: "Sofia Rodriguez", plan: "Premium Anual", amount: "$199.00", date: "20/06/2024", status: "pendiente" },
  { id: "#TRX-9024", user: "Arlyn", plan: "Mensual", amount: "$19.00", date: "19/06/2024", status: "error" },
];

export default function PagosAdminPage() {
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
          <h1 className="font-headline text-2xl font-bold text-primary">Gestión Financiera</h1>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="glass-card border-white/10 p-6 rounded-3xl overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <TrendingUp className="w-5 h-5 text-primary mb-4" />
            <p className="text-3xl font-black">$34,250</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Ingresos Totales (2024)</p>
          </Card>

          <Card className="glass-card border-white/10 p-6 rounded-3xl overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <Users className="w-5 h-5 text-accent mb-4" />
            <p className="text-3xl font-black">124</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Suscripciones Activas</p>
          </Card>

          <Card className="glass-card border-white/10 p-6 rounded-3xl overflow-hidden relative group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <Receipt className="w-5 h-5 text-yellow-500 mb-4" />
            <p className="text-3xl font-black">98%</p>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Tasa de Retención</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <Card className="glass-card border-white/10 rounded-[2.5rem] p-8">
            <h3 className="text-2xl font-headline font-bold mb-8">Tendencia de Ingresos</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--primary)/0.1)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.5}} />
                  <YAxis hide />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: 'white' }}
                  />
                  <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="glass-card border-white/10 rounded-[2.5rem] p-8">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-headline font-bold">Distribución de Planes</h3>
                <Button variant="ghost" size="sm" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Reporte</Button>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--accent)/0.1)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'currentColor', opacity: 0.5}} />
                  <YAxis hide />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: 'white' }}
                  />
                  <Bar dataKey="income" fill="hsl(var(--accent))" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="glass-card border-white/10 rounded-[2.5rem] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between">
            <h3 className="text-2xl font-headline font-bold">Transacciones Recientes</h3>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar transacciones..." className="pl-10 rounded-xl bg-secondary/20 border-white/5" />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl border-white/5"><Filter className="w-4 h-4" /></Button>
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/20 border-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="font-bold">ID Transacción</TableHead>
                  <TableHead className="font-bold">Usuario</TableHead>
                  <TableHead className="font-bold">Plan</TableHead>
                  <TableHead className="font-bold">Monto</TableHead>
                  <TableHead className="font-bold">Fecha</TableHead>
                  <TableHead className="font-bold text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((trx) => (
                  <TableRow key={trx.id} className="hover:bg-primary/5 border-white/5 transition-colors">
                    <TableCell className="font-mono text-xs">{trx.id}</TableCell>
                    <TableCell className="font-bold">{trx.user}</TableCell>
                    <TableCell className="text-muted-foreground">{trx.plan}</TableCell>
                    <TableCell className="font-black">{trx.amount}</TableCell>
                    <TableCell className="text-sm">{trx.date}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={`
                        px-3 rounded-full border-none font-bold
                        ${trx.status === 'completado' ? 'bg-green-500/10 text-green-500' : 
                          trx.status === 'pendiente' ? 'bg-yellow-500/10 text-yellow-500' : 
                          'bg-red-500/10 text-red-500'}
                      `}>
                        {trx.status.toUpperCase()}
                      </Badge>
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