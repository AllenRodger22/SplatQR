'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, Home, LogIn, ClipboardList, TimerReset, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ZONE_DEFINITIONS } from '@/lib/zones';

const instructions = [
  'Posicione cada QR code na zona correspondente (A, B, C, ...).',
  'Proteja os códigos com capas plásticas transparentes para evitar reflexos e danos.',
  'Peça que todos os jogadores escaneiem o QR de Login Manual para entrar na sala.',
  'Garanta que todos confirmem presença no lobby para iniciar o cronômetro global.',
];

const monitoringNotes = [
  'O cronômetro global começa automaticamente quando todos os jogadores estiverem prontos.',
  'As capturas e recapturas são registradas em tempo real no Firestore para consulta posterior.',
  'O painel do jogo reflete imediatamente qualquer mudança de controle de zona.',
];

export default function QRCodesAdmPage() {
  const params = useParams();
  const gameId = Array.isArray(params.gameId) ? params.gameId[0] : params.gameId;

  const [baseUrl, setBaseUrl] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const manualLoginUrl = useMemo(() => `${baseUrl}/manual-login?redirectTo=/setup/${gameId}`, [baseUrl, gameId]);
  const zones = useMemo(
    () =>
      ZONE_DEFINITIONS.map((zone) => ({
        ...zone,
        captureUrl: `${baseUrl}/capture/${gameId}/${zone.uuid}`,
      })),
    [baseUrl, gameId]
  );

  const handlePrint = () => {
    window.print();
  };

  if (!isClient || !gameId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-4 md:p-8">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            inset: 0;
            margin: 0 auto;
            width: 100%;
            padding: 0 2rem;
          }
          .no-print {
            display: none !important;
          }
          .qr-card {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="no-print flex flex-col gap-4 rounded-2xl border border-border/40 bg-background/60 p-6 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-black text-primary">
              <QrCode className="h-10 w-10" /> Painel de QR Codes
            </h1>
            <p className="text-sm text-muted-foreground">
              Sala de Jogo: <span className="font-semibold text-foreground">{gameId}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrint} className="h-12">
              <Printer className="mr-2 h-5 w-5" />
              Imprimir tudo
            </Button>
            <Button asChild variant="outline" className="h-12">
              <Link href={`/game/${gameId}`}>
                <Home className="mr-2 h-5 w-5" /> Voltar para o jogo
              </Link>
            </Button>
          </div>
        </header>

        <section className="no-print grid gap-4 lg:grid-cols-2">
          <Card className="border-border/40 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ClipboardList className="h-6 w-6 text-accent" /> Como preparar o jogo
              </CardTitle>
              <CardDescription>Checklist rápido para configurar a arena com segurança.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {instructions.map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TimerReset className="h-6 w-6 text-primary" /> Monitoramento em tempo real
              </CardTitle>
              <CardDescription>Entenda como o cronômetro e o registro de capturas funcionam.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {monitoringNotes.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <div id="print-area" className="space-y-6">
          <h2 className="hidden text-center text-3xl font-bold print:block">QR Codes Oficiais - Sala {gameId}</h2>
          
          <Card className="qr-card bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5 text-accent" /> Login na Sala
              </CardTitle>
              <CardDescription>Escaneie para personalizar nome/avatar e entrar direto nesta sala.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-xl bg-white p-4 shadow-inner">
                <QRCodeSVG value={manualLoginUrl} size={192} />
              </div>
              <p className="font-mono text-xs break-all text-muted-foreground">{manualLoginUrl}</p>
            </CardContent>
          </Card>


          <Card className="qr-card bg-background/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Zonas de captura</CardTitle>
              <CardDescription>Escaneie o código correspondente e aguarde 10 segundos para capturar.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="qr-card flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-card/90 p-4 text-center shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-lg font-bold text-primary">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">
                        {zone.label.split(' ')[1]}
                      </span>
                      <span>{zone.label}</span>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-inner">
                      <QRCodeSVG value={zone.captureUrl} size={148} />
                    </div>
                    <div className="space-y-1 text-xs">
                      <p className="font-mono break-all text-muted-foreground">{zone.captureUrl}</p>
                      <p className="font-semibold text-muted-foreground/80">ID Zona: {zone.uuid}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
