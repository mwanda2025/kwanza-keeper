'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitorização interna
    console.error('App Runtime Error:', error);
  }, [error]);

  return (
    <div className="mobile-container flex items-center justify-center p-6">
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto border-2 border-destructive/20">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight">Opa! Algo correu mal.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed px-4">
            Parece que houve um problema ao carregar alguns recursos da aplicação. Isso pode acontecer devido a uma oscilação na rede.
          </p>
        </div>

        <Button 
          onClick={() => reset()} 
          className="rounded-xl h-12 px-8 font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>

        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em]">
          KwanzaKeeper Recovery System
        </p>
      </div>
    </div>
  );
}
