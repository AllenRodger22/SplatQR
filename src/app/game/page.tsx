'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4">Redirecionando para a página inicial...</p>
    </div>
  );
}
