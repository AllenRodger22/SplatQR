'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EmojiPicker } from './EmojiPicker';
import { PaintRoller } from 'lucide-react';

export function LoginForm() {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🦑');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const context = useContext(GameContext);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && context) {
      setIsSubmitting(true);
      context.login(name.trim(), emoji);
      router.push('/setup');
    }
  };

  return (
    <Card className="w-full max-w-md animate-bounce-in border-2 border-primary/50 shadow-lg shadow-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
          <PaintRoller className="h-8 w-8" />
        </div>
        <CardTitle className="text-4xl">SplatTag</CardTitle>
        <CardDescription>Crie Seu Perfil de Jogador</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Jogador</Label>
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
            <Label>Escolha Seu Símbolo</Label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full h-14 text-xl font-bold transform hover:scale-105 transition-transform"
            disabled={!name.trim() || isSubmitting}
          >
            Entrar na Batalha!
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
