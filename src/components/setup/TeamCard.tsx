'use client';

import { useContext } from 'react';
import { GameContext } from '@/context/GameContext';
import type { TeamId } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ColorPicker } from './ColorPicker';
import { Users } from 'lucide-react';

interface TeamCardProps {
  teamId: TeamId;
}

export function TeamCard({ teamId }: TeamCardProps) {
  const context = useContext(GameContext);
  const { game, player, joinTeam } = context || {};

  if (!game || !player) return null;

  const team = game.teams[teamId];
  const isPlayerOnThisTeam = team.players.some(p => p.id === player.id);

  return (
    <Card className="flex flex-col animate-bounce-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-3xl">
          <div className="w-4 h-8 rounded-full" style={{ backgroundColor: team.color }} />
          {team.name}
        </CardTitle>
        <CardDescription>Select your team's color and see who's joined.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div>
          <h4 className="font-semibold mb-2 text-muted-foreground">Team Color</h4>
          <ColorPicker teamId={teamId} />
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-muted-foreground flex items-center gap-2">
            <Users className="h-5 w-5" />
            Players ({team.players.length})
          </h4>
          <div className="space-y-2 min-h-[80px]">
            {team.players.length > 0 ? team.players.map(p => (
              <div key={p.id} className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-transparent text-xl">{p.emoji}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{p.name}</span>
              </div>
            )) : <p className="text-sm text-muted-foreground italic text-center pt-4">No players on this team yet.</p>}
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button
          className="w-full h-12 text-lg transition-transform hover:scale-105"
          onClick={() => joinTeam?.(teamId)}
          disabled={isPlayerOnThisTeam}
          style={{
            backgroundColor: isPlayerOnThisTeam ? team.color : undefined,
            color: isPlayerOnThisTeam ? 'black' : undefined,
          }}
        >
          {isPlayerOnThisTeam ? "You're on this Team" : 'Join Team'}
        </Button>
      </div>
    </Card>
  );
}
