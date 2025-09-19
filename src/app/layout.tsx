import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { GameProvider } from '@/context/GameContext';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'SplatQR',
  description: 'A Capture the Flag game inspired by Splatoon',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Poppins:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
          "antialiased font-sans",
        )}>
        <GameProvider>
          <main>{children}</main>
          <Toaster />
        </GameProvider>
      </body>
    </html>
  );
}
