'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/login/LoginForm';
import ClientOnly from '@/components/client-only';

export default function ManualLoginPage() {
  const router = useRouter();
  const context = useContext(GameContext);

  useEffect(() => {
    if (context?.player && context.game) {
      if (context.game.status === 'playing' || context.game.status === 'finished') {
        router.push('/game');
      } else if (context.game.status === 'setup') {
        router.push('/setup');
      }
    }
  }, [context, router]);

  const renderContent = () => {
    if (context?.loading) {
      return (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p>Carregando Jogo...</p>
        </div>
      );
    }

    if (context?.player) {
       return (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p>Redirecionando...</p>
        </div>
      );
    }
    
    return <LoginForm />;
  };

  return (
    <ClientOnly>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-500">
        <div className="w-full max-w-md">
          {renderContent()}
        </div>
      </div>
    </ClientOnly>
  );
}
