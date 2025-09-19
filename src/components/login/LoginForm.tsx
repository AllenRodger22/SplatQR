'use client';

import { useState, useContext } from 'react';
import { GameContext } from '@/context/GameContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EmojiPicker } from './EmojiPicker';
import { PaintSplatter } from 'lucide-react';

export function LoginForm() {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🦑');
  const context = useContext(GameContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && context) {
      context.login(name.trim(), emoji);
    }
  };

  return (
    <Card className="w-full max-w-md animate-bounce-in border-2 border-primary/50 shadow-lg shadow-primary/20">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
          <PaintSplatter className="h-8 w-8" />
        </div>
        <CardTitle className="text-4xl">SplatTag</CardTitle>
        <CardDescription>Create Your Player Profile</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Player Name</Label>
            <Input
              id="name"
              placeholder="e.g. Agent 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label>Choose Your Symbol</Label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full h-14 text-xl font-bold transform hover:scale-105 transition-transform" disabled={!name.trim()}>
            Join the Fray!
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
