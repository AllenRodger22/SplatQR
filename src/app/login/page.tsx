'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Loader2, PaintRoller } from 'lucide-react';
import ClientOnly from '@/components/client-only';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const EMOJIS = ['🦑', '🐙', '🎨', '💥', '💦', '🔫', '😈', '😎', '👻', '🔥', '✨', '👑'];
const ADJECTIVES = [
    'Rápido', 'Esperto', 'Corajoso', 'Furtivo', 'Engraçado', 'Elétrico', 'Misterioso', 'Brilhante', 'Sombrio', 'Colorido'
];
const NOUNS = [
    'Lula', 'Polvo', 'Agente', 'Tubarão', 'Dragão', 'Fantasma', 'Ninja', 'Robô', 'Mago', 'Explorador'
];

function generateRandomPlayer() {
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const name = `${adjective} ${noun}`;
    return { name, emoji };
}

export default function LoginPage() {
  const router = useRouter();
  const context = useContext(GameContext);
  const { player, login } = context || {};

  useEffect(() => {
    if (context?.loading || !login) {
      return;
    }

    if (player) {
      router.push('/setup');
      return;
    }

    const { name, emoji } = generateRandomPlayer();
    login(name, emoji);
    router.push('/setup');
  }, [player, login, router, context?.loading]);

  return (
    <ClientOnly>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background animate-in fade-in duration-500">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <PaintRoller className="h-8 w-8" />
                </div>
                <CardTitle className="text-4xl">Bem-vindo ao SplatTag!</CardTitle>
                <CardDescription>Criando seu perfil de jogador...</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p>Redirecionando para o jogo...</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </ClientOnly>
  );
}
