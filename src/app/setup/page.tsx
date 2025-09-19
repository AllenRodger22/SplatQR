'use client';

import { useContext, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import ClientOnly from '@/components/client-only';
import { Loader2, Users, Vote, CheckCircle, Gamepad2 } from 'lucide-react';
import { TeamCard } from '@/components/setup/TeamCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SetupPage() {
  const router = useRouter();
  const context = useContext(GameContext);
  const { game, player, voteToStart, toggleReady } = context || {};

  const playerIsInTeam = useMemo(() => {
    if (!game || !player) return false;
    return game.teams.splatSquad.players.some(p => p.id === player.id) || game.teams.inkMasters.players.some(p => p.id === player.id);
  }, [game, player]);

  useEffect(() => {
    if (context?.loading) return;
    if (!player) {
        router.push('/');
        return;
    };
    if (!game) return;

    if (game.status === 'finished') {
      router.push('/game');
      return;
    }

    if (game.status === 'playing' && playerIsInTeam) {
      router.push('/game');
    }
  }, [player, game, router, context, playerIsInTeam]);

  const playerHasVoted = useMemo(() => {
    if (!game || !player) return false;
    return game.votes[15].includes(player.id) || game.votes[30].includes(player.id);
  }, [game, player]);

  const isPlayerReady = useMemo(() => {
    if (!game || !player) return false;
    return game.readyPlayers.includes(player.id);
  }, [game, player]);
  
  const totalPlayersInTeams = useMemo(() => {
      if (!game) return 0;
      return game.teams.splatSquad.players.length + game.teams.inkMasters.players.length;
  }, [game]);

  if (!game || !player || context?.loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Carregando configuração do jogo...</p>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="container mx-auto min-h-screen p-4 md:p-8 animate-in fade-in duration-500">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tighter text-primary">Configuração do Jogo</h1>
          <p className="text-xl text-muted-foreground mt-2">
            {game.status === 'setup'
              ? 'Monte suas equipes e prepare-se para a batalha!'
              : 'Uma partida está em andamento. Você pode acompanhar o lobby como espectador.'}
          </p>
        </header>

        {game.status === 'playing' && !playerIsInTeam && (
          <Alert className="mb-8 border-primary/50 bg-primary/10">
            <Gamepad2 className="h-5 w-5" />
            <AlertTitle>Partida em andamento</AlertTitle>
            <AlertDescription>
              Você está como espectador enquanto a partida atual acontece. Aguarde o término do jogo para entrar em uma equipe ou sinalizar que está pronto.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TeamCard teamId="splatSquad" />
          <TeamCard teamId="inkMasters" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="animate-bounce-in" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Vote className="h-8 w-8 text-accent" />
                Duração do Jogo
              </CardTitle>
              <CardDescription>
                {game.status !== 'setup'
                  ? 'Votações indisponíveis durante uma partida em andamento.'
                  : isPlayerReady
                  ? "Você já está pronto e não pode mais votar."
                  : "Vote na duração da partida. A mais votada vence!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button
                className="w-full h-16 text-2xl transition-transform hover:scale-105"
                onClick={() => voteToStart?.(15)}
                disabled={playerHasVoted || isPlayerReady || game.status !== 'setup'}
              >
                15 Minutos
                <div className="ml-2 flex items-center text-sm bg-background/50 rounded-full px-2 py-1">
                  <Users className="h-4 w-4 mr-1"/> {game.votes[15].length}
                </div>
              </Button>
              <Button
                className="w-full h-16 text-2xl transition-transform hover:scale-105"
                onClick={() => voteToStart?.(30)}
                disabled={playerHasVoted || isPlayerReady || game.status !== 'setup'}
              >
                30 Minutos
                 <div className="ml-2 flex items-center text-sm bg-background/50 rounded-full px-2 py-1">
                  <Users className="h-4 w-4 mr-1"/> {game.votes[30].length}
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-bounce-in" style={{ animationDelay: '300ms' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-3xl">
                    <Gamepad2 className="h-8 w-8 text-primary"/>
                    Pronto para Jogar?
                </CardTitle>
                <CardDescription>
                    {game.status === 'setup'
                      ? 'Quando todos os jogadores estiverem prontos, o jogo começará!'
                      : 'O lobby está bloqueado até o final da partida atual.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Button
                    className={cn("w-full h-16 text-2xl transition-transform hover:scale-105", isPlayerReady && "bg-green-600 hover:bg-green-700")}
                    onClick={() => toggleReady?.()}
                    disabled={!playerIsInTeam || game.status !== 'setup'}
                >
                    <CheckCircle className="mr-2 h-8 w-8" />
                    {isPlayerReady ? "Pronto!" : "Estou Pronto"}
                </Button>
                 <div className="text-center text-muted-foreground font-semibold">
                    <span className="text-foreground font-bold">{game.readyPlayers.length}</span> de <span className="text-foreground font-bold">{totalPlayersInTeams}</span> jogadores prontos
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientOnly>
  );
}
