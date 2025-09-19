'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import ClientOnly from '@/components/client-only';
import { Loader2, Users, Vote, CheckCircle, Gamepad2, Share2, Copy } from 'lucide-react';
import { TeamCard } from '@/components/setup/TeamCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = Array.isArray(params.gameId) ? params.gameId[0] : params.gameId;
  
  const context = useContext(GameContext);
  const { game, player, user, voteToStart, toggleReady, loading, setGameId } = context || {};
  const { toast } = useToast();

  const [gameUrl, setGameUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setGameUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (setGameId && gameId) {
      setGameId(gameId);
    }
  }, [setGameId, gameId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
        router.replace(`/login?redirectTo=/setup/${gameId}`);
        return;
    };
    if (game?.status === 'playing' || game?.status === 'finished') {
      router.replace(`/game/${gameId}`);
    }
  }, [user, game, router, loading, gameId]);

  const playerIsInTeam = useMemo(() => {
    if (!game || !player) return false;
    return game.teams.splatSquad.players.some(p => p.id === player.id) || game.teams.inkMasters.players.some(p => p.id === player.id);
  }, [game, player]);

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

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} Copiado!`,
      description: `Agora você pode compartilhar com seus amigos.`
    });
  }

  if (loading || !game || !player || game.status !== 'setup') {
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
            Monte suas equipes e prepare-se para a batalha!
          </p>
        </header>
        
        <Card className="mb-8 animate-bounce-in border-accent/50 shadow-lg shadow-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl">
              <Share2 className="h-8 w-8" /> Convide seus Amigos
            </CardTitle>
            <CardDescription>
              Compartilhe o código da sala ou o QR code para que outros jogadores possam entrar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Código da Sala</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black tracking-widest text-foreground bg-muted px-4 py-2 rounded-lg">
                    {gameId}
                  </p>
                  <Button variant="outline" size="icon" onClick={() => handleCopy(gameId, 'Código da Sala')}>
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
              </div>
               <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Link Direto</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-muted-foreground bg-muted px-3 py-2 rounded-lg truncate">
                    {gameUrl}
                  </p>
                  <Button variant="outline" size="icon" onClick={() => handleCopy(gameUrl, 'Link')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-inner">
               {gameUrl ? <QRCodeSVG value={gameUrl} size={128} /> : <div className="h-[128px] w-[128px]"><Loader2 className="animate-spin" /></div>}
            </div>
          </CardContent>
        </Card>

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
                {isPlayerReady
                  ? "Você já está pronto e não pode mais votar."
                  : "Vote na duração da partida. A mais votada vence!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Button
                className="w-full h-16 text-2xl transition-transform hover:scale-105"
                onClick={() => voteToStart?.(15)}
                disabled={playerHasVoted || isPlayerReady}
              >
                15 Minutos
                <div className="ml-2 flex items-center text-sm bg-background/50 rounded-full px-2 py-1">
                  <Users className="h-4 w-4 mr-1"/> {game.votes[15].length}
                </div>
              </Button>
              <Button
                className="w-full h-16 text-2xl transition-transform hover:scale-105"
                onClick={() => voteToStart?.(30)}
                disabled={playerHasVoted || isPlayerReady}
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
                    Quando todos os jogadores estiverem prontos, o jogo começará!
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Button
                    className={cn("w-full h-16 text-2xl transition-transform hover:scale-105", isPlayerReady && "bg-green-600 hover:bg-green-700")}
                    onClick={() => toggleReady?.()}
                    disabled={!playerIsInTeam}
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
