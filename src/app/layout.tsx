import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { CreativeBackground } from '@/components/ui/creative-background';

export const metadata: Metadata = {
  title: {
    template: '%s | Voxa',
    default: 'Voxa - Plataforma de Aprendizaje',
  },
  description: 'Sistema educativo moderno y tutor virtual con Inteligencia Artificial.',
  keywords: ['educación', 'plataforma', 'clases virtuales', 'tutor ia', 'campus'],
  authors: [{ name: 'Voxa Team' }],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Voxa',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;700;800&family=Rajdhani:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased relative min-h-screen">
        <AuthProvider>
          <CreativeBackground />
          <div className="relative z-10 min-h-screen flex flex-col">
            {children}
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
