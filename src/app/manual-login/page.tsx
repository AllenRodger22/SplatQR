'use client';

import { useContext, useEffect } from 'react';
import { useRouter, useSearchParams, Suspense } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/login/LoginForm';
import ClientOnly from '@/components/client-only';

function ManualLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useContext(GameContext);

  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    if (!context?.loading && !context?.user) {
      router.replace('/login');
    }
  }, [context?.user, context?.loading, router]);

  const handleLogin = async (name: string, emoji: string) => {
    if (context && context.user) {
      await context.createPlayerProfile(name, emoji);
      router.push(redirectTo || '/');
    }
  };

  if (context?.loading || !context?.user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (context.player) {
     router.replace(redirectTo || '/');
     return (
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p>Redirecionando...</p>
        </div>
     );
  }

  return <LoginForm onLogin={handleLogin} />;
}


export default function ManualLoginPage() {
  return (
    <ClientOnly>
      <Suspense fallback={
         <div className="flex min-h-screen flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
       }>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-500">
           <ManualLoginContent />
        </div>
      </Suspense>
    </ClientOnly>
  );
}
