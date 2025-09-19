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

    // Se tem jogador, mas não tem jogo, ou se o jogo está em setup, vai para a tela de setup.
    if (!game || game.status === 'setup') {
      router.replace('/setup');
      return;
    }
    
    // Se o jogo já começou ou terminou, vai para a tela do jogo.
    router.replace('/game');

  }, [context, router]);

  return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Carregando...</p>
      </div>
  );
}
