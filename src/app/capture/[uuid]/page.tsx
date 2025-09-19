'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameContext } from '@/context/GameContext';
import { Loader2, CheckCircle, XCircle, ShieldQuestion } from 'lucide-react';
import ClientOnly from '@/components/client-only';

type CaptureStatus = 'counting' | 'capturing' | 'success' | 'failure' | 'invalid';

export default function CapturePage({ params }: { params: { uuid: string } }) {
  const router = useRouter();
  const context = useContext(GameContext);
  const [countdown, setCountdown] = useState(10);
  const [status, setStatus] = useState<CaptureStatus>('counting');
  
  const { player, game, captureZone, loading } = context || {};
  const zoneId = params.uuid;

  useEffect(() => {
    if (!loading && !player) {
      router.push('/');
      return;
    }
    
    if (!loading && game && game.status !== 'playing') {
      setStatus('failure');
      setTimeout(() => router.push('/game'), 3000);
      return;
    }

    if(status === 'counting' && !loading && game && game.status === 'playing'){
        const interval = setInterval(() => {
            setCountdown(prev => prev - 1);
        }, 1000);
    
        if (countdown <= 0) {
          clearInterval(interval);
          setStatus('capturing');
          handleCapture();
        }
        return () => clearInterval(interval);
    }
  }, [countdown, player, game, loading, router, status]);

  const handleCapture = async () => {
    if (!captureZone || !game) return;

    const zone = game.zones.find(z => z.id === zoneId);
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
  };

  const renderStatus = () => {
    switch (status) {
      case 'counting':
        return (
          <>
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-48 transform -rotate-90">
                <circle className="text-secondary" strokeWidth="20" stroke="currentColor" fill="transparent" r="72" cx="96" cy="96" />
                <circle
                  className="text-primary"
                  strokeWidth="20"
                  strokeDasharray={2 * Math.PI * 72}
                  strokeDashoffset={2 * Math.PI * 72 * (1 - countdown / 10)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="72"
                  cx="96"
                  cy="96"
                />
              </svg>
              <span className="absolute text-6xl font-black">{countdown}</span>
            </div>
            <h1 className="text-3xl font-bold mt-4">Capturando Zona {zoneId.split('-')[1].toUpperCase()}...</h1>
            <p className="text-muted-foreground">Mantenha sua posição!</p>
          </>
        );
      case 'capturing':
        return (
          <>
            <Loader2 className="h-24 w-24 animate-spin text-primary" />
            <h1 className="text-3xl font-bold mt-4">Processando Captura...</h1>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="h-24 w-24 text-green-500" />
            <h1 className="text-3xl font-bold mt-4 text-green-400">Zona Capturada!</h1>
            <p className="text-muted-foreground">Redirecionando de volta para o jogo...</p>
          </>
        );
      case 'already_owned':
        return (
          <>
            <ShieldQuestion className="h-24 w-24 text-blue-500" />
            <h1 className="text-3xl font-bold mt-4 text-blue-400">Zona Já é Sua!</h1>
            <p className="text-muted-foreground">Sua equipe já controla esta zona.</p>
          </>
        );
      case 'failure':
      case 'invalid':
        return (
          <>
            <XCircle className="h-24 w-24 text-red-500" />
            <h1 className="text-3xl font-bold mt-4 text-red-400">
                {status === 'invalid' ? 'QR Code Inválido' : 'Captura Falhou!'}
            </h1>
            <p className="text-muted-foreground">
                {game?.status !== 'playing' ? 'O jogo não está ativo no momento.' : 'Redirecionando de volta para o jogo...'}
            </p>
          </>
        );
    }
  };

  return (
    <ClientOnly>
      <div className="flex min-h-screen flex-col items-center justify-center text-center p-4 animate-in fade-in">
        {renderStatus()}
      </div>
    </ClientOnly>
  );
}
