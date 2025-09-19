'use client';

import { useContext, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { GameContext } from '@/context/GameContext';
import ClientOnly from '@/components/client-only';
import { Loader2, Settings } from 'lucide-react';
import { ProgressBar } from '@/components/game/ProgressBar';
import { Timer } from '@/components/game/Timer';
import { TeamPanel } from '@/components/game/TeamPanel';
import { ZoneGrid } from '@/components/game/ZoneGrid';
import { GameOverScreen } from '@/components/game/GameOverScreen';

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const gameId = Array.isArray(params.gameId) ? params.gameId[0] : params.gameId;

  const context = useContext(GameContext);
  const { game, player, user, loading, setGameId } = context || {};

  useEffect(() => {
    if (setGameId && gameId) {
      setGameId(gameId);
    }
  }, [setGameId, gameId]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(`/login?redirectTo=/game/${gameId}`);
      return;
    }
    if (game?.status === 'setup') {
      router.replace(`/setup/${gameId}`);
    }
  }, [loading, user, game, router, gameId]);

  const scores = useMemo(() => {
    if (!game) return { splatSquad: 0, inkMasters: 0 };
    const splatSquadScore = game.zones.filter(z => z.capturedBy === 'splatSquad').length;
    const inkMastersScore = game.zones.filter(z => z.capturedBy === 'inkMasters').length;
    const totalZones = game.zones.length;

    return {
      splatSquad: totalZones > 0 ? (splatSquadScore / totalZones) * 100 : 0,
      inkMasters: totalZones > 0 ? (inkMastersScore / totalZones) * 100 : 0,
    };
  }, [game]);
  
  if (loading || !game || !player || (game.status !== 'playing' && game.status !== 'finished')) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4">Carregando jogo...</p>
      </div>
    );
  }

  return (
    <ClientOnly>
      {game.status === 'finished' && <GameOverScreen />}
      <div className="container mx-auto p-4 md:p-6 min-h-screen flex flex-col">
        <header className="relative text-center mb-4 animate-bounce-in bg-background/60 backdrop-blur-sm p-4 rounded-xl">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-gradient-gold">
            SplatQR
          </h1>
          <Timer />
        </header>

        <main className="flex-grow flex flex-col gap-4">
          <section className="animate-bounce-in" style={{ animationDelay: '100ms' }}>
            <ProgressBar
              splatSquadPercent={scores.splatSquad}
              inkMastersPercent={scores.inkMasters}
              splatSquadColor={game.teams.splatSquad.color}
              inkMastersColor={game.teams.inkMasters.color}
            />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
             <div className="animate-bounce-in md:hidden" style={{ animationDelay: '400ms' }}>
                <ZoneGrid />
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '200ms' }}>
              <TeamPanel teamId="splatSquad" score={scores.splatSquad} />
            </div>
             <div className="animate-bounce-in hidden md:block" style={{ animationDelay: '400ms' }}>
                <ZoneGrid />
            </div>
            <div className="animate-bounce-in" style={{ animationDelay: '300ms' }}>
              <TeamPanel teamId="inkMasters" score={scores.inkMasters} />
            </div>
          </section>
        </main>
        
        <footer className="text-center mt-6">
            <Link href={`/qrcodesadm/${gameId}`} className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center justify-center gap-2">
                <Settings className="h-4 w-4" />
                Painel de QR Codes
            </Link>
        </footer>
      </div>
    </ClientOnly>
  );
}
