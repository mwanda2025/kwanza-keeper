'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ShieldAlert, Code } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string; request?: any };
  reset: () => void;
}) {
  useEffect(() => {
    // Log do erro para monitorização interna
    console.error('App Runtime Error:', error);
  }, [error]);

  const isPermissionError = error.message?.includes('Missing or insufficient permissions');

  return (
    <div className="mobile-container flex items-center justify-center p-6 bg-background">
      <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 max-w-sm w-full">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto border-2 border-destructive/20 relative">
          {isPermissionError ? (
            <ShieldAlert className="h-10 w-10 text-destructive" />
          ) : (
            <AlertTriangle className="h-10 w-10 text-destructive" />
          )}
          <div className="absolute inset-0 rounded-full animate-ping bg-destructive/5" />
        </div>
        
        <div className="space-y-3">
          <h2 className="text-xl font-black uppercase tracking-tight">
            {isPermissionError ? 'Acesso Negado' : 'Opa! Algo correu mal'}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed px-4">
            {isPermissionError 
              ? 'Não tens permissão para realizar esta operação ou aceder a estes dados.' 
              : 'Houve um problema ao carregar os recursos. Isto pode ser uma oscilação na rede ou um erro técnico.'}
          </p>
        </div>

        {/* Detalhes Técnicos para Debug (Apenas em Desenvolvimento) */}
        {error.request && (
          <div className="bg-card/50 border border-white/5 p-4 rounded-2xl text-left space-y-2 overflow-hidden">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase text-muted-foreground mb-1">
              <Code className="h-3 w-3" /> Contexto do Erro
            </div>
            <pre className="text-[10px] font-code text-primary/80 overflow-x-auto whitespace-pre-wrap leading-tight">
              {JSON.stringify({
                path: error.request.path,
                method: error.request.method,
                uid: error.request.auth?.uid || 'não-autenticado'
              }, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Button 
            onClick={() => reset()} 
            className="rounded-2xl h-14 w-full font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/20"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/'}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
          >
            Voltar ao Início
          </Button>
        </div>

        <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em] pt-4">
          KwanzaKeeper Recovery System
        </p>
      </div>
    </div>
  );
}
