'use client';

import { useContext } from 'react';
import { GameContext } from '@/context/GameContext';
import type { TeamId } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ColorPicker } from './ColorPicker';
import { Users, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';


interface TeamCardProps {
  teamId: TeamId;
}

export function TeamCard({ teamId }: TeamCardProps) {
  const context = useContext(GameContext);
  const { game, player, joinTeam } = context || {};

  if (!game || !player) return null;

  const team = game.teams[teamId];
  const isPlayerOnThisTeam = team.players.some(p => p.id === player.id);
  const isPlayerReady = game.readyPlayers.includes(player.id);
  const lobbyLocked = game.status !== 'setup';
  const gameInProgress = game.status === 'playing';
  const joinDisabled = isPlayerOnThisTeam || isPlayerReady || lobbyLocked;
  const joinLabel = isPlayerOnThisTeam
    ? 'Você está nesta Equipe'
    : lobbyLocked
    ? gameInProgress ? 'Jogo em andamento' : 'Aguardando reinício'
    : 'Juntar-se à Equipe';

  return (
    <Card className="flex flex-col animate-bounce-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-3xl">
          <div className="w-4 h-8 rounded-full" style={{ backgroundColor: team.color }} />
          {team.name}
        </CardTitle>
        <CardDescription>
          {lobbyLocked
            ? gameInProgress
              ? 'Uma partida está em andamento. Aguarde para entrar após o término.'
              : 'A última partida terminou. Aguarde o reinício para entrar.'
            : 'Selecione a cor da sua equipe e veja quem já entrou.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <h4 className="font-semibold mb-2 text-muted-foreground">Cor da Equipe</h4>
          <ColorPicker teamId={teamId} />
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-muted-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            Jogadores ({team.players.length})
          </h4>
          <div className="space-y-2 min-h-[80px]">
            {team.players.length > 0 ? team.players.map(p => (
              <div key={p.id} className={cn("flex items-center justify-between gap-2 p-2 bg-secondary rounded-md", player.id === p.id && "ring-2 ring-primary")}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-transparent text-xl">{p.emoji}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{p.name}</span>
                </div>
                 {game.readyPlayers.includes(p.id) && (
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold text-sm">Pronto</span>
                  </div>
                )}
              </div>
            )) : <p className="text-sm text-muted-foreground italic text-center pt-4">Nenhum jogador nesta equipe ainda.</p>}
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button
          className="w-full h-12 text-lg transition-transform hover:scale-105"
          onClick={() => joinTeam?.(teamId)}
          disabled={joinDisabled}
          style={{
            backgroundColor: isPlayerOnThisTeam ? team.color : undefined,
            color: isPlayerOnThisTeam ? 'black' : undefined,
          }}
        >
          {joinLabel}
        </Button>
      </div>
    </Card>
  );
}
