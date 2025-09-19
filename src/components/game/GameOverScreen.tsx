'use client';

import { useContext } from 'react';
import { GameContext } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Crown, User, X } from 'lucide-react';
import { TeamId } from '@/lib/types';
import { cn } from '@/lib/utils';

export function GameOverScreen() {
  const context = useContext(GameContext);
  const { game, resetGame } = context || {};

  if (!game || game.status !== 'finished') return null;

  const getWinnerText = () => {
    if (game.winner === 'draw') {
      return { text: "É um Empate!", color: 'text-gray-400' };
    }
    if (game.winner) {
      const winnerTeam = game.teams[game.winner as TeamId];
      return { text: `${winnerTeam.name} Venceu!`, color: winnerTeam.color };
    }
    return { text: 'Fim de Jogo!', color: 'text-white' };
  };

  const { text, color } = getWinnerText();
  const isDraw = game.winner === 'draw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-in fade-in">
      <div className="relative w-full max-w-lg m-4 p-8 bg-background border-4 border-primary rounded-xl shadow-2xl shadow-primary/40 text-center animate-bounce-in">
        {!isDraw && <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-20 text-yellow-400" />}
        <h2 className="text-2xl font-bold text-muted-foreground mb-2">Fim de Jogo</h2>
        <h1
          className={cn("text-6xl font-black tracking-tighter transition-colors", isDraw && 'text-foreground')}
          style={!isDraw ? { color: color } : {}}
        >
          {text}
        </h1>

        <div className="my-8 flex justify-around items-end">
          {Object.entries(game.teams).map(([id, team]) => {
             const score = game.zones.filter(z => z.capturedBy === id).length;
             const total = game.zones.length;
             const percentage = total > 0 ? (score / total) * 100 : 0;

            return (
                <div key={id} className="flex flex-col items-center gap-2">
                    <div className="text-xl font-bold" style={{color: team.color}}>{team.name}</div>
                    <div className="text-4xl font-black" style={{color: team.color}}>{percentage.toFixed(0)}%</div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-4 w-4" /> {team.players.length}
                    </div>
                </div>
            )
          })}
        </div>

        <Button onClick={resetGame} className="w-full h-14 text-xl font-bold mt-4 transition-transform hover:scale-105">
          Jogar Novamente
        </Button>
      </div>
    </div>
  );
}
