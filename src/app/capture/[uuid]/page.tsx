'use client';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import ClientOnly from '@/components/client-only';

type CaptureStatus = 'counting' | 'capturing' | 'success' | 'failure' | 'invalid';

const COUNTDOWN_DURATION = 10_000;

export default function CapturePage({ params }: { params: { uuid: string } }) {
  const router = useRouter();
  const context = useContext(GameContext);
  const [timeLeft, setTimeLeft] = useState(10);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<CaptureStatus>('counting');
  const captureTriggeredRef = useRef(false);

  const { player, game, captureZone, loading } = context || {};

  const zoneLetter = params.uuid.slice(-1);
  const zoneId = `zone-${zoneLetter}`;

  const playerTeamId = useMemo(() => {
    if (!player || !game) return null;
    if (game.teams.splatSquad.players.some((p) => p.id === player.id)) {
      return 'splatSquad' as const;
    }
    if (game.teams.inkMasters.players.some((p) => p.id === player.id)) {
      return 'inkMasters' as const;
    }
    return null;
  }, [game, player]);

  const teamColor = useMemo(() => {
    if (!game || !playerTeamId) {
      return 'hsl(var(--primary))';
    }
    return game.teams[playerTeamId].color;
  }, [game, playerTeamId]);

  useEffect(() => {
    if (loading) return;
    if (!player) {
      router.replace('/manual-login');
    }
  }, [loading, player, router]);

  useEffect(() => {
    if (loading || !player || !game) return;
    if (!playerTeamId) {
      router.replace('/setup');
    }
  }, [loading, player, game, playerTeamId, router]);

  useEffect(() => {
    if (loading || !game) return;
    if (game.status !== 'playing') {
      setStatus('failure');
      const timeout = setTimeout(() => router.push('/game'), 3000);
      return () => clearTimeout(timeout);
    }
  }, [loading, game, router]);

  const handleCapture = useCallback(async () => {
    if (!captureZone || !game) return;

    const zone = game.zones.find((z) => z.id === zoneId);
    if (!zone) {
      setStatus('invalid');
      setTimeout(() => router.push('/game'), 3000);
      return;
    }

    try {
      await captureZone(zoneId);
      setStatus('success');
    } catch {
      setStatus('failure');
    } finally {
      setTimeout(() => router.push('/game'), 3000);
    }
  }, [captureZone, game, router, zoneId]);

  useEffect(() => {
    if (status !== 'counting' || loading || !game || game.status !== 'playing') {
      return;
    }

    captureTriggeredRef.current = false;
    setTimeLeft(10);
    setProgress(0);

    const start = performance.now();
    let animationFrame: number;

    const updateTimer = (now: number) => {
      const elapsed = now - start;
      const remaining = Math.max(0, COUNTDOWN_DURATION - elapsed);

      setTimeLeft(Math.max(0, Math.ceil(remaining / 1000)));
      setProgress(Math.min(1, elapsed / COUNTDOWN_DURATION));

      if (remaining <= 0) {
        if (!captureTriggeredRef.current) {
          captureTriggeredRef.current = true;
          setStatus('capturing');
          handleCapture();
        }
        return;
      }

      animationFrame = requestAnimationFrame(updateTimer);
    };

    animationFrame = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [status, loading, game, handleCapture]);

  const renderStatus = () => {
    switch (status) {
      case 'counting': {
        const zoneLabel = zoneId.split('-')[1]?.toUpperCase();
        const rotation = -90;
        return (
          <>
            <div className="relative flex h-48 w-48 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${teamColor} ${progress * 360}deg, rgba(255,255,255,0.1) ${progress * 360}deg)`,
                  transform: `rotate(${rotation}deg)`,
                  transition: 'background 0.1s linear',
                  boxShadow: `0 0 25px -5px ${teamColor}`,
                }}
              />
              <div className="absolute inset-3 rounded-full bg-background/90 backdrop-blur-sm shadow-inner shadow-black/30" />
              <span className="relative text-6xl font-black drop-shadow-lg">{timeLeft}</span>
            </div>
            <h1 className="mt-6 text-3xl font-bold" style={{ color: teamColor }}>
              Capturando Zona {zoneLabel}...
            </h1>
            <p className="text-muted-foreground">Mantenha a mira no QR Code até o fim!</p>
          </>
        );
      }
      case 'capturing':
        return (
          <>
            <Loader2 className="h-24 w-24 animate-spin text-primary" />
            <h1 className="mt-4 text-3xl font-bold">Processando Captura...</h1>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-24 w-24 text-green-500" />
            <h1 className="mt-4 text-3xl font-bold text-green-400">Zona Capturada!</h1>
            <p className="text-muted-foreground">Redirecionando de volta para o jogo...</p>
          </>
        );
      case 'failure':
      case 'invalid':
        return (
          <>
            <XCircle className="h-24 w-24 text-red-500" />
            <h1 className="mt-4 text-3xl font-bold text-red-400">
              {status === 'invalid' ? 'QR Code Inválido' : 'Captura Falhou!'}
            </h1>
            <p className="text-muted-foreground">
              {game?.status !== 'playing'
                ? 'O jogo não está ativo no momento.'
                : 'Redirecionando de volta para o jogo...'}
            </p>
          </>
        );
    }
  };

  return (
    <ClientOnly>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center animate-in fade-in">
        {renderStatus()}
      </div>
    </ClientOnly>
  );
}
