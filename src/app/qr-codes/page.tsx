'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Printer, QrCode } from 'lucide-react';
import Link from 'next/link';

const NUM_ZONES = 11;

export default function QRCodesPage() {
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const zones = Array.from({ length: NUM_ZONES }, (_, i) => ({
    id: `zone-${String.fromCharCode(97 + i)}`,
    url: `${baseUrl}/capture/zone-${String.fromCharCode(97 + i)}`,
  }));

  const loginUrl = `${baseUrl}/`;
  
  const handlePrint = () => {
    window.print();
  };

  if (!baseUrl) {
    return null; // Don't render on server
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
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto no-print">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary flex items-center gap-3"><QrCode/> QR Codes</h1>
            <div className="flex gap-2">
                 <Button onClick={handlePrint} className='h-12'>
                    <Printer className="mr-2 h-5 w-5" />
                    Imprimir Códigos
                </Button>
                <Button asChild variant="outline" className="h-12">
                    <Link href="/game">
                        <Home className="mr-2 h-5 w-5"/>
                        Voltar para o Jogo
                    </Link>
                </Button>
            </div>
         </div>
      </div>
     
      <div id="print-area" className="max-w-4xl mx-auto">
         <h1 className="text-3xl font-bold text-center mb-6 print:visible hidden">SplatTag QR Codes</h1>
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>QR Code de Login</CardTitle>
                <CardDescription>Compartilhe para ajudar novos jogadores a entrar no jogo.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center gap-4">
                 <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG value={loginUrl} size={256} />
                 </div>
                 <p className="font-mono text-sm break-all">{loginUrl}</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>QR Codes de Zona</CardTitle>
                <CardDescription>Imprima e coloque estes na sua área de jogo.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {zones.map(zone => (
                    <div key={zone.id} className="flex flex-col items-center text-center gap-2 p-4 border rounded-lg bg-card">
                        <h3 className="font-bold text-xl">Zona {zone.id.split('-')[1].toUpperCase()}</h3>
                        <div className="bg-white p-2 rounded-md">
                            <QRCodeSVG value={zone.url} size={128} />
                        </div>
                        <p className="font-mono text-xs break-all">{zone.url}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
