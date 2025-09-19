'use client';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  const router = useRouter();
  const context = useContext(GameContext);

  useEffect(() => {
    if (context?.loading) {
      return; // Aguarda o carregamento do contexto
    }

    const player = context?.player;
    const game = context?.game;

    if (!player) {
      router.replace('/manual-login');
      return;
    }

    if (!game) {
      router.replace('/setup');
      return;
    }

    if (game.status === 'finished') {
      router.replace('/game');
      return;
    }

    if (game.status === 'playing') {
      const isPlayerInTeam = game.teams.splatSquad.players.some(p => p.id === player.id)
        || game.teams.inkMasters.players.some(p => p.id === player.id);
      router.replace(isPlayerInTeam ? '/game' : '/setup');
      return;
    }

    // status === 'setup'
    router.replace('/setup');

  }, [context, router]);

  return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Carregando...</p>
      </div>
  );
}
