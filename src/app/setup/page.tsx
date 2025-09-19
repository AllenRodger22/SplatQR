'use client';

import { useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import ClientOnly from '@/components/client-only';
import { Loader2, Users, Vote } from 'lucide-react';
import { TeamCard } from '@/components/setup/TeamCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SetupPage() {
  const router = useRouter();
  const context = useContext(GameContext);
  const { game, player, voteToStart } = context || {};

  useEffect(() => {
    if (!player) router.push('/');
    if (game?.status === 'playing' || game?.status === 'finished') router.push('/game');
  }, [player, game, router]);

  const canStartGame = useMemo(() => {
    if (!game) return false;
    return game.teams.splatSquad.players.length >= 2 && game.teams.inkMasters.players.length >= 2;
  }, [game]);

  const playerHasVoted = useMemo(() => {
    if (!game || !player) return false;
    return game.votes[15].includes(player.id) || game.votes[30].includes(player.id);
  }, [game, player]);

  if (!game || !player) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Loading game setup...</p>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="container mx-auto min-h-screen p-4 md:p-8 animate-in fade-in duration-500">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tighter text-primary">Game Setup</h1>
          <p className="text-xl text-muted-foreground mt-2">Assemble your teams and get ready to splat!</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TeamCard teamId="splatSquad" />
          <TeamCard teamId="inkMasters" />
        </div>

        <Card className="animate-bounce-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-3xl">
              <Vote className="h-8 w-8 text-accent" />
              Vote for Game Duration
            </CardTitle>
            <CardDescription>
              {canStartGame 
                ? 'The first vote will start the match! Each team needs at least 2 players.'
                : 'Each team needs at least 2 players to start the game.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="w-full h-16 text-2xl transition-transform hover:scale-105" 
              onClick={() => voteToStart?.(15)} 
              disabled={!canStartGame || playerHasVoted}
            >
              15 Minutes
              <div className="ml-2 flex items-center text-sm bg-background/50 rounded-full px-2 py-1">
                <Users className="h-4 w-4 mr-1"/> {game.votes[15].length}
              </div>
            </Button>
            <Button 
              className="w-full h-16 text-2xl transition-transform hover:scale-105"
              onClick={() => voteToStart?.(30)}
              disabled={!canStartGame || playerHasVoted}
            >
              30 Minutes
               <div className="ml-2 flex items-center text-sm bg-background/50 rounded-full px-2 py-1">
                <Users className="h-4 w-4 mr-1"/> {game.votes[30].length}
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ClientOnly>
  );
}
