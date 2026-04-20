'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Video, FileText, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function MaterialEstudiantePage() {
  const { userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userRole !== 'student') {
        router.push('/aula-virtual');
    }
  }, [userRole, router]);

  // Redirect if not a student
  if (userRole !== 'student') {
    return null; // Render nothing while redirecting
  }

  const viewOptions = [
    {
      title: 'Ver Materiales',
      icon: Download,
      href: '/aula-virtual/material-estudiante/materiales',
    },
    {
      title: 'Ver Videos',
      icon: Video,
      href: '/aula-virtual/material-estudiante/videos',
    },
    {
      title: 'Ver PDF',
      icon: FileText,
      href: '/aula-virtual/material-estudiante/pdfs',
    },
    {
      title: 'Ver Lección',
      icon: GraduationCap,
      href: '/aula-virtual/material-estudiante/lecciones',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-primary/10 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/aula-virtual">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-headline text-2xl font-bold text-primary">
            Material de Estudio
          </h1>
        </div>
      </header>
      <main className="container py-8 sm:py-12">
        <Card className="max-w-4xl mx-auto bg-secondary/20 border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Contenido del Curso</CardTitle>
            <CardDescription>
                Selecciona el tipo de material que deseas visualizar.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {viewOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Link href={option.href} key={option.title}>
                        <Card className="bg-secondary/30 hover:bg-secondary/60 hover:border-primary/50 transition-colors cursor-pointer h-full">
                            <CardContent className="p-6 flex items-center gap-6">
                                <Icon className="w-8 h-8 text-primary" />
                                <span className="text-lg font-semibold">{option.title}</span>
                            </CardContent>
                        </Card>
                      </Link>
                    );
                })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
