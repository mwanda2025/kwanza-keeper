'use client';

import React, { useState } from 'react';
import { useAuth } from '@/firebase';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { LogOut, LogIn, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { AuthForm } from './AuthForm';

/**
 * Account section for the sidebar. 
 * Minimalist UI focused on direct action.
 * Centralized Firebase Auth implementation (Email/Password).
 */
export function AuthSidebarSection({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Sessão Terminada" });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="mt-auto p-6 border-t border-muted/30">
        <div className="h-10 w-full bg-muted/20 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mt-auto border-t border-muted/30">
      <div className="p-6">
        {user ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-primary/20">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                  {user.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black truncate text-foreground uppercase tracking-tight">
                  {user.displayName || user.email}
                </p>
                <div className="flex items-center gap-1 opacity-60">
                  <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Acesso Seguro</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full h-9 rounded-xl justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-[9px] font-black uppercase tracking-widest border border-muted/30"
            >
              <LogOut className="h-3 w-3" />
              Sair da Conta
            </Button>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-primary/20"
                >
                  <LogIn className="h-4 w-4" />
                  Entrar na Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background border-muted p-0 sm:rounded-[2rem] overflow-hidden">
                <div className="p-6">
                  <AuthForm initialMode="login" onComplete={() => setIsAuthOpen(false)} />
                </div>
              </DialogContent>
            </Dialog>
            <div className="flex items-center justify-center gap-2 opacity-40">
              <ShieldCheck className="h-2.5 w-2.5 text-primary" />
              <span className="text-[7px] font-black uppercase tracking-[0.2em]">Acesso Seguro</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
