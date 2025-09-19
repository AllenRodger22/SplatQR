'use client';

import { useContext, useEffect, useState } from 'react';
import { GameContext } from '@/context/GameContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Game } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TimerIcon } from 'lucide-react';

const GAME_ID = 'splattag-main';

export function Timer() {
  const context = useContext(GameContext);
  const { game } = context || {};
  const [remainingTime, setRemainingTime] = useState('00:00');
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    if (!game || !game.gameStartTime || game.status !== 'playing') {
      if (game?.status === 'finished') setRemainingTime('00:00');
      return;
    }

    const interval = setInterval(async () => {
      const startTime = game.gameStartTime!.toDate().getTime();
      const durationMillis = game.gameDuration * 60 * 1000;
      const endTime = startTime + durationMillis;
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setRemainingTime('00:00');
        clearInterval(interval);
        
        const gameDocRef = doc(db, 'games', GAME_ID);
        const currentDoc = game as Game;

        if (currentDoc.status === 'playing') {
            const splatSquadScore = currentDoc.zones.filter(z => z.capturedBy === 'splatSquad').length;
            const inkMastersScore = currentDoc.zones.filter(z => z.capturedBy === 'inkMasters').length;
            let winner: Game['winner'] = null;
            if (splatSquadScore > inkMastersScore) winner = 'splatSquad';
            else if (inkMastersScore > splatSquadScore) winner = 'inkMasters';
            else winner = 'draw';
            
            await updateDoc(gameDocRef, { status: 'finished', winner: winner });
        }
        return;
      }
      
      if (diff <= 10000) setIsEnding(true);

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [game]);

  if (!game || !game.gameStartTime) {
    const duration = game?.gameDuration || 15;
    return (
        <div className="flex items-center justify-center gap-2 text-xl font-bold text-muted-foreground mt-2">
            <TimerIcon className="h-6 w-6" />
            {String(duration).padStart(2, '0')}:00
        </div>
    );
  }

  return (
    <div className={cn(
        "flex items-center justify-center gap-2 text-2xl font-black transition-colors duration-300 mt-2",
        isEnding ? "text-red-500 animate-pulse" : "text-foreground"
    )}>
        <TimerIcon className="h-7 w-7" />
        {remainingTime}
    </div>
  );
}
