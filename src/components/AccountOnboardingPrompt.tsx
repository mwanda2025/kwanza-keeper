'use client';

import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ShieldCheck, Mail, UserPlus, Cloud } from 'lucide-react';
import { useAuth } from '@/firebase';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { AuthForm } from './AuthForm';

/**
 * Minimalist onboarding prompt for unauthenticated users.
 * Focuses exclusively on KwanzaKeeper Cloud Account.
 */
export function AccountOnboardingPrompt() {
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  if (user) return null;

  return (
    <div className="px-1 animate-in fade-in slide-in-from-top-4 duration-700 mb-8">
      <Card className="p-0 border-white/5 relative overflow-hidden rounded-[2rem] shadow-2xl bg-card/40 backdrop-blur-xl">
        <div className="premium-gradient p-8 flex flex-col items-center text-center gap-6 relative z-10">
          <div className="w-full max-w-[280px] space-y-3">
            <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
              <div className="space-y-3">
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    onClick={() => setAuthMode('signup')}
                    className="rounded-2xl h-14 text-[11px] font-black uppercase tracking-widest gap-4 shadow-xl shadow-primary/20 w-full active:scale-95 transition-all"
                  >
                    <UserPlus className="h-5 w-5" />
                    Criar Conta Nuvem
                  </Button>
                </DialogTrigger>
                
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    size="lg" 
                    onClick={() => setAuthMode('login')}
                    className="rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest gap-3 border-white/10 bg-background/20 w-full hover:bg-background/40 transition-all"
                  >
                    <Mail className="h-4 w-4" />
                    Fazer Login
                  </Button>
                </DialogTrigger>
              </div>

              <DialogContent className="bg-background border-muted p-0 sm:rounded-[2rem] overflow-hidden">
                <div className="p-6">
                  <AuthForm 
                    initialMode={authMode} 
                    onComplete={() => setIsAuthOpen(false)} 
                  />
                </div>
              </DialogContent>
            </Dialog>

            <div className="flex items-center justify-center gap-2 opacity-50 pt-2">
              <Cloud className="h-3 w-3 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Dados protegidos na tua Nuvem KwanzaKeeper</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
