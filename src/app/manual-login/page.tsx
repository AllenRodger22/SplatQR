'use client';

import { useContext, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/login/LoginForm';
import ClientOnly from '@/components/client-only';

function ManualLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useContext(GameContext);
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    if (context?.loading) {
      return;
    }
    
    if (context?.player) {
       router.replace(redirectTo || '/');
    } else {
       setIsRedirecting(false);
    }
  }, [context, router, redirectTo]);

  const handleLogin = (name: string, emoji: string) => {
    if (context) {
      context.login(name, emoji);
      router.push(redirectTo || '/');
    }
  };

  if (isRedirecting) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p>Verificando sessão...</p>
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
          <div className="w-full max-w-md">
            <ManualLoginContent />
          </div>
        </div>
      </Suspense>
    </ClientOnly>
  );
}
