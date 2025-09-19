'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Printer, QrCode, LogIn } from 'lucide-react';
import Link from 'next/link';

const NUM_ZONES = 11;

export default function QRCodesAdminPage() {
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // We are now using a fixed base URL
    setBaseUrl('splat-qr.vercel.app');
  }, []);

  const zones = Array.from({ length: NUM_ZONES }, (_, i) => {
    const zoneLetter = String.fromCharCode(97 + i);
    const uuid = 'a1b2c3d4e5f6g7h8i9j0' + zoneLetter;
    return {
      id: `zone-${zoneLetter}`,
      url: `https://splat-qr.vercel.app/capture/${uuid}`,
      uuid: uuid
    };
  });

  const loginUrl = `https://${baseUrl}/login`;
  
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
          .qr-card {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto no-print">
         <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-primary flex items-center gap-3"><QrCode/> QR Codes Admin</h1>
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
     
      <div id="print-area" className="max-w-7xl mx-auto">
         <h1 className="text-3xl font-bold text-center mb-6 print:visible hidden">SplatQR QR Codes</h1>
        
         <div className="grid grid-cols-1 xl:grid-cols-[3fr_1fr] gap-6">
            <Card className="qr-card">
                <CardHeader>
                    <CardTitle>QR Codes de Zona</CardTitle>
                    <CardDescription>Imprima e coloque estes na sua área de jogo.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {zones.map(zone => (
                        <div key={zone.id} className="flex flex-col items-center text-center gap-2 p-4 border rounded-lg bg-card qr-card">
                            <h3 className="font-bold text-xl">Zona {zone.id.split('-')[1].toUpperCase()}</h3>
                            <div className="bg-white p-2 rounded-md">
                                <QRCodeSVG value={zone.url} size={128} />
                            </div>
                            <p className="font-mono text-xs break-all">{zone.url}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card className="qr-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><LogIn/> Login Rápido</CardTitle>
                    <CardDescription>Escaneie para entrar no jogo com um perfil aleatório.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center gap-4 p-6">
                    <div className="bg-white p-4 rounded-lg">
                         <QRCodeSVG value={loginUrl} size={192} />
                    </div>
                    <p className="font-mono text-sm break-all">{loginUrl}</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
