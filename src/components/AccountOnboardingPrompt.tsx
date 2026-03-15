
"use client";

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ShieldCheck, X, Cloud, ArrowRight } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { useUser } from '@/firebase';

interface AccountOnboardingPromptProps {
  onNavigateToSettings: () => void;
}

/**
 * Componente que sugere a criação de conta após o utilizador registar 5 despesas.
 * Inclui lógica de cooldown para não ser intrusivo.
 */
export function AccountOnboardingPrompt({ onNavigateToSettings }: AccountOnboardingPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { expenses } = useExpenses();
  const { user } = useUser();

  useEffect(() => {
    const realExpensesCount = expenses.filter(e => !e.isDemo).length;
    const dismissedAt = localStorage.getItem('kwanzakeeper_onboarding_dismissed_at');
    
    // Só mostramos se for Guest (sem conta ou anónimo) e tiver 5+ gastos
    const isGuest = !user || user.isAnonymous;
    const hasEnoughData = realExpensesCount >= 5;

    if (isGuest && hasEnoughData) {
      if (!dismissedAt) {
        setIsVisible(true);
      } else {
        // Se foi dispensado, esperar 7 dias para mostrar de novo
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const lastDismissed = parseInt(dismissedAt);
        if (Date.now() - lastDismissed > sevenDaysMs) {
          setIsVisible(true);
        }
      }
    } else {
      setIsVisible(false);
    }
  }, [expenses, user]);

  const handleDismiss = () => {
    localStorage.setItem('kwanzakeeper_onboarding_dismissed_at', Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="px-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-6 bg-primary/10 border-primary/20 relative overflow-hidden rounded-2xl shadow-lg">
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-20 p-1"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-inner">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          
          <div className="space-y-4 w-full">
            <div className="space-y-2">
              <h4 className="text-base font-black uppercase tracking-tight text-foreground">Protege os teus dados</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                Já registaste várias despesas! Cria uma conta gratuita para fazer backup na nuvem e nunca perderes o teu histórico se mudares de telemóvel.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full pt-1">
              <Button 
                size="sm" 
                onClick={onNavigateToSettings}
                className="rounded-xl h-11 text-[10px] font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 w-full"
              >
                Criar Conta Grátis
                <ArrowRight className="h-3 w-3 shrink-0" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleDismiss}
                className="h-10 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/70 hover:text-foreground w-full"
              >
                Continuar sem conta
              </Button>
            </div>
          </div>
        </div>

        {/* Efeito visual de fundo */}
        <Cloud className="absolute -right-6 -bottom-6 h-32 w-32 text-primary/5 -rotate-12 pointer-events-none" />
      </Card>
    </div>
  );
}
