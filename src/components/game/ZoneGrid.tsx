'use client';

import { useContext } from 'react';
import { GameContext } from '@/context/GameContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag } from 'lucide-react';

export function ZoneGrid() {
  const context = useContext(GameContext);
  if (!context || !context.game) return null;

  const { zones, teams } = context.game;

  return (
    <Card className="h-full">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Zonas de Captura</CardTitle>
        <CardDescription>Escaneie os QR codes para capturar zonas para sua equipe!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {zones.map((zone, index) => {
            const color = zone.capturedBy ? teams[zone.capturedBy].color : 'hsl(var(--muted))';
            return (
              <div
                key={zone.id}
                className="flex flex-col items-center justify-center gap-2 aspect-square bg-secondary rounded-lg p-2 transition-all duration-300"
                style={{
                  boxShadow: zone.capturedBy ? `0 0 15px -2px ${color}` : 'none',
                  border: zone.capturedBy ? `2px solid ${color}` : '2px solid transparent'
                }}
              >
                <Flag className="w-8 h-8 md:w-10 md:h-10 transition-colors duration-300" style={{ color }} />
                <span className="font-bold text-sm text-muted-foreground">{zone.id.split('-')[1].toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
