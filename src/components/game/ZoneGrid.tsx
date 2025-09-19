'use client';

import { useContext } from 'react';
import { GameContext } from '@/context/GameContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ZoneGrid() {
  const context = useContext(GameContext);
  if (!context || !context.game) return null;

  const { zones, teams } = context.game;

  return (
    <Card className="h-full bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Zonas de Captura</CardTitle>
        <CardDescription>Escaneie os QR codes para capturar zonas para sua equipe!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {zones.map((zone) => {
            const capturedTeam = zone.capturedBy ? teams[zone.capturedBy] : null;
            const color = capturedTeam?.color;
            const isCaptured = !!capturedTeam;

            return (
              <div
                key={zone.id}
                className={cn(
                    "flex flex-col items-center justify-center gap-1 aspect-square rounded-lg p-1 transition-all duration-300 text-white font-bold text-xs shadow-md",
                    isCaptured ? 'text-black' : 'bg-muted hover:bg-muted/80'
                )}
                style={{
                  backgroundColor: isCaptured ? color : undefined,
                  boxShadow: isCaptured ? `0 0 15px -2px ${color}` : 'none',
                }}
              >
                <QrCode className={cn("w-6 h-6 transition-colors duration-300", isCaptured ? 'text-black/80' : 'text-muted-foreground')} />
                <span className={cn('text-center leading-tight', isCaptured ? 'text-black/90' : 'text-muted-foreground')}>
                   {zone.id.split('-')[1].toUpperCase()}
                </span>
                 {isCaptured ? (
                    <span className="text-center text-[10px] leading-tight font-semibold" style={{color: 'black'}}>Capturado</span>
                ) : (
                    <span className="text-center text-[10px] leading-tight font-semibold" style={{color: 'hsl(var(--muted-foreground))'}}>Capturar</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
