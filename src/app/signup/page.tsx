'use client';

import { useContext, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PaintRoller } from 'lucide-react';
import ClientOnly from '@/components/client-only';
import { EmojiPicker } from '@/components/login/EmojiPicker';

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useContext(GameContext);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🦑');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const redirectTo = searchParams.get('redirectTo');

  useEffect(() => {
    if (context?.user) {
      router.replace(redirectTo || '/');
    }
  }, [context, router, redirectTo]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (context) {
      setIsSubmitting(true);
      const user = await context.signup(email, password, name, emoji);
      setIsSubmitting(false);
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
     <Card className="w-full max-w-md animate-bounce-in border-2 border-primary/50 shadow-lg shadow-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
          <PaintRoller className="h-8 w-8" />
        </div>
        <CardTitle className="text-4xl">Crie sua Conta</CardTitle>
        <CardDescription>Complete seu perfil para entrar na batalha!</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome de Jogador</Label>
            <Input
              id="name"
              placeholder="ex: Agente 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha (mínimo 6 caracteres)</Label>
             <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Escolha Seu Símbolo</Label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button
            type="submit"
            className="w-full h-14 text-xl font-bold transform hover:scale-105 transition-transform"
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? 'Criando conta...' : 'Criar Conta e Entrar'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href={`/login${redirectTo ? `?redirectTo=${redirectTo}` : ''}`} className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <ClientOnly>
       <Suspense fallback={
         <div className="flex min-h-screen flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
       }>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-500">
          <div className="w-full max-w-md">
            <SignupContent />
          </div>
        </div>
      </Suspense>
    </ClientOnly>
  );
}