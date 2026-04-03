'use client';

import React, { useState } from 'react';
import { useAuth } from '@/firebase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, LogIn, UserPlus, Sparkles, ShieldCheck } from 'lucide-react';

type AuthMode = 'login' | 'signup';

interface AuthFormProps {
  onComplete?: () => void;
  initialMode?: AuthMode;
}

export function AuthForm({ onComplete, initialMode = 'login' }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  
  const { loginWithEmail, signupWithEmail } = useAuth();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    if (mode === 'signup' && !formData.name) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(formData.email, formData.password);
        toast({ title: "Bem-vindo de volta!", description: "Sessão iniciada com sucesso." });
      } else {
        await signupWithEmail(formData.name, formData.email, formData.password);
        toast({ title: "Conta criada!", description: "Seja bem-vindo ao KwanzaKeeper." });
      }
      onComplete?.();
    } catch (error: any) {
      console.error(error);
      let message = "Ocorreu um erro ao processar a autenticação.";
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "E-mail ou palavra-passe incorretos.";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "Este e-mail já está a ser utilizado.";
      } else if (error.code === 'auth/weak-password') {
        message = "A palavra-passe deve ter pelo menos 6 caracteres.";
      }
      
      toast({ 
        variant: "destructive", 
        title: "Erro de Autenticação", 
        description: message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto border-2 border-primary/20 shadow-xl relative mb-4">
          {mode === 'login' ? <LogIn className="h-8 w-8 text-primary" /> : <UserPlus className="h-8 w-8 text-primary" />}
          <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-foreground uppercase">
          {mode === 'login' ? 'Entrar na Conta' : 'Criar nova conta'}
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
          {mode === 'login' ? 'Gere o teu Kwanza com clareza' : 'Começa hoje o teu controlo financeiro'}
        </p>
      </div>

      <Card className="p-6 bg-card/40 backdrop-blur-xl border-white/5 shadow-2xl rounded-[2rem]">
        <form onSubmit={handleAuth} className="space-y-5">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
                <Input 
                  placeholder="Teu nome" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-background/50 border-white/5 h-12 pl-11 rounded-xl font-bold"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
              <Input 
                type="email"
                placeholder="exemplo@gmail.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="bg-background/50 border-white/5 h-12 pl-11 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Palavra-passe</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
              <Input 
                type="password"
                placeholder="••••••••" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="bg-background/50 border-white/5 h-12 pl-11 rounded-xl font-bold"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-14 rounded-xl font-black uppercase tracking-widest gap-3 shadow-lg shadow-primary/20 active:scale-95 transition-all mt-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'login' ? 'Entrar Agora' : 'Finalizar Registo')}
          </Button>
        </form>
      </Card>

      <div className="text-center">
        <button 
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline transition-all"
        >
          {mode === 'login' ? 'Não tens conta? Regista-te' : 'Já tens conta? Faz login'}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 opacity-40 pt-4">
        <ShieldCheck className="h-3 w-3 text-emerald-500" />
        <span className="text-[7px] font-black uppercase tracking-[0.3em]">Segurança Certificada KwanzaKeeper</span>
      </div>
    </div>
  );
}
