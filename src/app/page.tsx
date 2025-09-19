'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gamepad2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function HomePage() {
  const router = useRouter();
  const [gameId, setGameId] = useState('');
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = () => {
    setIsCreating(true);
    const newGameId = uuidv4().slice(0, 8);
    router.push(`/setup/${newGameId}`);
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId.trim()) {
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'Por favor, insira um código de sala válido.',
      });
      return;
    }
    
    setIsJoining(true);

    try {
      const gameDocRef = doc(db, 'games', gameId.trim());
      const gameDoc = await getDoc(gameDocRef);

      if (gameDoc.exists()) {
        router.push(`/setup/${gameId.trim()}`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Sala não encontrada',
          description: 'Nenhum jogo encontrado com este código. Verifique e tente novamente.',
        });
        setIsJoining(false);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao entrar na sala',
        description: 'Ocorreu um problema ao verificar a sala. Tente novamente.',
      });
      setIsJoining(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <header className="mb-10 text-center">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          SplatQR
        </h1>
        <p className="text-xl text-muted-foreground mt-2">A guerra de tinta com QR Codes está de volta!</p>
      </header>

      <div className="w-full max-w-md space-y-8">
        <Card className="animate-bounce-in border-primary/50 shadow-lg shadow-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl">
              <Gamepad2 className="h-8 w-8" />
              Criar um Novo Jogo
            </CardTitle>
            <CardDescription>Crie uma nova sala e convide seus amigos para a batalha.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleCreateGame} className="w-full h-14 text-xl" disabled={isCreating || isJoining}>
              {isCreating ? 'Criando...' : 'Criar Sala'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="animate-bounce-in" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="text-3xl">Entrar em uma Sala</CardTitle>
            <CardDescription>Já tem um código? Insira abaixo para entrar no jogo.</CardDescription>
          </CardHeader>
          <form onSubmit={handleJoinGame}>
            <CardContent className="space-y-4">
              <Label htmlFor="gameId" className="sr-only">Código da Sala</Label>
              <Input
                id="gameId"
                placeholder="Insira o código da sala"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toLowerCase())}
                className="h-12 text-center text-lg tracking-widest"
                disabled={isJoining || isCreating}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="outline" className="w-full h-14 text-xl" disabled={isJoining || isCreating}>
                {isJoining ? 'Entrando...' : 'Entrar na Sala'}
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
