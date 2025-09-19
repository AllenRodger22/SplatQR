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

    if (!context?.player) {
      router.replace('/manual-login');
      return;
    }

    if (context?.game) {
      if (context.game.status === 'playing' || context.game.status === 'finished') {
        router.replace('/game');
      } else { // 'setup'
        router.replace('/setup');
      }
    } else {
        // Se não houver jogo, mas houver jogador, vai para o setup
        router.replace('/setup');
    }

  }, [context, router]);

  return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Carregando...</p>
      </div>
  );
}
