'use client';

import { useContext } from 'react';
import { GameContext } from '@/context/GameContext';
import type { TeamId } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface TeamPanelProps {
  teamId: TeamId;
  score: number;
}

export function TeamPanel({ teamId, score }: TeamPanelProps) {
  const context = useContext(GameContext);
  if (!context || !context.game) return null;

  const team = context.game.teams[teamId];
  const captureStats = context.game.captureStats;
  const totalCaptures = captureStats?.totalCaptures?.[teamId] ?? 0;
  const recaptures = captureStats?.recaptures?.[teamId] ?? 0;

  return (
    <Card className="h-full flex flex-col" style={{'--team-color': team.color} as React.CSSProperties}>
      <CardHeader>
        <CardTitle className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-3">
                 <div className="w-3 h-6 rounded-full bg-[var(--team-color)]" />
                 <span className='text-2xl'>{team.name}</span>
            </div>
            <span className="text-5xl font-black text-[var(--team-color)]">
              {score.toFixed(0)}%
            </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <h4 className="font-semibold text-center text-muted-foreground">Jogadores ({team.players.length})</h4>
         <div className="space-y-2">
            {team.players.map(p => (
              <div key={p.id} className={cn(
                  "flex items-center gap-3 p-2 rounded-md transition-all",
                   context.player?.id === p.id && "bg-primary/20 ring-2 ring-primary"
                   )}>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-transparent text-2xl">{p.emoji}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-lg">{p.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-border/40 bg-background/60 p-3 text-center shadow-inner backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Estatísticas</p>
            <div className="mt-2 flex flex-col gap-1 text-sm font-semibold text-muted-foreground">
              <span>
                Capturas: <span className="text-foreground">{totalCaptures}</span>
              </span>
              <span>
                Recapturas: <span className="text-foreground">{recaptures}</span>
              </span>
            </div>
          </div>
      </CardContent>
    </Card>
  );
}
