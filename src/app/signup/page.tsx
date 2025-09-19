'use client';

import { Suspense, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GameContext } from '@/context/GameContext';
import { Loader2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ClientOnly from '@/components/client-only';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SignupContent() {
  const router = useRouter();
  const context = useContext(GameContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      context?.toast({ variant: 'destructive', title: 'As senhas não coincidem!' });
      return;
    }
    if (context) {
      const user = await context.signUpWithEmailAndPassword(email, password);
      if (user) {
        router.push('/manual-login');
      }
    }
  };

  return (
    <Card className="w-full max-w-md animate-bounce-in border-accent/50 bg-card/80 shadow-lg shadow-accent/20 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-accent">
          <UserPlus className="h-8 w-8" />
        </div>
        <CardTitle className="text-4xl">Criar Conta</CardTitle>
        <CardDescription>Junte-se à batalha de tinta do SplatQR!</CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
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
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button
            type="submit"
            className="h-14 w-full text-xl font-bold transition-transform hover:scale-105"
            variant="secondary"
            disabled={context?.loading}
          >
            {context?.loading ? 'Criando...' : 'Criar Conta'}
          </Button>
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
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
      <Suspense
        fallback={
          <div className="flex min-h-screen flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        }
      >
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
          <div className="w-full max-w-md">
            <SignupContent />
          </div>
        </div>
      </Suspense>
    </ClientOnly>
  );
}
