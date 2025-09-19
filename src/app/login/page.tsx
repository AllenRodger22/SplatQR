'use client';

import { useContext, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaintRoller } from 'lucide-react';
import ClientOnly from '@/components/client-only';

function GoogleIcon() {
  return (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}


function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useContext(GameContext);
  
  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    if (context?.user) {
      router.replace(redirectTo || '/');
    }
  }, [context?.user, router, redirectTo]);

  const handleGoogleLogin = async () => {
    if (context) {
      const user = await context.signInWithGoogle();
      if (user) {
        router.push(redirectTo || '/');
      }
    }
  };

  if (context?.loading || context?.user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p>Verificando sessão...</p>
      </div>
    );
  }
  
  return (
     <Card className="w-full max-w-md animate-bounce-in bg-card/80 backdrop-blur-sm border-primary/50 shadow-lg shadow-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
          <PaintRoller className="h-8 w-8" />
        </div>
        <CardTitle className="text-4xl">Login - SplatQR</CardTitle>
        <CardDescription>Use sua conta Google para entrar na batalha!</CardDescription>
      </CardHeader>
      <CardContent>
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-14 text-xl font-bold transform hover:scale-105 transition-transform"
            disabled={context?.loading}
            variant="outline"
          >
            <GoogleIcon />
            {context?.loading ? 'Entrando...' : 'Entrar com Google'}
          </Button>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <ClientOnly>
       <Suspense fallback={
         <div className="flex min-h-screen flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
       }>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-500">
          <div className="w-full max-w-md">
            <LoginContent />
          </div>
        </div>
      </Suspense>
    </ClientOnly>
  );
}
